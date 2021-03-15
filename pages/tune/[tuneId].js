import React, { useState } from "react";
import { Box, ResponsiveContext } from "grommet";

import Score from "../../components/score";

import { getInitial, getSolution } from "../../lib/solutions";
import { connectToDatabase } from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";

export default function Tune({
  initialAbcString,
  solutionAbcString,
  tuneId,
  session,
}) {
  const [attempt, setAttempt] = useState({
    startedAt: new Date(),
    completedAt: undefined,
    mistakes: 0,
    user_id: session.user._id,
    tune_id: tuneId,
  });
  const router = useRouter();

  return (
    <Layout session={session} points={router.query.currentPoints || ""}>
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
              onValidate={(mistakes) => {
                let nextAttempt = attempt;
                if (mistakes > 0) {
                  nextAttempt.mistakes += mistakes;
                  setAttempt(nextAttempt);
                } else {
                  nextAttempt.completedAt = new Date();
                  createAttempt(nextAttempt, 
                    //TODO: Show attemptResume page
                    () => router.push("/"));
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
