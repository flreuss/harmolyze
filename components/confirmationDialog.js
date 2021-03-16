import { Box, Text, Button, Layer, Heading } from "grommet";
import React from "react";

export default function ConfirmationDialog({
  onConfirm,
  onCancel,
  children,
  heading,
  confirmLabel,
}) {
  return (
    <Layer position="center" onClickOutside={onCancel} onEsc={onCancel}>
      <Box pad="medium" gap="small" width="medium">
        <Heading level={3} margin="none">
          {heading}
        </Heading>
        {children}
        <Box
          as="footer"
          gap="small"
          direction="row"
          align="center"
          justify="end"
          pad={{ top: "medium", bottom: "small" }}
        >
          <Button label="Abbrechen" onClick={onCancel} color="dark-3" />
          <Button
            label={
              <Text color="white">
                <strong>{confirmLabel}</strong>
              </Text>
            }
            onClick={onConfirm}
            primary
            color="status-critical"
          />
        </Box>
      </Box>
    </Layer>
  );
}
