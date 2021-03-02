import React, { useEffect } from "react";
import { FormClose } from "grommet-icons";
import { Box, Button, Layer, Text } from "grommet";

export default function Notification({ onClose, timeout, text }) {
  useEffect(() => {
    setTimeout(onClose, timeout);
  });

  return (
    <Layer
      position="bottom"
      modal={false}
      margin={{ vertical: "medium", horizontal: "small" }}
      onEsc={onClose}
      responsive={false}
      plain
    >
      <Box
        align="center"
        direction="row"
        gap="small"
        justify="between"
        round="medium"
        elevation="medium"
        pad={{ vertical: "xsmall", horizontal: "small" }}
        background="brand"
      >
        <Box align="center" direction="row" gap="xsmall">
          <Text>{text}</Text>
        </Box>
        <Button icon={<FormClose />} onClick={onClose} plain />
      </Box>
    </Layer>
  );
}
