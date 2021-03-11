import React from "react";
import { Box, ResponsiveContext } from "grommet";

import Score from "../../components/score";

import { getInitial, getSolution } from "../../lib/solutions";
import { connectToDatabase } from "../../lib/mongodb";

export default function Exercise({ initialAbcString, solutionAbcString }) {
  return (
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
  );
}

export async function getServerSideProps({ params }) {
  const { db } = await connectToDatabase();

  const tune = await db
    .collection("Tunes")
    .findOne(
      { id: params.tuneId },
      { projection: { abc: 1, _id: 0 } }
    );

  return {
    props: {
      initialAbcString: getInitial(tune.abc),
      solutionAbcString: getSolution(tune.abc),
    },
  };
}
