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
import { renderAbc } from "abcjs";
import { getSolution, getInitial } from "../../lib/solutions";
import { NotesVoicesArray } from "../../lib/abcjsUtils";
import RiemannFunc from "../../lib/riemannFunc";

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
              value.points = calculatePoints(value);

              fetch("/api/secured/tune", {
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

function calculatePoints(tune) {
  const solutionVisualObjs = renderAbc("*", getSolution(tune.abc));
  const solutionVoicesArray = new NotesVoicesArray(solutionVisualObjs[0]);
  const keySignature = solutionVisualObjs[0].getKeySignature();

  const initialVisualObjs = renderAbc("*", getInitial(tune.abc));
  const initialVoicesArray = new NotesVoicesArray(initialVisualObjs[0]);

  let points = 0;
  solutionVoicesArray.forEachElem((elem, elemPos) => {
    const initialElem = initialVoicesArray.getElem(elemPos);
    if (elem.abcelem.chord && !initialElem.abcelem.chord) {
      points += Math.min(
        elem.abcelem.chord.map((chord) => {
          const riemannFunc = RiemannFunc.fromString(
            chord.name,
            keySignature.mode
          );
          return riemannFunc.baseFunc.type.points;
        })
      );
    }
  });

  // Multipliziere mit Bonus für erschwerende Faktoren
  //	Wie viele Vorzeichen hat der Tune?
  points *= 1 + 0.2 * keySignature.accidentals.length;
  // Steht der Tune in Dur oder Moll?
  // Moll ist 1.3, weil bei einem Drittel der Grundfunktionen Töne auftreten, die nicht leitereigen sind
  points *= ["m", "min", "minor"].includes(keySignature.mode) ? 1.3 : 1;

  // 	Wie viele verschiedene Stimmen hat der Tune?
  points *= 1 + 0.1 * (solutionVoicesArray.length - 1);

  return Math.round(points / 5) * 5;
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
