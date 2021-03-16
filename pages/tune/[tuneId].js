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

export default function Tune({
  initialAbcString,
  solutionAbcString,
  tuneId,
  session,
}) {
  const [time, setTime] = useState(0);
  const [attempt, setAttempt] = useState({
    startedAt: new Date(),
    completedAt: undefined,
    progress: 0,
    mistakes: 0,
    user_id: session.user._id,
    tune_id: tuneId,
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
    <Layout session={session} score={router.query.score || ""}>
      <Meter
        value={Math.floor(attempt.progress * 100)}
        max={100}
        size="full"
        thickness="small"
      />
      <Box pad="medium" direction="row" justify="end">
        <Text>{millisToMinutesAndSeconds(time)}</Text>
      </Box>
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
      >
        <ResponsiveContext.Consumer>
          {(device) => (
            <Score
              initialAbcString={initialAbcString}
              device={device}
              solutionAbcString={solutionAbcString}
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
                  createAttempt(
                    newAttempt,
                    //TODO: Show attemptResume page
                    () => router.push("/")
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
      { projection: { abc: 1 } }
    );

    return {
      props: {
        initialAbcString: getInitial(tune.abc),
        solutionAbcString: getSolution(tune.abc),
        tuneId: context.params.tuneId,
        session,
      },
    };
  }
}
