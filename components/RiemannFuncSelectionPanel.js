import React, { useState } from "react";
import { Box, Button, Heading, Layer, Text, TextInput } from "grommet";

import RiemannFunc from "../lib/RiemannFunc";

export default function RiemannFuncSelectionPanel(props) {
  const [riemannFunc, setRiemannFunc] = useState(props.defaultValue);

  return (
    <Layer
      position="center"
      onClickOutside={() => props.onClose(riemannFunc)}
      onEsc={() => props.onClose(riemannFunc)}
    >
      <Box pad="medium" gap="small">
        <Heading level={3} margin="none">
          Riemann Function
        </Heading>

        <Text>Enter Riemann Function:</Text>

        <TextInput
          placeholder="baseFunc"
          value={riemannFunc.baseFunc}
          onChange={(event) =>
            setRiemannFunc(
              new RiemannFunc(
                event.target.value,
                riemannFunc.addTones,
                riemannFunc.base,
                riemannFunc.isSecondaryDominant
              )
            )
          }
        />
        <TextInput
          placeholder="base"
          value={riemannFunc.base}
          onChange={(event) => setRiemannFunc(new RiemannFunc(
            riemannFunc.baseFunc,
            riemannFunc.addTones,
            event.target.value,
            riemannFunc.isSecondaryDominant
          ))}
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
              props.onClose(riemannFunc);
            }}
            primary
          />
        </Box>
      </Box>
    </Layer>
  );
}
