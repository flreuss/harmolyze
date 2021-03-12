import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React from "react";
import { Anchor, Box, Button, Form, FormField, TextInput } from "grommet";
import Link from "next/link";

export default function SignIn() {
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
              <Link href="/auth/signup" passHref>
                <Button label="Registrieren" secondary />
              </Link>
              <Button type="submit" label="Einloggen" primary />
            </Box>
            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Anchor
                onClick={() => alert("Legen Sie einen neuen Account an.")}
              >
                Passwort vergessen?
              </Anchor>
            </Box>
          </Form>
        </Box>
      </Box>
    </Layout>
  );
}
