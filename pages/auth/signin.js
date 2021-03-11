import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import { Box, Button, Form, FormField, TextInput } from "grommet";

export default function SignIn() {
  const [value, setValue] = useState({});

  return (
    <Layout>
      <Box fill align="center" justify="center">
        <Box width="medium">
          <Form
            value={value}
            onChange={(nextValue) => setValue(nextValue)}
            onSubmit={({ value }) =>
              signIn("credentials", {
                username: value.name,
                password: value.password,
                callbackUrl: "/",
              })
            }
          >
            <FormField label="Benutzername" name="name" required>
              <TextInput name="name" type="name" />
            </FormField>

            <FormField label="Passwort" name="password" required>
              <TextInput name="password" type="password" />
            </FormField>

            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Button type="reset" label="Registrieren (TODO)" />
              <Button type="submit" label="Einloggen" primary />
            </Box>
          </Form>
        </Box>
      </Box>
    </Layout>
  );
}
