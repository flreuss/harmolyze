import {
  Box,
  Grid,
  Card,
  CardBody,
  CardFooter,
  Text,
  Stack,
  Button,
  Accordion,
  AccordionPanel,
  Meter,
  CardHeader,
  Menu,
} from "grommet";
import { getSession } from "next-auth/client";
import Notification from "../components/notification";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";
import { connectToDatabase } from "../lib/mongodb";
import {
  Add,
  Clock,
  Edit,
  Money,
  MoreVertical,
  StatusCritical,
  Trash,
} from "grommet-icons";
import Link from "next/link";
import ConfirmationDialog from "../components/confirmationDialog";
import { millisToMinutesAndSeconds } from "../lib/stringUtils";

export default function Home({ tunebooks, session, score }) {
  const router = useRouter();
  const [notification, setNotification] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(undefined);
  const [activeIndex, setActiveIndex] = useState([
    tunebooks.findIndex((tunebook) =>
      tunebook.tunes.some((tune) => !tune.highscore)
    ),
  ]);

  return (
    <Layout
      loading={loading}
      user={session.user}
      status={
        <Box direction="row" gap="xsmall">
          <Money />
          <Text>{score}</Text>
        </Box>
      }
    >
      <Meter
        value={
          tunebooks
            .flatMap((tunebook) => tunebook.tunes)
            .filter((tune) => tune.highscore).length
        }
        max={tunebooks.flatMap((tunebook) => tunebook.tunes).length}
        size="full"
        thickness="small"
      />
      <Stack anchor="bottom-right" fill>
        <Box
          pad="large"
          background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
          height="100%"
        >
          <Accordion
            activeIndex={activeIndex}
            onActive={(newActiveIndex) => setActiveIndex(newActiveIndex)}
          >
            {tunebooks.map((tunebook) => (
              <AccordionPanel
                key={tunebook._id}
                gap="small"
                label={tunebook.name}
              >
                <Grid gap="small" columns="small" margin="medium">
                  {tunebook.tunes.map((tune) => (
                    <Stack anchor="top-right" key={tune._id}>
                      <AnimatedCard
                        onClick={() => {
                          setLoading(true);
                          router.push(`/exercise/${tune._id}`);
                        }}
                        background="white"
                      >
                        <CardHeader
                          background={tune.highscore ? "light-2" : "neutral-3"}
                        >
                          <Box
                            pad={{
                              left: "small",
                              top: "small",
                              bottom: "small",
                            }}
                          >
                            <Text size="medium">{tune.title}</Text>
                          </Box>
                          {(tune.createdBy === session.user._id ||
                            session.user.isAdmin) && (
                            <Menu
                              icon={<MoreVertical />}
                              hoverIndicator
                              focusIndicator={false}
                              alignSelf="start"
                              dropProps={{
                                align: { top: "bottom", right: "right" },
                                elevation: "xlarge",
                              }}
                              items={[
                                {
                                  label: "Löschen",
                                  onClick: () => {
                                    setOpenDeleteDialog({ tune });
                                  },
                                  icon: (
                                    <Box pad={{ right: "medium" }}>
                                      <Trash />
                                    </Box>
                                  ),
                                },
                                {
                                  label: "Bearbeiten",
                                  onClick: () => {
                                    router.push(`/exercise/${tune._id}/edit`);
                                  },
                                  icon: (
                                    <Box pad={{ right: "medium" }}>
                                      <Edit />
                                    </Box>
                                  ),
                                },
                              ]}
                            />
                          )}
                        </CardHeader>

                        <CardBody pad="small">...</CardBody>

                        <CardFooter
                          pad="small"
                          justify="end"
                          background={tune.highscore ? "light-2" : "neutral-3"}
                        >
                          {!tune.highscore && (
                            <Box direction="row" gap="xsmall">
                              <Money />
                              <Text>{tune.points}</Text>
                            </Box>
                          )}
                          {tune.highscore && (
                            <Box direction="row" gap="xsmall">
                              <StatusCritical />
                              <Text>{tune.highscore.mistakes}</Text>
                            </Box>
                          )}
                          {tune.highscore && (
                            <Box direction="row" gap="xsmall">
                              <Clock />
                              <Text>
                                {millisToMinutesAndSeconds(tune.highscore.time)}
                              </Text>
                            </Box>
                          )}
                        </CardFooter>
                      </AnimatedCard>
                    </Stack>
                  ))}
                </Grid>
              </AccordionPanel>
            ))}
          </Accordion>
        </Box>
        <Link href="/exercise/new" passHref>
          <Box
            round="full"
            overflow="hidden"
            background="brand"
            margin="medium"
          >
            <Button
              icon={<Add />}
              hoverIndicator
              onClick={() => {
                setLoading(true);
              }}
            />
          </Box>
        </Link>
      </Stack>
      {notification && (
        <Notification
          color="status-error"
          onClose={() => setNotification(undefined)}
          text={notification}
          timeout={3000}
        />
      )}
      {openDeleteDialog && (
        <ConfirmationDialog
          heading="Löschen"
          confirmLabel="Löschen"
          onCancel={() => setOpenDeleteDialog(undefined)}
          onConfirm={() => {
            fetch("/api/secured/exercise", {
              method: "DELETE",
              body: JSON.stringify(openDeleteDialog.tune),
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
            setOpenDeleteDialog(undefined);
          }}
        >
          <Text>
            Sind Sie sicher, dass Sie "{openDeleteDialog.tune.title}" löschen
            wollen?
          </Text>
        </ConfirmationDialog>
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
        if (!props.disabled) {
          setAnimation({ type: "pulse", size: "small" });
          props.onClick();
        }
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
        { $unwind: { path: "$tunes_docs", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "successfulAttempts",
            let: { tune_id: "$tunes_docs._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", session.user._id] },
                      { $eq: ["$tune_id", "$$tune_id"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  mistakes: { $min: "$mistakes" },
                  time: { $min: "$time" },
                },
              },
            ],
            as: "highscore",
          },
        },
        {
          $project: {
            tunes_docs: {
              title: 1,
              points: 1,
              createdBy: 1,
              _id: { $toString: "$tunes_docs._id" },
              highscore: { $first: "$highscore" },
            },
            name: 1,
          },
        },
        { $sort: { "tunes_docs.points": 1 } },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            tunes: { $push: "$tunes_docs" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const successfulAttempts = await db
      .collection("successfulAttempts")
      .aggregate([
        { $match: { user_id: session.user._id } },
        {
          $group: {
            _id: "$tune_id",
          },
        },
        {
          $lookup: {
            from: "tunes",
            localField: "_id",
            foreignField: "_id",
            as: "tune",
          },
        },
        { $unwind: { path: "$tune", preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: null,
            score: { $sum: "$tune.points" },
          },
        },
      ])
      .toArray();

    const score =
      successfulAttempts.length > 0 ? successfulAttempts[0].score : 0;

    return {
      props: {
        tunebooks,
        session,
        score,
      },
    };
  }
}
