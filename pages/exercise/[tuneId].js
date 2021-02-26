import React from "react";
import { useRouter } from "next/router";
import { Box, ResponsiveContext } from "grommet";
// import { CustomDialog, useDialog } from "react-st-modal";

import Score from "../../components/score";
import RiemannFuncSelectionPanel from "../../components/riemannFuncSelectionPanel";

import { getTunes, getTuneById } from "../../lib/tunes";
import { removeSolutions } from "../../lib/solutions";

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
            // openDialog={async (defaultValue) => {
            //   return await CustomDialog(
            //     <RiemannFuncSelectionPanel
            //       dialog={useDialog()}
            //       defaultValue={defaultValue}
            //     />
            //   );
            // }}
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
      //TODO: #26 add function that extracts initial string from solution following specific rules
      initialAbcString: removeSolutions(getTuneById(params.tuneId).abc),
      solutionAbcString: getTuneById(params.tuneId).abc,
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
