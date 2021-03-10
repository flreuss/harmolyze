import React, { useState } from "react";
import { Box, Button, Heading, Layer, Text } from "grommet";

import RiemannFunc from "../../lib/riemannFunc";
import NumberSelector from "../numberSelector";
import NumberMultiSelector from "../numberMultiSelector";
import SelectionWheel from "./selectionWheel";

export default function RiemannFuncSelectionDialog({
  defaultValue,
  onClose,
  target,
  mode,
}) {
  const [baseFunc, setBaseFunc] = useState(defaultValue.baseFunc);
  const [addTones, setAddTones] = useState(defaultValue.addTones);
  const [base, setBase] = useState(defaultValue.base);
  const [isSecondaryDominant, setIsSecondaryDominant] = useState(
    defaultValue.isSecondaryDominant
  );
  const [missingFundamental, setMissingFundamental] = useState(
    defaultValue.missingFundamental
  );

  const handleClose = () => {
    onClose(
      new RiemannFunc(
        baseFunc,
        addTones,
        base,
        isSecondaryDominant,
        missingFundamental
      )
    );
  };

  return (
    <Layer
      position="center"
      onClickOutside={handleClose}
      onEsc={handleClose}
      target={target}
    >
      <Box pad="medium" gap="medium">
        <Heading level={3} margin="none">
          Riemann Function
        </Heading>

        <NumberMultiSelector
          options={RiemannFunc.validAddTones}
          selected={addTones}
          onChange={(values) => setAddTones(values.sort())}
          max={2}
        />

        <SelectionWheel
          value={
            isSecondaryDominant
              ? `(${baseFunc})`
              : missingFundamental
              ? `/${baseFunc}`
              : baseFunc
          }
          onChange={(val) => {
            setBaseFunc(
              val.startsWith("(")
                ? val.slice(1, -1)
                : val.startsWith("/")
                ? val.slice(1)
                : val
            );
            setIsSecondaryDominant(val.startsWith("("));
            setMissingFundamental(val.startsWith("/"));
          }}
          radius={175}
          mode={mode}
        />

        <NumberSelector
          name="baseSelector"
          options={RiemannFunc.validBaseNotes}
          value={base}
          onChange={(val) => setBase(val)}
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
            onClick={handleClose}
            primary
          />
        </Box>
      </Box>
    </Layer>
  );
}
