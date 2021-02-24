import React, { useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Heading, Keyboard, Text, TextInput } from "grommet";
import { CustomDialog, useDialog } from "react-st-modal";

import Score from "../../components/Score";

function CustomDialogContent(props) {
  const dialog = useDialog();
  const [value, setValue] = useState(props.defaultValue);

  return (
    <Keyboard
      onEnter={() => {
        // Сlose the dialog and return the value
        dialog.close(value);
      }}
    >
      <Box pad="medium" gap="small" width="medium">
        <Heading level={3} margin="none">
          Riemann Function
        </Heading>

        <Text>Enter Riemann Function:</Text>

        <TextInput
          placeholder="type here"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Box
          as="footer"
          gap="small"
          direction="row"
          align="center"
          justify="end"
          pad={{ top: "medium", bottom: "small" }}
        >
          <Button
            type="submit"
            label={
              <Text color="white">
                <strong>OK</strong>
              </Text>
            }
            onClick={() => {
              // Сlose the dialog and return the value
              dialog.close(value);
            }}
            primary
          />
        </Box>
      </Box>
    </Keyboard>
  );
}

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
            <CustomDialogContent defaultValue={defaultValue} />
          );
        }}
      />
    </Box>
  );
}

export default Exercise;
