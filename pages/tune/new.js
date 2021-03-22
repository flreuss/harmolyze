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
  TextArea,
  Select,
} from "grommet";
import { connectToDatabase } from "../../lib/mongodb";
import { calculatePoints } from "../../lib/solutions";

export default function CreateTune({ tunebooks, session }) {
  const defaultValue = {
    abc: "",
    title: "",
    points: 0,
    tunebook_id: tunebooks[0]._id,
  };

  const [notification, setNotification] = useState(undefined);
  const [value, setValue] = useState(defaultValue);

  return (
    <Layout user={session.user}>
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
            onSubmit={({ value: tune }) => {
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
                    text: "Übungsaufgabe wurde erfolgreich angelegt",
                    color: "status-ok",
                  });
                  setValue(defaultValue);
                } else {
                  setNotification({
                    text: "Bei der Datenbankanfrage ist ein Fehler aufgetreten",
                    color: "status-error",
                  });
                }
              });
            }}
          >
            <FormField label="Titel" name="title" required>
              <TextInput name="title" type="name" />
            </FormField>

            <FormField label="Kategorie" name="tunebook_id">
              <Select
                name="tunebook_id"
                options={tunebooks}
                labelKey="name"
                valueKey={{ key: "_id", reduce: true }}
              />
            </FormField>

            <FormField label="ABC" name="abc">
              <TextArea
                name="abc"
                size="small"
                resize="vertical"
                placeholder="Paste here"
              />
            </FormField>

            <Box
              alignContent="end"
              direction="row"
              justify="between"
              margin={{ top: "medium" }}
            >
              <Button
                type="submit"
                label="Erstellen"
                disabled={!value || !value.title || !value.abc}
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
      .find({ $or: [{ public: !session.user.isAdmin }, { public: true }] })
      .project({
        tunes: 0,
      })
      .toArray();

    return {
      props: {
        tunebooks,
        session,
      },
    };
  }
}
