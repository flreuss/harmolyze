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
  const [riemannFunc, setRiemannFunc] = useState({
    ...defaultValue,
    baseFuncString: defaultValue.baseFunc ? defaultValue.baseFunc.short : undefined,
  });

  function handleClose() {
    onClose(
      riemannFunc.baseFuncString
        ? new RiemannFunc(
            riemannFunc.baseFuncString,
            riemannFunc.addTones,
            riemannFunc.base,
            riemannFunc.isSecondaryDominant,
            riemannFunc.incomplete,
            mode
          )
        : undefined
    );
  }

  return (
    <Layer
      position="center"
      onClickOutside={handleClose}
      onEsc={handleClose}
      target={target}
      background={{ color: "white", opacity: "strong" }}
    >
      <Box pad="large" gap="medium">
        <Heading level={3} margin="none">
          Riemann Function
        </Heading>

        <NumberMultiSelector
          options={RiemannFunc.validAddTones}
          selected={riemannFunc.addTones}
          onChange={(values) =>
            setRiemannFunc((riemannFunc) => ({
              ...riemannFunc,
              addTones: values.sort(),
            }))
          }
          max={2}
        />

        <SelectionWheel
          value={
            riemannFunc.isSecondaryDominant
              ? `(${riemannFunc.baseFuncString})`
              : riemannFunc.incomplete
              ? `/${riemannFunc.baseFuncString}`
              : riemannFunc.baseFuncString
          }
          onChange={(val) => {
            setRiemannFunc((riemannFunc) => ({
              ...riemannFunc,
              baseFuncString: val.startsWith("(")
                ? val.slice(1, -1)
                : val.startsWith("/")
                ? val.slice(1)
                : val,
              isSecondaryDominant: val.startsWith("("),
              incomplete: val.startsWith("/"),
            }));
          }}
          radius={175}
          mode={mode}
        />

        <NumberSelector
          name="baseSelector"
          options={RiemannFunc.validBaseNotes}
          value={riemannFunc.base}
          onChange={(val) =>
            setRiemannFunc((riemannFunc) => ({
              ...riemannFunc,
              base: val,
            }))
          }
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
