import { useSession } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import Notification from "../../components/notification";
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Select,
  FileInput,
  RadioButtonGroup,
  Text,
} from "grommet";
import { connectToDatabase } from "../../lib/mongodb";
import Head from "next/head";
import xml2abc from "xml2abc";
import { useRouter } from "next/router";

export default function CreateTune({ tunebooks }) {
  const defaultTune = {
    musicXmlFiles: "",
    title: "",
    points: 0,
    tunebook_id: tunebooks[0]._id,
    mode: "major",
  };

  const [notification, setNotification] = useState(undefined);
  const [value, setValue] = useState(defaultTune);
  const [loading, setLoading] = useState();
  const [ session, load ] = useSession()

  const router = useRouter();

  if (load) return null
  if (!load && !session) return <p>Bitte loggen Sie sich ein, um auf diese Seite zuzugreifen.</p>

  return (
    <Layout user={session && session.user} loading={loading}>
      <Head>
        {/* Workaround: add jQuery this way globally to make xml2abc work */}
        <script
          src="https://code.jquery.com/jquery-1.12.4.min.js"
          integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="
          crossorigin="anonymous"
        ></script>
      </Head>
      <Box fill align="center" justify="center" gap="large" pad="medium">
        <Heading textAlign="center" margin="none">
          Neue Übungsaufgabe anlegen
        </Heading>

        <Box width="medium">
          <Form
            value={value}
            validate="submit"
            onChange={(nextValue) => {
              setValue(nextValue);
            }}
            onSubmit={({ value }) => {
              setLoading(true);
              let tune = { tunebook_id: value.tunebook_id };
              //Read file input as UTF-8
              value.musicXmlFiles[0].text().then((text) => {
                let xmlDoc = $.parseXML(text);
                let keyElem = $(xmlDoc).find("key");

                if (keyElem.find("mode")) {
                  keyElem
                    .find("mode")
                    .replaceWith($(`<mode>${value.mode}</mode>`));
                } else {
                  keyElem.append($(`<mode>${value.mode}</mode>`));
                }

                const res = xml2abc.vertaal(xmlDoc, { x: 1, p: "", noped: 1, d:16 });
                const errtxt = res[1];
                if (errtxt.length !== 0) {
                  setLoading(false);
                  setNotification({
                    text:
                      "Bei der Konvertierung der .musicxml-Datei ist ein Fehler aufgetreten.",
                    color: "status-error",
                  });
                } else {
                  tune.abc = res[0];
                  //TODO: Fallback if empty
                  tune.title = $(xmlDoc).find("work-title").text();

                  createTune(
                    tune,
                    (data) => {
                      router.push(`/tune/${data._id}/edit`);
                    },
                    () => {
                      setLoading(false);
                      setNotification({
                        text:
                          "Bei der Datenbankanfrage ist ein Fehler aufgetreten",
                        color: "status-error",
                      });
                    }
                  );
                }
              });
            }}
          >
            {session && (
              <FormField label="Kategorie" name="tunebook_id">
                <Select
                  name="tunebook_id"
                  options={tunebooks.filter((tunebook) =>
                    tunebook.permissions.write.some((perm) =>
                      session.user.groups.includes(perm)
                    )
                  )}
                  labelKey="name"
                  valueKey={{ key: "_id", reduce: true }}
                />
              </FormField>
            )}

            <FormField label="Tongeschlecht" name="mode">
              <RadioButtonGroup
                name="mode"
                options={[
                  { value: "major", label: "Dur" },
                  { value: "minor", label: "Moll" },
                ]}
              />
            </FormField>

            <FormField
              label="MusicXML-Datei"
              name="musicXmlFiles"
              validate={(musicXmlFiles) => {
                if (
                  musicXmlFiles[0] &&
                  musicXmlFiles[0].name.slice(-9) !== ".musicxml"
                ) {
                  return "Die ausgewählte Datei ist keine .musicxml-Datei.";
                } else if (!musicXmlFiles[0]) {
                  return "Laden Sie eine Datei hoch.";
                }
                return undefined;
              }}
            >
              <FileInput name="musicXmlFiles" />
            </FormField>

            <Box
              alignContent="end"
              direction="row"
              justify="end"
              margin={{ top: "medium" }}
            >
              <Button
                type="submit"
                label="Erstellen"
                disabled={!value || value.musicXmlFiles.length === 0}
                primary
              />
            </Box>
          </Form>
        </Box>
      </Box>
      {notification && (
        <Notification
          color={notification.color}
          onClose={() => setNotification(undefined)}
          text={notification.text}
          timeout={3000}
        />
      )}
    </Layout>
  );
}

async function createTune(tune, onSuccess, onFailure) {
  const res = await fetch("/api/secured/tune", {
    method: "POST",
    body: JSON.stringify(tune),
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
  });
  if (res.status % 200 <= 26) {
    let data = await res.json();
    onSuccess(data);
  } else {
    onFailure();
  }
}

export async function getStaticProps() {
  const { db } = await connectToDatabase();

  const tunebooks = await db
    .collection("tunebooks")
    .find()
    .project({
      tunes: 0,
    })
    .sort({ _id: 1 })
    .toArray();

  return {
    props: {
      tunebooks,
    },
    revalidate: 60,
  };
}
