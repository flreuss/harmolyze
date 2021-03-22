import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Text,
  CardHeader,
  Menu,
  Image,
} from "grommet";
import { useState } from "react";
import { MoreVertical } from "grommet-icons";

export default function TuneCard(props) {
  const [animation, setAnimation] = useState({
    type: "fadeIn",
    size: "medium",
  });

  function anyParentElementHasAriaLabel(target, label) {
    return target.parentElement
      ? target.ariaLabel === label ||
          anyParentElementHasAriaLabel(target.parentElement, label)
      : target.ariaLabel === label;
  }

  function handleClick(event) {
    if (
      !props.disabled &&
      !anyParentElementHasAriaLabel(event.target, "Open Menu")
    ) {
      setAnimation({ type: "pulse", size: "small" });
      props.onClick();
    }
  }

  return (
    <Card
      onClick={(event) => handleClick(event)}
      background="white"
      animation={animation}
    >
      <CardHeader background={props.background}>
          <Text margin="small" truncate size="medium">{props.title}</Text>
        {props.showMenu && (
          <Menu
            icon={<MoreVertical />}
            hoverIndicator
            focusIndicator={false}
            alignSelf="center"
            dropProps={{
              align: { top: "bottom", right: "right" },
              elevation: "xlarge",
            }}
            items={props.menuItems}
          />
        )}
      </CardHeader>

      <CardBody pad={{horizontal: "medium"}}>
        <Image src="/tunebooks/placeholder.png" />
      </CardBody>

      <CardFooter pad="small" justify="end" background={props.background}>
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
