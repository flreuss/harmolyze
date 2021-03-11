import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import { Anchor, Box, Button, Form, FormField, TextInput } from "grommet";

export default function SignIn() {
  const [value, setValue] = useState();

  return (
    <Layout>
      <Box fill align="center" justify="center">
        <Box width="medium">
          <Form
            onChange={(nextValue) => setValue(nextValue)}
            onSubmit={({ value }) => {
              signIn("credentials", {
                name: value.name,
                password: value.password,
                callbackUrl: "/",
              });
            }}
          >
            <FormField label="Benutzername" name="name" required>
              <TextInput name="name" type="name" />
            </FormField>

            <FormField label="Passwort" name="password" required>
              <TextInput name="password" type="password" />
            </FormField>

            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Button
                label="Registrieren"
                onClick={() => {
                  fetch("/api/signup", {
                    method: "POST",
                    body: JSON.stringify(value),
                    headers: {
                      "Content-type": "application/json",
                    },
                  })
                    .then((res) => {
                        if(res.status === 201) {
                            alert("Benutzer:in wurde angelegt");
                            //TODO: Submit form automatically
                        }
                    })
                }}
              />
              <Button type="submit" label="Einloggen" primary />
            </Box>
            <Box direction="row" justify="between" margin={{ top: "medium" }}>
                <Anchor onClick={() => alert("Legen Sie einen neuen Account an.")}>Passwort vergessen?</Anchor>
            </Box>
          </Form>
        </Box>
      </Box>
    </Layout>
  );
}
