import React, { useEffect, useState } from "react";
import { Box, Meter, ResponsiveContext, Text } from "grommet";
import InteractiveScore from "../../components/interactiveScore";
import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { millisToMinutesAndSeconds } from "../../lib/stringUtils";
import { Clock, LinkPrevious, StatusCritical } from "grommet-icons";
import createPersistedState from "use-persisted-state";
import { getInitial, getSolution } from "../../lib/solutions";

export default function Exercise({ tune, session }) {
  const defaultAttempt = {
    progress: 0,
    mistakes: 0,
    user_id: session.user._id,
    tune_id: tune._id,
    abc: getInitial(tune.abc),
    solved: [],
    showMistakes: false,
  };

  const useTime = createPersistedState(
    `user_${session.user._id}_tune_${tune._id}_time`
  );
  const [time, setTime] = useTime(0);
  const resetTime = () => setTime(0);

  const [loading, setLoading] = useState(false);

  const useAttempt = createPersistedState(
    `user_${session.user._id}_tune_${tune._id}_attempt`
  );
  const [attempt, setAttempt] = useAttempt(defaultAttempt);
  const resetAttempt = () => setAttempt(defaultAttempt);

  const router = useRouter();

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setTime(time + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  return (
    <Layout
      loading={loading}
      status={
        <Box
          direction="row"
          gap="medium"
          pad={{ horizontal: "medium", vertical: "small" }}
        >
          <Box direction="row" gap="xsmall">
            <StatusCritical />
            <Text>{attempt.mistakes}</Text>
          </Box>
          <Box direction="row" gap="xsmall">
            <Clock />
            <Text>{millisToMinutesAndSeconds(time)}</Text>
          </Box>
        </Box>
      }
      homeIcon={<LinkPrevious />}
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
              initial={getInitial(tune.abc)}
              solution={getSolution(tune.abc)}
              showMistakes={attempt.showMistakes}
              solved={attempt.solved}
              device={device}
              onChange={(newAbc) => {
                setAttempt((attempt) => ({
                  ...attempt,
                  abc: newAbc,
                  showMistakes: false,
                }));
              }}
              onValidate={(nextMistakes, nextSolved, nextSolvedArray) => {
                if (nextMistakes > 0) {
                  setAttempt((attempt) => ({
                    ...attempt,
                    showMistakes: true,
                    mistakes: attempt.mistakes + nextMistakes,
                    progress: nextSolved / (nextMistakes + nextSolved),
                    solved: attempt.solved.concat(nextSolvedArray),
                  }));
                } else {
                  setLoading(true);
                  const successfulAttempt = {
                    ...attempt,
                    progress: 1,
                    time: time,
                    completedAt: new Date(),
                  };
                  resetAttempt();
                  resetTime();
                  createAttempt(successfulAttempt, () =>
                    router.push(
                      `/exercise/success?tune_title=${tune.title}&mistakes=${successfulAttempt.mistakes}&time=${successfulAttempt.time}`
                    )
                  );
                }
              }}
            />
          )}
        </ResponsiveContext.Consumer>
      </Box>
    </Layout>
  );
}

function createAttempt(attempt, onSuccess) {
  fetch("/api/secured/successfulAttempt", {
    method: "POST",
    body: JSON.stringify(attempt),
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
  }).then((res) => {
    if (res.status % 200 <= 26) {
      onSuccess();
    } else {
      //setNotification("Bei der Datenbankanfrage ist ein Fehler aufgetreten");
    }
  });
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
    const tune = await db.collection("tunes").findOne(
      {
        _id: ObjectId(context.params.tuneId),
      },
      { projection: { _id: { $toString: "$_id" }, abc: 1, title: 1 } }
    );

    return {
      props: {
        tune,
        session,
      },
    };
  }
}
