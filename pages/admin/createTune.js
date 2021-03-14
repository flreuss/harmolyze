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
  RangeInput,
  TextInput,
  TextArea,
  Select,
} from "grommet";
import { useRouter } from "next/router";
import { connectToDatabase } from "../../lib/mongodb";

export default function CreateTune({ tunebooks, session }) {
  const defaultValue = {
    abc: "",
    title: "",
    difficulty: 0,
    tunebook_id: tunebooks[0]._id,
  };

  const router = useRouter();
  const [notification, setNotification] = useState(undefined);
  const [value, setValue] = useState(defaultValue);

  return session && session.user.isAdmin ? (
    <Layout>
      <Box fill align="center" justify="center" gap="large">
        <Heading margin="none">Neue Übungsaufgabe anlegen</Heading>

        <Box width="medium">
          <Form
            value={value}
            validate="submit"
            onChange={(nextValue) => {
              setValue(nextValue);
            }}
            onSubmit={({ value }) => {
              fetch("/api/admin/tune", {
                method: "POST",
                body: JSON.stringify(value),
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

            <FormField label="Schwierigkeitsgrad" name="difficulty" required>
              <RangeInput
                name="difficulty"
                min={0}
                max={100}
                step={5}
                onChange={(event) => {
                  const newValue = value;
                  newValue.difficulty = +event.target.value;
                  setValue(newValue);
                }}
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
  ) : (
    <p>Access Denied</p>
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
      .find()
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
