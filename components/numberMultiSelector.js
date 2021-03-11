import React, { useState } from "react";
import { Box, Text } from "grommet";

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
    <Box direction="row" pad="xsmall" gap="none" justify="stretch" fill="horizontal">
      {options.map((el) => (
        <Field
          value={el}
          onClick={(value) => handleClick(value)}
          selected={values.includes(el)}
          key={el}
        />
      ))}
    </Box>
  );
}

function Field({ value, onClick, selected }) {
  return (
    <Box
      background={selected ? "brand" : "light-2"}
      hoverIndicator={
        selected
          ? {
              color: "brand",
              opacity: true,
            }
          : "light-4"
      }
      pad="xsmall"
      round="xxsmall"
      border
      fill
      onClick={() => onClick(value)}
    >
      <Text textAlign="center">{value.toString()}</Text>
    </Box>
  );
}
