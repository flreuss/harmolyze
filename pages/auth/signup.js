import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import { Box, Button, Form, FormField, Text, TextInput } from "grommet";
import Link from "next/link";

export default function SignIn() {
  const [value, setValue] = useState({});
  const message =
    value.password && value.password2 && value.password !== value.password2
      ? "Passwörter müssen übereinstimmen"
      : undefined;

  return (
    <Layout>
      <Box fill align="center" justify="center">
        <Box width="medium">
          <Form
            onChange={(nextValue) => setValue(nextValue)}
            onSubmit={({ value }) => {
              fetch("/api/signup", {
                method: "POST",
                body: JSON.stringify(value),
                headers: {
                  "Content-type": "application/json",
                },
              })
                .then((res) => {
                  if (res.status === 201) {
                    alert("Benutzer:in wurde angelegt");
                    signIn("credentials", {
                      name: value.name,
                      password: value.password,
                      callbackUrl: "/",
                    });
                  }
                  return res.json();
                })
                .then((json) => {
                  //Benutzername existiert bereits
                  console.error(json);
                });
            }}
          >
            <FormField label="Benutzername" name="name" required>
              <TextInput name="name" type="name" />
            </FormField>

            <FormField label="Passwort" name="password" required>
              <TextInput name="password" type="password" />
            </FormField>

            <FormField label="Passwort (Wdh.)" name="password2" required>
              <TextInput name="password2" type="password" />
            </FormField>

            {message && (
              <Box pad={{ horizontal: "small" }}>
                <Text color="status-error">{message}</Text>
              </Box>
            )}

            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Link href="/api/auth/signin" passHref>
                <Button label="Einloggen" secondary />
              </Link>
              <Button type="submit" label="Registrieren" primary />
            </Box>
          </Form>
        </Box>
      </Box>
    </Layout>
  );
}
