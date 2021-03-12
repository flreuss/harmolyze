import React from "react";
import { Box, ResponsiveContext } from "grommet";

import Score from "../../../../components/score";

import { getInitial, getSolution } from "../../../../lib/solutions";
import { connectToDatabase } from "../../../../lib/mongodb";
import Layout from "../../../../components/layout";
import { getSession } from "next-auth/client";

export default function Exercise({ initialAbcString, solutionAbcString }) {
  return (
    <Layout>
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
      >
        <ResponsiveContext.Consumer>
          {(size) => (
            <Score
              initialAbcString={initialAbcString}
              size={size}
              solutionAbcString={solutionAbcString}
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

    //TODO: Optimize: Aggregieren, sodass nicht bei jeder Anfrage alle Tunes einer Kategorie mitgeschickt werden
    const tunebook = await db.collection("tunebooks").findOne({
      _id: +context.params.tunebookId,
      "tunes.id": context.params.tuneId,
    });
    const tune = tunebook.tunes[+context.params.tuneId];

    return {
      props: {
        initialAbcString: getInitial(tune.abc),
        solutionAbcString: getSolution(tune.abc),
      },
    };
  }
}
