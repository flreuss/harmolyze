import { getSession } from "next-auth/client";
import Layout from "../../components/layout";
import React, { useState } from "react";
import Notification from "../../components/notification";
import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  TextInput,
  Select,
  FileInput,
} from "grommet";
import { connectToDatabase } from "../../lib/mongodb";
import Head from "next/head";
import { calculatePoints } from "../../lib/solutions";
import xml2abc from "xml2abc";

export default function CreateTune({ tunebooks, session }) {
  const defaultTune = {
    musicXmlFiles: "",
    title: "",
    points: 0,
    tunebook_id: tunebooks[0]._id,
  };

  const [notification, setNotification] = useState(undefined);
  const [tune, setTune] = useState(defaultTune);

  return (
    <Layout user={session.user}>
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
            value={tune}
            validate="submit"
            onChange={(nextValue) => {
              setTune(nextValue);
            }}
            onSubmit={({ value: tune }) => {
              //Read file input as UTF-8
              tune.musicXmlFiles[0].text().then((text) => {
                const xmlDoc = $.parseXML(text);
                const res = xml2abc.vertaal(xmlDoc, { x: 1, p: "" });
                const errtxt = res[1];
                if (errtxt.length !== 0) {
                  setNotification({
                    text:
                      "Bei der Konvertierung der .musicxml-Datei ist ein Fehler aufgetreten.",
                    color: "status-error",
                  });
                } else {
                  tune.abc = res[0];
                  //TODO: Fallback if empty
                  tune.title = $(xmlDoc).find("work-title").text();
                  //TODO: TRY-CATCH
                  tune.points = calculatePoints(tune.abc);

                  fetch("/api/secured/tune", {
                    method: "POST",
                    body: JSON.stringify(tune),
                    headers: {
                      "Content-type": "application/json;charset=utf-8",
                    },
                  }).then((res) => {
                    if (res.status === 201) {
                      setNotification({
                        text: `"${tune.title}" wurde erfolgreich angelegt`,
                        color: "status-ok",
                      });
                      setTune(defaultTune);
                    } else {
                      setNotification({
                        text:
                          "Bei der Datenbankanfrage ist ein Fehler aufgetreten",
                        color: "status-error",
                      });
                    }
                  });
                }
              });
            }}
          >
            <FormField label="Kategorie" name="tunebook_id">
              <Select
                name="tunebook_id"
                options={tunebooks}
                labelKey="name"
                valueKey={{ key: "_id", reduce: true }}
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
                disabled={!tune || tune.musicXmlFiles.length === 0}
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

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  } else {
    const { db } = await connectToDatabase();

    const tunebooks = await db
      .collection("tunebooks")
      .find({ "permissions.write": { $in: session.user.groups } })
      .project({
        tunes: 0,
      })
      .sort({ _id: 1 })
      .toArray();

    return {
      props: {
        tunebooks,
        session,
      },
    };
  }
}
