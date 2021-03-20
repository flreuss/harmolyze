import React, { useState } from "react";
import { Box, ResponsiveContext } from "grommet";
import InteractiveScore from "../../../components/interactiveScore";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { LinkPrevious } from "grommet-icons";

export default function Exercise({ tune, session }) {
  const [loading, setLoading] = useState(false);
  const [abc, setAbc] = useState(tune.abc);
  const router = useRouter();

  return (
    <Layout loading={loading} user={session.user} homeIcon={<LinkPrevious />}>
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
              }}
            />
          )}
        </ResponsiveContext.Consumer>
      </Box>
    </Layout>
  );
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
