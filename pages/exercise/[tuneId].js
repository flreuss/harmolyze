import React, { useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Heading, Keyboard, Text, TextInput } from "grommet";
import { CustomDialog, useDialog } from "react-st-modal";

import Score from "../../components/Score";
import RiemannFuncSelectionPanel from "../../components/RiemannFuncSelectionPanel";

function Exercise(props) {
  const router = useRouter();
  const { tuneId } = router.query;

  const initialAbcString = props.tuneBook.getTuneById(+tuneId).abc;

  return (
    <Box fill align="center" justify="center">
      <Score
        abcString={initialAbcString}
        openDialog={async (defaultValue) => {
          return await CustomDialog(
            <RiemannFuncSelectionPanel defaultValue={defaultValue} />
          );
        }}
      />
    </Box>
  );
}

export default Exercise;
