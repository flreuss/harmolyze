import React, { useEffect, useState } from "react";
import { Box, Button, Meter, ResponsiveContext, Text } from "grommet";
import InteractiveScore from "../../../components/interactiveScore";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { millisToMinutesAndSeconds } from "../../../lib/stringUtils";
import { Clock, Edit, Previous, StatusCritical } from "grommet-icons";
import { getInitial, getSolution } from "../../../lib/solutions";

export default function DisplayTune({ tune, session, lastAttempt }) {
  const defaultAttempt = {
    progress: 0,
    mistakes: 0,
    user_id: session.user._id,
    tune_id: tune._id,
    abc: getInitial(tune.abc),
    almostSolved: [],
    solved: [],
    showMistakes: false,
    time: 0,
  };

  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(lastAttempt || defaultAttempt);
  const router = useRouter();

  //TODO: Component will unmount, update attempt

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setAttempt((attempt) => ({ ...attempt, time: attempt.time + 1000 }));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [attempt.time]);

  useEffect(() => {
    createAttempt(
      attempt,
      () => {
        //TODO: if completely solved
        if (false)
          router.push(
            `/tune/${tune._id}/success?tune_title=${tune.title}&mistakes=${nextAttempt.mistakes}&time=${nextAttempt.time}`
          );
      },
      () =>
        setNotification("Bei der Datenbankanfrage ist ein Fehler aufgetreten")
    );
  }, [attempt.abc]);

  return (
    <Layout
    homeIcon={<Previous />}
      loading={loading}
      status={
        <Box direction="row" gap="small" align="center">
          <Box direction="row" gap="xsmall">
            <StatusCritical />
            <Text>{attempt.mistakes}</Text>
          </Box>
          <Box direction="row" gap="xsmall">
            <Clock />
            <Text>{millisToMinutesAndSeconds(attempt.time)}</Text>
          </Box>
          {session.user.groups.includes("admin") && (
            <Button
              icon={<Edit />}
              onClick={() => {
                router.push(`/tune/${tune._id}/edit`);
              }}
              hoverIndicator
            />
          )}
        </Box>
      }
      user={session.user}
    >
      <Meter
        value={Math.floor(attempt.progress * 100)}
        max={100}
        size="full"
        thickness="small"
      />
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
      >
        <ResponsiveContext.Consumer>
          {(device) => (
            <InteractiveScore
              abc={attempt.abc}
              //TODO: Move into Score component
              initial={getInitial(tune.abc)}
              solution={getSolution(tune.abc)}
              showMistakes={attempt.showMistakes}
              solved={attempt.solved}
              almostSolved={attempt.almostSolved}
              device={device}
              onChange={(newAbc, [elems, abcjsClass]) => {
                const nextAttempt = {
                  showMistakes: true,
                  mistakes:
                    abcjsClass == "abcjs-mistake"
                      ? attempt.mistakes + 1
                      : attempt.mistakes,
                  //TODO: Wie berechnen jetzt?
                  progress: 0,
                  solved:
                    abcjsClass == "abcjs-solved"
                      ? attempt.solved.concat(elems)
                      : attempt.solved,
                  almostSolved:
                    abcjsClass == "abcjs-almostSolved"
                      ? attempt.almostSolved.concat(elems)
                      : attempt.almostSolved,
                  validatedAt: new Date(),
                  abc: newAbc,
                  tune_id: tune._id,
                };
                setAttempt((attempt) => ({ ...attempt, ...nextAttempt }));
              }}
            />
          )}
        </ResponsiveContext.Consumer>
      </Box>
    </Layout>
  );
}

async function createAttempt(
  attempt,
  onSuccess = () => {},
  onFailure = () => {}
) {
  const res = await fetch("/api/secured/attempt", {
    method: "POST",
    body: JSON.stringify(attempt),
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
  });
  if (res.status % 200 <= 26) {
    onSuccess();
  } else {
    onFailure();
  }
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  } else {
    const { db } = await connectToDatabase();
    let tune = await db.collection("tunes").findOne(
      {
        _id: ObjectId(context.params.tuneId),
      },
      {
        projection: {
          _id: { $toString: "$_id" },
          abc: 1,
          title: 1,
          lastModifiedAt: 1,
        },
      }
    );
    const attempts = await db
      .collection("attempts")
      .find({
        tune_id: ObjectId(context.params.tuneId),
        user_id: session.user._id,
        validatedAt: { $gt: tune.lastModifiedAt },
      })
      .sort({ validatedAt: -1 })
      .project({ _id: 0, tune_id: 0, validatedAt: 0 })
      .toArray();

    const lastAttempt =
      attempts.length > 0 && attempts[0].progress !== 1 ? attempts[0] : null;
    console.log(lastAttempt);
    tune = { _id: tune._id, abc: tune.abc, title: tune.title };

    return {
      props: {
        tune,
        lastAttempt,
        session,
      },
    };
  }
}
