import { signIn } from "next-auth/react";
import Layout from "../../components/layout";
import React, { useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Form,
  FormField,
  Heading,
  TextInput,
  Footer
} from "grommet";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

export default function SignIn() {
  const [unauthorized, setUnauthorized] = useState();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [value, setValue] = useState({
    name: router.query.name || "",
    password: "",
  });

  return (
    <Layout loading={loading} footer={ <Footer background="light-4" justify="center" pad="small">
    <Link href="/credits">Impressum</Link>
  </Footer>}>
      <Head>
        <title>HarmoLyze - Einloggen</title>
      </Head>
      <Box fill pad="medium" align="center" justify="center" gap="large">
        <Heading margin="none">Einloggen</Heading>
        <Box width="medium">
          <Form
            value={value}
            validate="submit"
            onChange={(nextValue) => {
              setValue(nextValue);
              setUnauthorized(undefined);
            }}
            onSubmit={({ value }) => {
              setLoading(true);
              signIn("credentials", {
                name: value.name,
                password: value.password,
                redirect: false,
              }).then((res) => {
                if (res.ok) {
                  router.push("/");
                } else {
                  setLoading(false);
                  setUnauthorized(
                    "Überprüfen Sie die eingegebenen Zugangsdaten."
                  );
                }
              });
            }}
          >
            <FormField
              error={unauthorized}
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

            <FormField
              error={unauthorized}
              label="Passwort"
              name="password"
              required
            >
              <TextInput name="password" type="password" />
            </FormField>

            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Link
                href={`/auth/signup?name=${value.name ? value.name : ""}`}
                passHref
              >
                <Button label="Registrieren" secondary />
              </Link>
              <Button
                type="submit"
                label="Einloggen"
                disabled={
                  !value || !value.name || !value.password || unauthorized
                }
                primary
              />
            </Box>
            <Box
              direction="row"
              justify="between"
              margin={{ top: "medium", bottom: "medium" }}
            >
              <Anchor
                onClick={() => alert("Bitte sende eine E-Mail mit deinem Benutzername an: florian.reuss@uni-potsdam.de")}
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
