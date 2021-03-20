import React, { useState } from "react";
import { Box, ResponsiveContext } from "grommet";
import InteractiveScore from "../../../components/interactiveScore";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { LinkPrevious } from "grommet-icons";
import { calculatePoints } from "../../../lib/solutions";

export default function Exercise({ tune, session }) {
  const [abc, setAbc] = useState(tune.abc);
  //TODO: Wie Nutzer beim Bearbeiten auf Autosave hinweisen (schauen wie es GoogleDocs macht)?
  const [saving, setSaving] = useState(false);

  return (
    <Layout user={session.user} homeIcon={<LinkPrevious />}>
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
      >
        <ResponsiveContext.Consumer>
          {(device) => (
            <InteractiveScore
              abc={abc}
              showSolution={true}
              device={device}
              onChange={(newAbc) => {
                setAbc(newAbc);
                updateExercise(
                  { ...tune, abc: newAbc, points: calculatePoints(abc) },
                  () => {}
                );
              }}
            />
          )}
        </ResponsiveContext.Consumer>
      </Box>
    </Layout>
  );
}

function updateExercise(exercise, onSuccess) {
  fetch("/api/secured/exercise", {
    method: "PUT",
    body: JSON.stringify(exercise),
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
  const { db } = await connectToDatabase();
  const tune = await db.collection("tunes").findOne(
    {
      _id: ObjectId(context.params.tuneId),
    },
    {
      projection: {
        _id: { $toString: "$_id" },
        abc: 1,
        createdBy: 1,
      },
    }
  );

  if (
    session &&
    (session.user._id === tune.createdBy || session.user.isAdmin)
  ) {
    return {
      props: {
        tune,
        session,
      },
    };
  } else {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }
}
