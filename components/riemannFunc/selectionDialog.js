import React, { useState } from "react";
import { Box, Button, CheckBox, Heading, Layer, Select, Text } from "grommet";
import RiemannFunc, { CondensedFunc } from "../../lib/riemannFunc";
import NumberSelector from "../numberSelector";
import NumberMultiSelector from "../numberMultiSelector";
import SelectionWheel from "./selectionWheel";

export default function RiemannFuncSelectionDialog({
  defaultValue,
  onClose,
  target,
  mode,
  windowSize,
  device,
}) {
  const [riemannFunc, setRiemannFunc] = useState({
    ...defaultValue,
    baseFuncString: defaultValue.baseFunc
      ? defaultValue.baseFunc.short
      : undefined,
  });

  function handleClose() {
    onClose(
      riemannFunc.baseFuncString
        ? typeof riemannFunc.given !== "undefined"
          ? new CondensedFunc(
              riemannFunc.baseFuncString,
              riemannFunc.addTones,
              riemannFunc.base,
              riemannFunc.isSecondaryDominant,
              riemannFunc.incomplete,
              mode,
              riemannFunc.given
            )
          : new RiemannFunc(
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
      responsive={false}
    >
      <Box
        pad={windowSize.height >= 700 ? "large" : "medium"}
        gap={windowSize.height >= 700 ? "medium" : "small"}
      >
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

        {(device === "small" || windowSize.height < 700) &&
        windowSize.width > windowSize.height ? (
          <Select
            labelKey="label"
            valueKey={{ key: "value", reduce: true }}
            options={Object.values(riemannFunc.validBaseFuncs).map(
              (baseFunc) => ({
                label: `${baseFunc.long} (${baseFunc.short})`,
                value: baseFunc.short,
              })
            )}
            value={riemannFunc.baseFuncString}
            onChange={({ option }) =>
              setRiemannFunc((riemannFunc) => ({
                ...riemannFunc,
                baseFuncString: option.value,
              }))
            }
          />
        ) : (
          <SelectionWheel
            lineWidth={
              device === "small"
                ? Math.floor(
                    Math.min(0.6 * windowSize.height, windowSize.width) /
                      2.3 /
                      3.5
                  )
                : Math.floor(
                    Math.min(windowSize.height, windowSize.width) / 5 / 3.5
                  )
            }
            radius={
              device === "small"
                ? Math.floor(
                    Math.min(0.6 * windowSize.height, windowSize.width) / 2.3
                  )
                : Math.floor(Math.min(windowSize.height, windowSize.width) / 5)
            }
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
            mode={mode}
          />
        )}

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

        {typeof riemannFunc.given !== "undefined" && (
          <Box direction="row" align="center" justify="end">
            <CheckBox
              checked={riemannFunc.given}
              label="Vorgegeben?"
              onChange={(event) =>
                setRiemannFunc((riemannFunc) => ({
                  ...riemannFunc,
                  given: event.target.checked,
                }))
              }
            />
          </Box>
        )}

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
