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
  editable,
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
      {editable ? (
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
              riemannFunc={new CondensedFunc()}
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
              gap="small"
            />
          </Tab>
        </Tabs>
      ) : (
        <SelectionPanel
          device={device}
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
          gap={windowSize.height >= 700 ? "medium" : "small"}
        />
      )}

      <Box
        as="footer"
        gap="small"
        direction="row"
        align="center"
        justify="end"
        pad={editable ? "small" : "medium"}
      >
        {editable && (
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
}) {
  return (
    <Box pad={pad} gap={gap}>
      <Heading level={windowSize.height >= 700 ? 4 : 6} margin="none">
        Zusatztöne (max. 2):
      </Heading>
      <NumberMultiSelector
        key={`NumberMultiSelector${uid}`}
        options={RiemannFunc.validAddTones}
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
      {(device === "small" || windowSize.height < 700) &&
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
            setRiemannFunc({
              ...riemannFunc,
              baseFuncString: val.startsWith("(")
                ? val.slice(1, -1)
                : val.startsWith("/")
                ? val.slice(1)
                : val,
              isSecondaryDominant: val.startsWith("("),
              incomplete: val.startsWith("/"),
            });
          }}
          mode={riemannFunc.mode}
        />
      )}

      <Heading level={windowSize.height >= 700 ? 4 : 6} margin="none">
        Basston:
      </Heading>
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
