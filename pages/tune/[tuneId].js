import React, { useEffect, useState } from "react";
import { Box, Meter, ResponsiveContext, Text } from "grommet";

import Score from "../../components/score";

import { getInitial, getSolution } from "../../lib/solutions";
import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { millisToMinutesAndSeconds } from "../../lib/stringUtils";
import { Clock, LinkPrevious, StatusCritical } from "grommet-icons";

export default function Tune({ tune, session }) {
  const [time, setTime] = useState(0);
  const [attempt, setAttempt] = useState({
    startedAt: new Date(),
    completedAt: undefined,
    progress: 0,
    mistakes: 0,
    user_id: session.user._id,
    tune_id: tune._id,
  });
  const router = useRouter();

  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      setTime((millis) => millis + 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  return (
    <Layout
      status={
        <Box direction="row" gap="medium" pad={{ horizontal: "medium", vertical: "small" }}>
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
            <Score
              initialAbcString={getInitial(tune.abc)}
              device={device}
              solutionAbcString={getSolution(tune.abc)}
              onValidate={(newMistakes, progress) => {
                if (newMistakes > 0) {
                  setAttempt((attempt) => ({
                    ...attempt,
                    mistakes: attempt.mistakes + newMistakes,
                    progress,
                  }));
                } else {
                  let newAttempt = attempt;
                  newAttempt.completedAt = new Date();
                  newAttempt.progress = 1;
                  createAttempt(newAttempt, () =>
                    router.push(
                      `/tune/success?tune_title=${tune.title}&mistakes=${attempt.mistakes}&time=${time}`
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
  fetch("/api/secured/attempt", {
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
