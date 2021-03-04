import React, { useState } from "react";
import { Box, Button, Heading, Layer, Text, Select } from "grommet";

import RiemannFunc from "../lib/riemannFunc";
import NumberSelector from "./numberSelector";
import NumberMultiSelector from "./numberMultiSelector";

export default function RiemannFuncSelectionDialog({
  defaultValue,
  onClose,
  target,
}) {
  const [baseFunc, setBaseFunc] = useState(defaultValue.baseFunc);
  const [addTones, setAddTones] = useState(defaultValue.addTones);
  const [base, setBase] = useState(defaultValue.base);
  const [isSecondaryDominant, setIsSecondaryDominant] = useState(
    defaultValue.isSecondaryDominant
  );

  return (
    <Layer
      position="center"
      onClickOutside={() =>
        onClose(new RiemannFunc(baseFunc, addTones, base, isSecondaryDominant))
      }
      onEsc={() =>
        onClose(new RiemannFunc(baseFunc, addTones, base, isSecondaryDominant))
      }
      target={target}
    >
      <Box pad="medium" gap="small">
        <Heading level={3} margin="none">
          Riemann Function
        </Heading>

        <Text>Enter Riemann Function:</Text>

        <NumberMultiSelector
          options={RiemannFunc.validAddTones}
          selected={addTones}
          onChange={(values) => setAddTones(values.sort())}
          max={2}
        />

        <Select
          options={RiemannFunc.validBaseFuncs}
          value={baseFunc}
          onChange={({ option }) => setBaseFunc(option)}
        />

        <NumberSelector
          name="baseSelector"
          options={RiemannFunc.validBaseNotes}
          value={base}
          onChange={(event) => setBase(+event.target.value)}
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
              onClose(
                new RiemannFunc(baseFunc, addTones, base, isSecondaryDominant)
              );
            }}
            primary
          />
        </Box>
      </Box>
    </Layer>
  );
}
