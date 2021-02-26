import React, { useState } from "react";
import { Box, Button, Heading, Keyboard, Text, TextInput } from "grommet";

export default function CustomDialogContent(props) {
    const dialog = props.dialog;
    const [value, setValue] = useState(props.defaultValue);
  
    return (
      <Keyboard
        onEnter={() => {
          // Сlose the dialog and return the value
          dialog.close(value);
        }}
        onEsc={() => {
          // Сlose the dialog and return the value
          dialog.close(value);
        }}
      >
        <Box pad="medium" gap="small">
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
};