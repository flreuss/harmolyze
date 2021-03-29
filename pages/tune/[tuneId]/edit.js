import React, { useEffect, useState } from "react";
import { Box, Button, ResponsiveContext, Text } from "grommet";
import InteractiveScore from "../../../components/interactiveScore";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../../components/layout";
import { getSession } from "next-auth/client";
import { LinkPrevious, Undo, View } from "grommet-icons";
import { calculatePoints } from "../../../lib/solutions";
import { useRouter } from "next/router";

export default function EditTune({ tune, session }) {
  const [abcHistory, setAbcHistory] = useState([tune.abc]);
  const [lastSaved, setLastSaved] = useState();

  const router = useRouter();

  useEffect(() => {
    updateTune(
      {
        ...tune,
        abc: abcHistory.slice(-1)[0],
        points: calculatePoints(abcHistory.slice(-1)[0]),
      },
      () => {
        setLastSaved(new Date());
      }
    );
  }, [abcHistory]);

  return (
    <Layout
      user={session.user}
      status={
        <Box direction="row" gap="small" align="center">
          {lastSaved && (
            <Text size="small">💾 um {lastSaved.toLocaleTimeString()}</Text>
          )}
          <Button
            disabled={abcHistory.length < 2}
            icon={<Undo />}
            onClick={() => {
              const nextAbcHistory = [...abcHistory];
              nextAbcHistory.pop();
              setAbcHistory(nextAbcHistory);
            }}
          />
          <Button icon={<View />} onClick={() => {router.push(`/tune/${tune._id}`)}} hoverIndicator />
        </Box>
      }
    >
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
      >
        <ResponsiveContext.Consumer>
          {(device) => (
            <InteractiveScore
              abc={abcHistory.slice(-1)[0]}
              showSolution={true}
              device={device}
              onChange={(newAbc) => {
                setAbcHistory((abcHistory) => [...abcHistory, newAbc]);
              }}
            />
          )}
        </ResponsiveContext.Consumer>
      </Box>
    </Layout>
  );
}

function updateTune(tune, onSuccess) {
  fetch("/api/secured/tune", {
    method: "PUT",
    body: JSON.stringify(tune),
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
    (session.user._id === tune.createdBy ||
      session.user.groups.includes("admin"))
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
