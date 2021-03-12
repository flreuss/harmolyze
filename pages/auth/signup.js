import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import { Box, Button, Form, FormField, Heading, TextInput } from "grommet";
import Link from "next/link";

export default function SignIn() {
  const [nameError, setNameError] = useState();
  const [value, setValue] = useState({});

  return (
    <Layout>
      <Box fill align="center" justify="center" gap="large">
        <Heading margin="none">Benutzerkonto anlegen</Heading>

        <Box width="medium">
          <Form
            validate="submit"
            onChange={(nextValue) => {
              setNameError(undefined);
              setValue(nextValue);
            }}
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
                    signIn("credentials", {
                      name: value.name,
                      password: value.password,
                      callbackUrl: "/",
                    });
                  }
                  return res.json();
                })
                .then((err) => {
                  //Benutzername existiert bereits
                  if (err && err.code === 11000)
                    setNameError("Der Benutzername ist bereits vergeben.");
                });
            }}
          >
            <FormField
              error={nameError}
              label="Benutzername"
              name="name"
              validate={(name) => {
                if (name.length > 15) {
                  return "Maximal 15 Zeichen zulässig";
                }
                return undefined;
              }}
              required
            >
              <TextInput name="name" type="name" />
            </FormField>

            <FormField label="Passwort" name="password" required>
              <TextInput name="password" type="password" />
            </FormField>

            <FormField
              validate={(password2, value) => {
                if (
                  value.password &&
                  password2 &&
                  value.password !== password2
                ) {
                  return "Die Passwörter stimmen nicht überein";
                }
                return undefined;
              }}
              label="Passwort (Wdh.)"
              name="password2"
              required
            >
              <TextInput name="password2" type="password" />
            </FormField>

            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Link href="/auth/signin" passHref>
                <Button label="Einloggen" secondary />
              </Link>
              <Button
                type="submit"
                label="Registrieren"
                disabled={
                  !value ||
                  !value.name ||
                  !value.password ||
                  !value.password2 ||
                  nameError
                }
                primary
              />
            </Box>
          </Form>
        </Box>
      </Box>
    </Layout>
  );
}
