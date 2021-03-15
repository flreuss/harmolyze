import {
  Box,
  Grid,
  Card,
  CardBody,
  CardFooter,
  Text,
  Stack,
  Button,
} from "grommet";
import { getSession } from "next-auth/client";
import Notification from "../components/notification";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import { connectToDatabase } from "../lib/mongodb";
import { Add, Trash } from "grommet-icons";
import Link from "next/link";
import {synth} from "abcjs";

export default function Home({ tunebooks, session }) {
  const router = useRouter();
  const [notification, setNotification] = useState(undefined);

  useEffect(() => {
    const ctx = synth.activeAudioContext();
    if (ctx && ctx.state === "running") ctx.close();
  });

  return (
    <Layout>
      <Stack anchor="bottom-right" fill>
        <Box
          pad="large"
          background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
          height="100%"
        >
          {tunebooks.map((tunebook) => (
            <Box key={tunebook._id} gap="small">
              <Text>{tunebook.name}</Text>
              <Grid gap="small" columns="small" margin={{ left: "medium" }}>
                {tunebook.tunes_docs.map((tune) => (
                  <Stack anchor="bottom-right" key={tune._id}>
                    <AnimatedCard
                      onClick={() => router.push(`/tune/${tune._id}`)}
                      background="white"
                    >
                      <CardBody pad="small">
                        <Text size="medium">{tune.title}</Text>
                      </CardBody>

                      <CardFooter
                        pad={{ horizontal: "medium", vertical: "small" }}
                      >
                        <Text size="xsmall">Exercise {tune._id}</Text>
                      </CardFooter>
                    </AnimatedCard>
                    { session && session.user.isAdmin && (
                      <Button
                        hoverIndicator
                        icon={<Trash color="status-critical" />}
                        onClick={() => {
                          fetch("/api/secured/tune", {
                            method: "DELETE",
                            body: JSON.stringify(tune),
                            headers: {
                              "Content-type": "application/json;charset=utf-8",
                            },
                          }).then((res) => {
                            if (res.status % 200 <= 26) {
                              router.push("/");
                            } else {
                              setNotification(
                                "Bei der Datenbankanfrage ist ein Fehler aufgetreten"
                              );
                            }
                          });
                        }}
                      />
                    )}
                  </Stack>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
        {session && session.user.isAdmin && (
          <Link href="/admin/createTune" passHref>
            <Box
              round="full"
              overflow="hidden"
              background="brand"
              margin="medium"
            >
              <Button icon={<Add />} hoverIndicator onClick={() => {}} />
            </Box>
          </Link>
        )}
      </Stack>
      {notification && (
        <Notification
          color="status-error"
          onClose={() => setNotification(undefined)}
          text={notification}
          timeout={3000}
        />
      )}
    </Layout>
  );
}

function AnimatedCard(props) {
  const [animation, setAnimation] = useState({
    type: "fadeIn",
    size: "medium",
  });

  return (
    <Card
      {...props}
      animation={animation}
      onClick={() => {
        setAnimation({ type: "pulse", size: "small" });
        props.onClick();
      }}
    >
      {props.children}
    </Card>
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
      .aggregate([
        {
          $lookup: {
            from: "tunes",
            localField: "tunes",
            foreignField: "_id",
            as: "tunes_docs",
          },
        },
        //If you want empty tunebooks to get returned as well, set preserveNullAndEmptyArrays: true
        { $unwind: { path: "$tunes_docs", preserveNullAndEmptyArrays: false } },
        { $sort: { "tunes_docs.difficulty": 1 } },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            tunes_docs: { $push: "$tunes_docs" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .project({
        name: 1,
        "tunes_docs.title": 1,
        "tunes_docs.difficulty": 1,
        "tunes_docs._id": 1,
      })
      .toArray();

    //TODO: Do this in pipeline instead
    for (let tunebook of tunebooks) {
      for (let tune of tunebook.tunes_docs) {
        tune._id = tune._id.toString();
      }
    }

    return {
      props: {
        tunebooks,
        session
      },
    };
  }
}
