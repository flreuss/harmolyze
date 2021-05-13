import {
  Box,
  Grid,
  Text,
  Stack,
  Button,
  Accordion,
  AccordionPanel,
  Meter,
  Select,
  ResponsiveContext,
  Image,
  Heading,
} from "grommet";
import { getSession } from "next-auth/client";
import Notification from "../components/notification";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";
import TuneCard from "../components/tuneCard";
import { connectToDatabase } from "../lib/mongodb";
import {
  Add,
  Clock,
  DocumentTransfer,
  Edit,
  Lock,
  Money,
  StatusCritical,
  Trash,
} from "grommet-icons";
import Link from "next/link";
import ConfirmationDialog from "../components/confirmationDialog";
import { millisToMinutesAndSeconds, romanNumeral } from "../lib/stringUtils";
import useWindowSize from "../lib/useWindowSize";
import Avatar from "avataaars";

export default function Home({ tunebooks, session, score }) {
  const router = useRouter();
  const windowSize = useWindowSize();
  const [notification, setNotification] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(undefined);
  const [openMoveDialog, setOpenMoveDialog] = useState(undefined);
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
              onActive={(newActiveIndex) => {
                if (
                  newActiveIndex.length === 0 ||
                  newActiveIndex[0] === 0 ||
                  tunebooks[newActiveIndex[0] - 1].tunes.slice(-1)[0].highscore
                ) {
                  setActiveIndex(newActiveIndex);
                } else {
                  setNotification({
                    text: `Zum Freischalten letzte Aufgabe aus ${romanNumeral(
                      newActiveIndex[0]
                    )}. lösen.`,
                    color: "accent-1",
                  });
                }
              }}
            >
              {tunebooks.map((tunebook, tunebookIndex) => (
                <RichPanel
                  key={tunebook._id}
                  gap="small"
                  disabled={
                    tunebookIndex !== 0 &&
                    !tunebooks[tunebookIndex - 1].tunes.slice(-1)[0].highscore
                  }
                  label={`${romanNumeral(tunebookIndex + 1)}. ${tunebook.name}`}
                >
                  <ResponsiveContext.Consumer>
                    {(device) => (
                      <Grid
                        gap="small"
                        columns={
                          device === "small"
                            ? windowSize.height > windowSize.width
                              ? ["49%", "49%"]
                              : ["23%", "23%", "23%", "23%"]
                            : "small"
                        }
                        margin="medium"
                      >
                        {tunebook.tunes.map((tune, tuneIndex) => (
                          <TuneCard
                            //TODO: Wenn kein Tune Image vorhanden ist dann nimm den Avatar des Nutzers der ihn angelegt hat
                            image={"/tunes/placeholder.png"}
                            background={
                              tune.highscore ? "light-2" : "neutral-3"
                            }
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
                                label: "Verschieben",
                                onClick: (evt) => {
                                  setOpenMoveDialog({ tune, tunebook });
                                  //Prevent onClick event from bubbling up to the parent Card
                                  evt.stopPropagation();
                                },
                                icon: (
                                  <Box pad={{ right: "medium" }}>
                                    <DocumentTransfer />
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
                            title={`${tuneIndex + 1}. ${tune.title}`}
                            key={tune._id}
                          />
                        ))}
                      </Grid>
                    )}
                  </ResponsiveContext.Consumer>
                </RichPanel>
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
          color={notification.color}
          onClose={() => setNotification(undefined)}
          text={notification.text}
          timeout={3500}
        />
      )}
      {openMoveDialog && (
        <ConfirmationDialog
          heading="Verschieben nach..."
          confirmLabel="OK"
          onCancel={() => setOpenMoveDialog(undefined)}
          onConfirm={() => {
            if (openMoveDialog.moveTo) {
              deleteTune(
                openMoveDialog.tune,
                (data) => {
                  createTune(
                    {
                      ...data,
                      tunebook_id: openMoveDialog.moveTo._id,
                    },
                    () => {
                      router.push("/");
                    },
                    () =>
                      setNotification({
                        text: "Bei der Datenbankanfrage ist ein Fehler aufgetreten",
                        color: "status-error",
                      })
                  );
                },
                () =>
                  setNotification({
                    text: "Bei der Datenbankanfrage ist ein Fehler aufgetreten",
                    color: "status-error",
                  })
              );
            }
            setOpenMoveDialog(undefined);
          }}
        >
          <Text>
            Wohin möchten Sie "{openMoveDialog.tune.title}" verschieben?
          </Text>
          <Select
            id="select"
            name="select"
            value={openMoveDialog.moveTo && openMoveDialog.moveTo._id}
            labelKey="name"
            valueKey={{ key: "_id", reduce: true }}
            options={tunebooks.filter(
              (tunebook) =>
                tunebook._id !== openMoveDialog.tunebook._id &&
                tunebook.permissions.write.some((group) =>
                  session.user.groups.includes(group)
                )
            )}
            onChange={({ option }) =>
              setOpenMoveDialog((dialog) => ({ ...dialog, moveTo: option }))
            }
          />
        </ConfirmationDialog>
      )}
      {openDeleteDialog && (
        <ConfirmationDialog
          heading="Löschen"
          confirmLabel="Löschen"
          onCancel={() => setOpenDeleteDialog(undefined)}
          onConfirm={() => {
            deleteTune(
              openDeleteDialog.tune,
              () => router.push("/"),
              () =>
                setNotification({
                  text: "Bei der Datenbankanfrage ist ein Fehler aufgetreten",
                  color: "status-error",
                })
            );

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

const RichPanel = ({ children, label, disabled }) => {
  const [hovering, setHovering] = useState(false);

  const renderPanelTitle = () => (
    <Box
      direction="row"
      align="center"
      gap="small"
      pad={{ horizontal: "small" }}
    >
      <Heading level={4} color={hovering || disabled ? "dark-3" : "dark-1"}>
        {label}
      </Heading>
      {disabled && <Lock />}
    </Box>
  );

  return (
    <AccordionPanel
      label={renderPanelTitle()}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      {children}
    </AccordionPanel>
  );
};

async function deleteTune(tune, onSuccess, onFailure) {
  const res = await fetch("/api/secured/tune", {
    method: "DELETE",
    body: JSON.stringify(tune),
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
  });
  if (res.status % 200 <= 26) {
    const data = await res.json();
    onSuccess(data);
  } else {
    onFailure();
  }
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
    const data = await res.json();
    onSuccess(data);
  } else {
    onFailure();
  }
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
            from: "attempts",
            let: { tune_id: "$tunes_docs._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$user_id", session.user._id] },
                      { $eq: ["$tune_id", "$$tune_id"] },
                      { $eq: ["$progress", 1] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  mistakes: { $min: "$mistakes" },
                  time: { $min: "$time" },
                  last: { $max: "$validatedAt" },
                },
              },
              {
                $project: {
                  mistakes: 1,
                  time: 1,
                  last: { $toString: "$last" },
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
              image: 1,
              _id: { $toString: "$tunes_docs._id" },
              highscore: { $first: "$highscore" },
            },
            name: 1,
            permissions: 1,
          },
        },
        { $sort: { "tunes_docs.points": 1 } },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            permissions: { $first: "$permissions" },
            tunes: { $push: "$tunes_docs" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    const successfulAttemptsOnForeignTunes = await db
      .collection("attempts")
      .aggregate([
        { $match: { user_id: session.user._id, progress: 1 } },
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
        { $match: { "tune.createdBy": { $ne: session.user._id } } },
        {
          $group: {
            _id: null,
            score: { $sum: "$tune.points" },
          },
        },
      ])
      .toArray();

    const score =
      successfulAttemptsOnForeignTunes.length > 0
        ? successfulAttemptsOnForeignTunes[0].score
        : 0;

    return {
      props: {
        tunebooks,
        session,
        score,
      },
    };
  }
}
