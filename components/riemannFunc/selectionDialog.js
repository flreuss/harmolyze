import React, { useState } from "react";
import {
  Box,
  Button,
  CheckBox,
  Heading,
  Layer,
  Select,
  Tab,
  Tabs,
  Text,
} from "grommet";
import RiemannFunc, { CondensedFunc } from "../../lib/riemannFunc";
import NumberSelector from "../numberSelector";
import NumberMultiSelector from "../numberMultiSelector";
import SelectionWheel from "./selectionWheel";
import { Add } from "grommet-icons";

export default function RiemannFuncSelectionDialog({
  defaultValues,
  onClose,
  target,
  windowSize,
  device,
  edit,
  baseFuncTypes,
  selectionWheelDisabled,
  alterations,
}) {
  const [riemannFuncArray, setRiemannFuncArray] = useState(
    defaultValues.map((riemannFunc) => ({
      ...riemannFunc,
      baseFuncString: riemannFunc.baseFunc
        ? riemannFunc.baseFunc.short
        : undefined,
    }))
  );
  const [activeIndex, setActiveIndex] = React.useState(0);

  function handleClose() {
    onClose(
      riemannFuncArray.map((riemannFunc) =>
        riemannFunc.baseFuncString
          ? typeof riemannFunc.given !== "undefined"
            ? new CondensedFunc(
                riemannFunc.mode,
                riemannFunc.baseFuncString,
                riemannFunc.addTones,
                riemannFunc.base,
                riemannFunc.isSecondaryDominant,
                riemannFunc.incomplete,
                riemannFunc.given
              )
            : new RiemannFunc(
                riemannFunc.mode,
                riemannFunc.baseFuncString,
                riemannFunc.addTones,
                riemannFunc.base,
                riemannFunc.isSecondaryDominant,
                riemannFunc.incomplete
              )
          : undefined
      )
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
      {typeof edit !== "undefined" ? (
        <Tabs
          key={riemannFuncArray}
          activeIndex={activeIndex}
          onActive={(nextIndex) => setActiveIndex(nextIndex)}
        >
          {riemannFuncArray.map((riemannFunc, index) => (
            <Tab title={`Option ${index + 1}`} key={`Tab${index}`}>
              <SelectionPanel
                device={device}
                riemannFunc={riemannFunc}
                windowSize={windowSize}
                baseFuncTypes={baseFuncTypes}
                alterations={alterations}
                setRiemannFunc={(riemannFunc) => {
                  let array = [...riemannFuncArray];
                  array[index] = riemannFunc;
                  setRiemannFuncArray(array);
                }}
                uid={index}
                pad={
                  windowSize.height >= 700
                    ? "medium"
                    : { horizontal: "medium", vertical: "small" }
                }
                gap="small"
              />
            </Tab>
          ))}
          <Tab title="Hinzufügen..." icon={<Add />}>
            <SelectionPanel
              device={device}
              baseFuncTypes={baseFuncTypes}
              alterations={alterations}
              riemannFunc={new CondensedFunc(edit)}
              windowSize={windowSize}
              setRiemannFunc={(riemannFunc) => {
                let array = [...riemannFuncArray];
                array.push(riemannFunc);
                setRiemannFuncArray(array);
              }}
              uid={riemannFuncArray.length}
              pad={
                windowSize.height >= 700
                  ? "medium"
                  : { horizontal: "medium", vertical: "small" }
              }
              gap={windowSize.height >= 700 ? "medium" : "small"}
            />
          </Tab>
        </Tabs>
      ) : (
        <SelectionPanel
          device={device}
          selectionWheelDisabled={selectionWheelDisabled}
          alterations={alterations}
          baseFuncTypes={baseFuncTypes}
          riemannFunc={riemannFuncArray[0]}
          windowSize={windowSize}
          setRiemannFunc={(riemannFunc) => {
            let array = [...riemannFuncArray];
            array[0] = riemannFunc;
            setRiemannFuncArray(array);
          }}
          uid={0}
          pad={
            windowSize.height >= 700
              ? "medium"
              : { horizontal: "medium", vertical: "small" }
          }
          gap={windowSize.height >= 800 ? "medium" : "small"}
        />
      )}

      <Box
        as="footer"
        gap="small"
        direction="row"
        align="center"
        justify="end"
        pad={typeof edit !== "undefined" ? "small" : "medium"}
      >
        {typeof edit !== "undefined" && (
          <Button
            color="status-critical"
            primary
            label={
              <Text>
                <strong>Löschen</strong>
              </Text>
            }
            onClick={() => {
              let array = [...riemannFuncArray];
              if (array.length > 1) {
                array.splice(activeIndex, 1);
                setRiemannFuncArray(array);
                setActiveIndex(0);
              } else {
                setRiemannFuncArray([]);
              }
            }}
          />
        )}
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
    </Layer>
  );
}

function SelectionPanel({
  riemannFunc,
  windowSize,
  setRiemannFunc,
  uid,
  device,
  pad,
  gap,
  baseFuncTypes,
  selectionWheelDisabled,
  alterations,
}) {
  return (
    <Box pad={pad} gap={gap}>
      {windowSize.height >= 575 && (
        <Heading level={windowSize.height >= 700 ? 4 : 6} margin="none">
          Zusatztöne (max. 2):
        </Heading>
      )}
      <NumberMultiSelector
        key={`NumberMultiSelector${uid}`}
        options={RiemannFunc.validAddTones(alterations)}
        selected={[...riemannFunc.addTones]}
        onChange={(values) =>
          setRiemannFunc({ ...riemannFunc, addTones: values.sort() })
        }
        max={2}
      />

      {windowSize.height >= 700 && (
        <Heading level={4} margin="none">
          Grundfunktion:
        </Heading>
      )}
      {(device === "small" || windowSize.height < 600) &&
      windowSize.width > windowSize.height ? (
        <Select
          key={`Select${uid}`}
          labelKey="label"
          valueKey={{ key: "value", reduce: true }}
          options={Object.values(riemannFunc.validBaseFuncs).map(
            (baseFunc) => ({
              label: `${baseFunc.long} (${baseFunc.short})`,
              value: baseFunc.short,
            })
          )}
          value={riemannFunc.baseFuncString}
          onChange={({ option }) => {
            setRiemannFunc({
              ...riemannFunc,
              baseFuncString: option.value,
            });
          }}
        />
      ) : (
        <SelectionWheel
          key={`SelectionWheel${uid}`}
          disabled={selectionWheelDisabled}
          baseFuncTypes={baseFuncTypes}
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
              : Math.floor(Math.min(windowSize.height, windowSize.width) / 4.7)
          }
          value={
            riemannFunc.baseFuncString
              ? `${riemannFunc.isSecondaryDominant ? "(" : ""}${
                  riemannFunc.incomplete ? "/" : ""
                }${riemannFunc.baseFuncString}${
                  riemannFunc.isSecondaryDominant ? ")" : ""
                }`
              : undefined
          }
          onChange={(val) => {
            setRiemannFunc({
              ...riemannFunc,
              baseFuncString: /\(?\/?(\w*)\)?/.exec(val)[1],
              isSecondaryDominant: val.startsWith("("),
              incomplete: val.includes("/"),
            });
          }}
          mode={riemannFunc.mode}
        />
      )}

      {windowSize.height >= 575 && (
        <Heading level={windowSize.height >= 700 ? 4 : 6} margin="none">
          Basston:
        </Heading>
      )}
      <NumberSelector
        name="baseSelector"
        options={RiemannFunc.validBaseNotes}
        value={riemannFunc.base}
        onChange={(val) => {
          setRiemannFunc({ ...riemannFunc, base: val });
        }}
      />

      {typeof riemannFunc.given !== "undefined" && (
        <Box direction="row" align="center" justify="end">
          <CheckBox
            checked={riemannFunc.given}
            label="Vorgegeben?"
            onChange={(event) => {
              setRiemannFunc({
                ...riemannFunc,
                given: event.target.checked,
              });
            }}
          />
        </Box>
      )}
    </Box>
  );
}
