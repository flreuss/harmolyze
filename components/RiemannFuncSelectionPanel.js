import React, { useState } from "react";
import { Box, Button, Heading, Layer, Text, TextInput } from "grommet";

export default function RiemannFuncSelectionPanel(props) {
  const [value, setValue] = useState(props.defaultValue);

  return (
    <Layer
      position="center"
      onClickOutside={() =>  props.onClose(value)}
      onEsc={() =>  props.onClose(value)}
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
              props.onClose(value);
            }}
            primary
          />
        </Box>
      </Box>
    </Layer>
  );
}
