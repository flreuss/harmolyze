import React from "react";
import { useRouter } from "next/router";
import { Box, ResponsiveContext } from "grommet";
import { CustomDialog } from "react-st-modal";

import Score from "../../components/Score";
import RiemannFuncSelectionPanel from "../../components/RiemannFuncSelectionPanel";

function Exercise(props) {
  const router = useRouter();
  const { tuneId } = router.query;

  const initialAbcString = props.tuneBook.getTuneById(+tuneId).abc;

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
            openDialog={async (defaultValue) => {
              return await CustomDialog(
                <RiemannFuncSelectionPanel defaultValue={defaultValue} />
              );
            }}
            size={size}
          />
        )}
      </ResponsiveContext.Consumer>
    </Box>
  );
}

export default Exercise;
