import {
    Box,
    Card,
    CardBody,
    CardFooter,
    Text,
    CardHeader,
    Menu,
  } from "grommet";
  import { useState } from "react";
  import {
    MoreVertical,
  } from "grommet-icons";

export default function TuneCard(props) {
  const [animation, setAnimation] = useState({
    type: "fadeIn",
    size: "medium",
  });

  function handleClick() {
    if (!props.disabled) {
      setAnimation({ type: "pulse", size: "small" });
      props.onClick();
    }
  }

  return (
    <Card background="white" animation={animation}>
      <CardHeader background={props.background}>
        <Box
          onClick={handleClick}
          pad={{
            left: "small",
            top: "small",
            bottom: "small",
          }}
        >
          <Text size="medium">{props.title}</Text>
        </Box>
        {props.showMenu && (
          <Menu
            icon={<MoreVertical />}
            hoverIndicator
            focusIndicator={false}
            alignSelf="start"
            dropProps={{
              align: { top: "bottom", right: "right" },
              elevation: "xlarge",
            }}
            items={props.menuItems}
          />
        )}
      </CardHeader>

      <CardBody onClick={handleClick} pad="small">
        ...
      </CardBody>

      <CardFooter
        onClick={handleClick}
        pad="small"
        justify="end"
        background={props.background}
      >
        {props.footerItems.map((item) => (
          <Box
            key={`${props.title}_${item.label}`}
            direction="row"
            gap="xsmall"
          >
            {item.icon}
            <Text>{item.label}</Text>
          </Box>
        ))}
      </CardFooter>
    </Card>
  );
}
