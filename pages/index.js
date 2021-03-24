import {
  Box,
  Grid,
  Text,
  Stack,
  Button,
  Accordion,
  AccordionPanel,
  Meter,
} from "grommet";
import { getSession } from "next-auth/client";
import Notification from "../components/notification";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";
import TuneCard from "../components/tuneCard";
import { connectToDatabase } from "../lib/mongodb";
import { Add, Clock, Edit, Money, StatusCritical, Trash } from "grommet-icons";
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
      <Stack anchor="bottom-right" fill>
        <Box fill>
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
          <Box
            pad="large"
            background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
            height="100%"
            fill
            overflow="auto"
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
                      <TuneCard
                        image={tunebook.image}
                        background={tune.highscore ? "light-2" : "neutral-3"}
                        onClick={() => {
                          setLoading(true);
                          router.push(`/tune/${tune._id}`);
                        }}
                        menuItems={[
                          {
                            label: "Bearbeiten",
                            onClick: (evt) => {
                              setLoading(true);
                              router.push(`/tune/${tune._id}/edit`);
                              //Prevent onClick event from bubbling up to the parent Card
                              evt.stopPropagation();
                            },
                            icon: (
                              <Box pad={{ right: "medium" }}>
                                <Edit />
                              </Box>
                            ),
                          },
                          {
                            label: "Löschen",
                            onClick: (evt) => {
                              setOpenDeleteDialog({ tune });
                              //Prevent onClick event from bubbling up to the parent Card
                              evt.stopPropagation();
                            },
                            icon: (
                              <Box pad={{ right: "medium" }}>
                                <Trash />
                              </Box>
                            ),
                          },
                        ]}
                        footerItems={
                          tune.highscore
                            ? [
                                {
                                  icon: <StatusCritical />,
                                  label: tune.highscore.mistakes,
                                },
                                {
                                  icon: <Clock />,
                                  label: millisToMinutesAndSeconds(
                                    tune.highscore.time
                                  ),
                                },
                              ]
                            : [
                                {
                                  icon: <Money />,
                                  label: tune.points,
                                },
                              ]
                        }
                        showMenu={
                          tune.createdBy === session.user._id ||
                          session.user.groups.includes("admin")
                        }
                        title={tune.title}
                        key={tune._id}
                      />
                    ))}
                  </Grid>
                </AccordionPanel>
              ))}
            </Accordion>
          </Box>
        </Box>
        <Link href="/tune/new" passHref>
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
            fetch("/api/secured/tune", {
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
            image: 1,
            permissions: 1,
          },
        },
        { $sort: { "tunes_docs.points": 1 } },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            image: { $first: "$image" },
            permissions: { $first: "$permissions" },
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
