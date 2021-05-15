import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Text,
  CardHeader,
  Menu,
  Image,
  Heading,
} from "grommet";
import { useState } from "react";
import { MoreVertical } from "grommet-icons";

export default function TuneCard(props) {
  const [animation, setAnimation] = useState(props.animation || {
    type: "fadeIn",
    size: "medium",
  });

  function anyParentElementHasId(target, id) {
    return target.parentElement
      ? target.id === id || anyParentElementHasId(target.parentElement, id)
      : target.id === id;
  }

  function handleClick(event) {
    if (!anyParentElementHasId(event.target, "tuneCardMenu")) {
      props.onClick(props.disabled);
      if (!props.disabled) setAnimation({ type: "pulse", size: "small" });
    }
  }

  return (
    <Card
      onClick={(event) => handleClick(event)}
      background="white"
      animation={animation}
    >
      <CardHeader background={props.background} gap="none">
        <Heading level="5" margin="small" truncate size="medium">
          {props.title}
        </Heading>
        {props.showMenu && (
          <Menu
            icon={<MoreVertical />}
            id="tuneCardMenu"
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

      <CardBody>
        {props.children}
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
