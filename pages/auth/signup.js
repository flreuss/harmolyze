import { signIn } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  RadioButtonGroup,
  RangeInput,
  Select,
  TextInput,
} from "grommet";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import Avatar from "avataaars";

export default function SignIn({ avatars }) {
  const [nameError, setNameError] = useState();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [value, setValue] = useState({
    name: router.query.name ? router.query.name : "",
    password: "",
    password2: "",
    topLength: "Kopfbedeckung",
    hairColor: 0,
    topType: 1,
    eyeType: 3,
    skinColor: 0,
  });

  const hairColorArray = [
    "Black",
    "BrownDark",
    "Brown",
    "Red",
    "Blonde",
    "BlondeGolden",
    "PastelPink",
    "SilverGray",
  ];

  const eyeTypeArray = [
    "Close",
    "Default",
    "EyeRoll",
    "Happy",
    "Hearts",
    "Wink",
    "Side",
  ];

  const hairTypes = {
    Lang: [
      "LongHairBigHair",
      "LongHairBob",
      "LongHairCurly",
      "LongHairCurvy",
      "LongHairFro",
      "LongHairStraight",
    ],
    Kurz: [
      "ShortHairDreads02",
      "ShortHairShaggyMullet",
      "ShortHairShortCurly",
      "ShortHairShortFlat",
      "ShortHairShortWaved",
      "ShortHairTheCaesar",
    ],
    Kopfbedeckung: [
      "Eyepatch",
      "Hat",
      "WinterHat1",
      "WinterHat2",
      "WinterHat3",
      "WinterHat4",
    ],
  };

  const skinColorArray = [
    "Black",
    "Pale",
    "Yellow",
    "Tanned",
    "Light",
    "Brown",
    "DarkBrown",
  ];

  return (
    <Layout loading={loading}>
      <Head>
        <title>HarmoLyze - Registrieren</title>
      </Head>
      <Box fill pad="medium" align="center" justify="center" gap="large">
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
              setLoading(true);
              createUser(
                {
                  name: value.name,
                  password: value.password,
                  avatar: {
                    skinColor: skinColorArray[value.skinColor],
                    hairColor: hairColorArray[value.hairColor],
                    eyeType: eyeTypeArray[value.eyeType],
                    topType: hairTypes[value.topLength][value.topType],
                  },
                },
                () => {
                  signIn("credentials", {
                    name: value.name,
                    password: value.password,
                    callbackUrl: "/",
                  });
                },
                (err) => {
                  setLoading(false);
                  //Benutzername existiert bereits
                  if (err && err.code === 11000)
                    setNameError("Der Benutzername ist bereits vergeben.");
                  else {
                    setNameError("Ein unbekannter Fehler ist aufgetreten.");
                  }
                }
              );
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

            <FormField label="Avatar - Haarlänge" name="topLength">
              <RadioButtonGroup
                name="topLength"
                options={["Kurz", "Lang", "Kopfbedeckung"]}
              />
            </FormField>

            <FormField
              label={
                value.topLength === "Kopfbedeckung"
                  ? "Avatar - Kopfbedeckung"
                  : "Avatar - Frisur"
              }
              name="topType"
            >
              <RangeInput
                name="topType"
                max={hairTypes[value.topLength].length - 1}
              ></RangeInput>
            </FormField>

            {value.topLength !== "Kopfbedeckung" && (
              <FormField label="Avatar - Haarfarbe" name="hairColor">
                <RangeInput name="hairColor" max={hairColorArray.length - 1} />
              </FormField>
            )}

            <FormField label="Avatar - Augen" name="eyeType">
              <RangeInput name="eyeType" max={eyeTypeArray.length - 1} />
            </FormField>

            <FormField label="Avatar - Hautfarbe" name="skinColor">
              <RangeInput name="skinColor" max={skinColorArray.length - 1} />
            </FormField>

            <Box>
              <Avatar
                style={{ width: "100px", height: "100px" }}
                avatarStyle="Circle"
                hatColor="Black"
                clotheType="Hoodie"
                clotheColor="Heather"
                hairColor={hairColorArray[value.hairColor]}
                topType={hairTypes[value.topLength][value.topType]}
                eyeType={eyeTypeArray[value.eyeType]}
                skinColor={skinColorArray[value.skinColor]}
              />
            </Box>

            <Box
              direction="row"
              justify="between"
              margin={{ top: "medium", bottom: "medium" }}
            >
              <Link href={`/auth/signin?name=${value.name || ""}`} passHref>
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

async function createUser(user, onSuccess, onFailure) {
  const res = await fetch("/api/signup", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
  });

  if (res.status % 200 <= 26) {
    onSuccess();
  } else {
    const err = await res.json();
    onFailure(err);
  }
}
