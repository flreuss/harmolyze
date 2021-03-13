import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Form,
  FormField,
  Heading,
  RadioButtonGroup,
  TextInput,
} from "grommet";
import Link from "next/link";
import { useRouter } from "next/router";
import fs from "fs";
import path from "path";

export default function SignIn({ avatars }) {
  const [nameError, setNameError] = useState();
  const router = useRouter();
  const [value, setValue] = useState({
    name: router.query.name ? router.query.name : "",
    password: "",
    password2: "",
  });

  return (
    <Layout>
      <Box fill align="center" justify="center" gap="large">
        <Heading margin="none">Benutzerkonto anlegen</Heading>

        <Box width="medium">
          <Form
            value={value}
            validate="blur"
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
                  if (res.status % 200 <= 26) {
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

            <FormField
              label="Passwort"
              name="password"
              validate={(name) => {
                if (name.length < 8) {
                  return "Das Passwort sollte min. 8 Zeichen lang sein.";
                }
                return undefined;
              }}
              required
            >
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

            <FormField label="Avatar" name="image">
              <RadioButtonGroup
                name="image"
                direction="row"
                gap="xsmall"
                justify="between"
                options={avatars.map((src) => ({
                  id: `$avatar${src}`,
                  value: src,
                }))}
              >
                {(option, { checked, hover }) => {
                  let props;

                  if (checked)
                    props = {
                      elevation: "large",
                      animation: { type: "pulse", size: "medium" },
                    };
                  else if (hover) props = { elevation: "medium" };
                  else props = {};

                  return <Avatar {...props} src={option.value} />;
                }}
              </RadioButtonGroup>
            </FormField>

            <Box direction="row" justify="between" margin={{ top: "medium" }}>
              <Link
                href={`/auth/signin?name=${value.name ? value.name : ""}`}
                passHref
              >
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

export async function getStaticProps() {
  const avatarDirectory = "public/avatars";

  const avatars = fs
    .readdirSync(path.join(process.cwd(), avatarDirectory))
    .map((filename) => `/avatars/${filename}`);

  return {
    props: { avatars }, // will be passed to the page component as props
  };
}
