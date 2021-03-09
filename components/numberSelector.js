import { Box, RadioButtonGroup, Text } from "grommet";

export default function NumberSelector({ options, value, onChange, name }) {
  return (
    <RadioButtonGroup
      name={name}
      direction="row"
      gap="xsmall"
      justify="between"
      options={options.map((el) => ({
        id: `${name}-input${el}`,
        value: el,
        label: el.toString(),
      }))}
      value={value}
      onChange={event => onChange(+event.target.value)}
    >
      {(option, { checked, hover }) => {
        let background;

        if (checked) background = "brand";
        else if (hover) background = "light-4";
        else background = "light-2";

        return (
          <Box background={background} pad="xsmall" round border>
            <Text>{option.label}</Text>
          </Box>
        );
      }}
    </RadioButtonGroup>
  );
}
