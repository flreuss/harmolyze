import React, { useEffect } from 'react';
import { FormClose } from 'grommet-icons';
import { Box, Button, Layer, Text } from 'grommet';

export default function Notification(props) {
    useEffect(() => {
        setTimeout(props.onClose,props.timeout);
    });

  return (
    <Layer
      position="bottom"
      modal={false}
      margin={{ vertical: "medium", horizontal: "small" }}
      onEsc={props.onClose}
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
          <Text>
            {props.text}
          </Text>
        </Box>
        <Button
          icon={<FormClose />}
          onClick={props.onClose}
          plain
        />
      </Box>
    </Layer>
  );
}
