import React from "react";
import { useRouter } from "next/router";
import { Box, ResponsiveContext } from "grommet";
// import { CustomDialog, useDialog } from "react-st-modal";

import Score from "../../components/score";

import { getTunes, getTuneById } from "../../lib/tunes";
import { getInitial, getSolution } from "../../lib/solutions";

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
            abcString={initialAbcString}
            size={size}
          />
        )}
      </ResponsiveContext.Consumer>
    </Box>
  );
}

export async function getStaticProps({ params }) {
  return {
    props: {
      initialAbcString: getInitial(getTuneById(params.tuneId).abc),
      solutionAbcString: getSolution(getTuneById(params.tuneId).abc),
    },
  };
}

export async function getStaticPaths() {
  const tunes = getTunes();
  return {
    paths: tunes.map((tune) => {
      return {
        params: {
          tuneId: tune.id,
        },
      };
    }),
    fallback: false,
  };
}
