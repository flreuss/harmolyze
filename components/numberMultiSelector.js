import React, { useState } from "react";
import { Box, Text } from "grommet";
import {
  convertObjToString,
  produceRgbShade,
  tinycolor,
} from "../lib/tinycolorUtils";

export default function NumberMultiSelector({
  options,
  selected,
  onChange,
  max,
}) {
  const [values, setValues] = useState(selected);

  function handleClick(value) {
    let newValues = [...values];

    if (newValues.includes(value)) {
      newValues = newValues.filter((val) => val !== value);
    } else if (newValues.length < max) {
      newValues.push(value);
    }

    setValues(newValues);
    onChange(newValues);
  }

  return (
    <Box
      direction="row"
      pad="xsmall"
      gap="none"
      justify="stretch"
      fill="horizontal"
    >
      {options.map((opt) => (
        <Field
          value={opt.value}
          label={opt.label}
          onClick={(value) => handleClick(value)}
          selected={values.includes(opt.value)}
          key={opt.label}
        />
      ))}
    </Box>
  );
}

function Field({ value, onClick, selected, label }) {
  return (
    <Box
      background={selected ? "brand" : "light-2"}
      hoverIndicator={
        selected
          ? {
              color: convertObjToString(produceRgbShade(tinycolor("rgb(125, 76, 219)"), 0.7)),
            }
          : "light-4"
      }
      pad="xsmall"
      round="xxsmall"
      border
      fill
      onClick={() => onClick(value)}
    >
      <Text textAlign="center">{label}</Text>
    </Box>
  );
}
