import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Image,
  Meter,
  ResponsiveContext,
  Text,
  Tip,
} from "grommet";
import InteractiveScore from "../../../components/interactiveScore";
import { connectToDatabase } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import Layout from "../../../components/layout";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { millisToMinutesAndSeconds } from "../../../lib/stringUtils";
import {
  Clock,
  Edit,
  Home,
  Money,
  Previous,
  StatusCritical,
} from "grommet-icons";
import { getInitial, getSolution } from "../../../lib/solutions";
import Head from "next/head";
import Link from "next/link";
import useWindowSize from "../../../lib/useWindowSize";

export default function DisplayTune({ tune, session, lastAttempt }) {
  const defaultAttempt = {
    progress: 0,
    mistakeCount: 0,
    solvedCount: 0,
    user_id: session.user._id,
    tune_id: tune._id,
    abc: getInitial(tune.abc),
    almostSolved: [],
    solved: [],
    showMistakes: false,
    time: 0,
  };

  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(lastAttempt || defaultAttempt);
  const [animation, setAnimation] = useState();
  const router = useRouter();
  const windowSize = useWindowSize();

  useEffect(() => {
    let interval = null;
    if (attempt.progress < 1) {
      interval = setInterval(() => {
        setAttempt((attempt) => ({ ...attempt, time: attempt.time + 1000 }));
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [attempt.time]);

  useEffect(() => {
    createAttempt(
      attempt,
      () => {},
      () =>
        setNotification("Bei der Datenbankanfrage ist ein Fehler aufgetreten")
    );
  }, [attempt.abc]);

  return (
    <Layout
      homeIcon={<Previous />}
      loading={loading}
      status={
        attempt.progress < 1 &&
        (session.user.groups.includes("admin") ? (
          <Button
            icon={<Edit />}
            onClick={() => {
              router.push(`/tune/${tune._id}/edit`);
            }}
            hoverIndicator
          />
        ) : (
          <Box direction="row" gap="small" align="center">
            <Tip content="Punkte">
              <Box direction="row" gap="xsmall" animation={animation}>
                <Money />
                <Text>{`${Math.round(attempt.progress * tune.points)}`}</Text>
                {windowSize.width > 360 && (
                  <Text truncate>{` / ${tune.points}`}</Text>
                )}
              </Box>
            </Tip>
            <Tip content="Fehler">
              <Box direction="row" gap="xsmall">
                <StatusCritical />
                <Text>{attempt.mistakeCount}</Text>
              </Box>
            </Tip>
            <Tip content="Benötigte Zeit">
              <Box direction="row" gap="xsmall">
                <Clock />
                <Text>{millisToMinutesAndSeconds(attempt.time)}</Text>
              </Box>
            </Tip>
          </Box>
        ))
      }
      user={session.user}
    >
      <Head>
        <title>HarmoLyze - {tune.title}</title>
      </Head>
      {session.user.gamified && (
        <Meter
          value={Math.floor(attempt.progress * 100)}
          max={100}
          size="full"
          thickness="small"
        />
      )}
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
      >
        <ResponsiveContext.Consumer>
          {(device) =>
            attempt.progress < 1 ? (
              <InteractiveScore
                abc={attempt.abc}
                id={tune._id}
                evolvedUI={session.user.gamified}
                initial={getInitial(tune.abc)}
                solution={getSolution(tune.abc)}
                showMistakes={attempt.showMistakes}
                solved={attempt.solved}
                almostSolved={attempt.almostSolved}
                device={device}
                onChange={(newAbc, [elems, abcjsClass], total) => {
                  if (abcjsClass == "abcjs-solved") {
                    setAnimation("jiggle");
                    setInterval(() => {
                      setAnimation(undefined);
                    }, 700);
                  }

                  const nextAttempt = {
                    showMistakes: true,
                    solvedCount:
                      abcjsClass == "abcjs-solved"
                        ? attempt.solvedCount + 1
                        : attempt.solvedCount,
                    mistakeCount:
                      abcjsClass == "abcjs-mistake"
                        ? attempt.mistakeCount + 1
                        : attempt.mistakeCount,
                    progress:
                      abcjsClass == "abcjs-solved"
                        ? (attempt.solvedCount + 1) / total
                        : attempt.progress,
                    solved:
                      abcjsClass == "abcjs-solved"
                        ? attempt.solved.concat(elems)
                        : attempt.solved,
                    almostSolved:
                      abcjsClass == "abcjs-almostSolved"
                        ? attempt.almostSolved.concat(elems)
                        : attempt.almostSolved,
                    validatedAt: new Date(),
                    abc: newAbc,
                    tune_id: tune._id,
                  };
                  setAttempt((attempt) => ({ ...attempt, ...nextAttempt }));
                }}
              />
            ) : (
              <Success
                tune={tune}
                attempt={attempt}
                gamified={session.user.gamified}
              />
            )
          }
        </ResponsiveContext.Consumer>
      </Box>
    </Layout>
  );
}

function Success({ tune, attempt, gamified }) {
  const successGifs = [
    "https://media.giphy.com/media/Q81NcsY6YxK7jxnr4v/giphy.gif",
    "https://media.giphy.com/media/KEVNWkmWm6dm8/giphy.gif",
    "https://media.giphy.com/media/o75ajIFH0QnQC3nCeD/giphy.gif",
    "https://media.giphy.com/media/uudzUtVcsLAoo/giphy.gif",
    "https://media.giphy.com/media/gd0Dqg6rYhttBVCZqd/giphy.gif",
    "https://media.giphy.com/media/l4HodBpDmoMA5p9bG/giphy.gif",
    "https://media.giphy.com/media/l3q2Z6S6n38zjPswo/giphy.gif",
    "https://media.giphy.com/media/T0WzQ475t9Cw/giphy.gif",
    "https://media.giphy.com/media/2U0MJobOh2sta/giphy.gif",
    "https://media.giphy.com/media/3ohhwo4PzDFaz2sADu/giphy.gif",
    "https://media.giphy.com/media/XreQmk7ETCak0/giphy.gif",
    "https://media.giphy.com/media/37nRXpCEP9H1f1WVrb/giphy.gif",
    "https://media.giphy.com/media/MSCzxrLEF25feISTIz/giphy.gif",
    "https://media.giphy.com/media/l0MYxef0mpdcnQnvi/giphy.gif",
    "https://media.giphy.com/media/gjsVqF6Xf2ywOb83tw/giphy.gif",
  ];

  const [gif, setGif] = useState(
    successGifs[Math.floor(Math.random() * successGifs.length)]
  );

  return (
    <Box
      animation={{ type: "fadeIn", size: "medium" }}
      fill
      align="center"
      justify="center"
      gap="medium"
      pad="medium"
    >
      <Box direction="row" gap="small" align="center">
        <Heading level={2}>🎉</Heading>
        <Heading textAlign="center" level={2}>
          Du hast "{tune.title}" gelöst!
        </Heading>
        <Heading level={2}>🎉</Heading>
      </Box>

      {gamified && <Image src={gif} fit="contain" pad="medium" fill />}

      {gamified && (
        <Box
          direction="row"
          gap="medium"
          pad={{ horizontal: "medium", vertical: "small" }}
        >
          <Tip content="Punkte">
            <Box direction="row" gap="xsmall">
              <Money />
              <Text>{tune.points}</Text>
            </Box>
          </Tip>
          <Tip content="Fehler">
            <Box direction="row" gap="xsmall">
              <StatusCritical />
              <Text>{attempt.mistakeCount}</Text>
            </Box>
          </Tip>
          <Tip content="Benötigte Zeit">
            <Box direction="row" gap="xsmall">
              <Clock />
              <Text>{millisToMinutesAndSeconds(attempt.time)}</Text>
            </Box>
          </Tip>
        </Box>
      )}
      <Link href="/" passHref>
        <Button
          size="small"
          hoverIndicator
          label="Zurück zum Start"
          icon={<Home />}
        />
      </Link>
    </Box>
  );
}

async function createAttempt(
  attempt,
  onSuccess = () => {},
  onFailure = () => {}
) {
  const res = await fetch("/api/secured/attempt", {
    method: "POST",
    body: JSON.stringify(attempt),
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
  });
  if (res.status % 200 <= 26) {
    onSuccess();
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
    let tune = await db.collection("tunes").findOne(
      {
        _id: ObjectId(context.params.tuneId),
      },
      {
        projection: {
          _id: { $toString: "$_id" },
          abc: 1,
          title: 1,
          lastModifiedAt: 1,
          points: 1,
        },
      }
    );
    const attempts = await db
      .collection("attempts")
      .find({
        tune_id: ObjectId(context.params.tuneId),
        user_id: session.user._id,
        validatedAt: { $gt: tune.lastModifiedAt },
      })
      .sort({ validatedAt: -1 })
      .project({ _id: 0, tune_id: 0, validatedAt: 0 })
      .toArray();

    const lastAttempt =
      attempts.length > 0 && attempts[0].progress !== 1 ? attempts[0] : null;
    console.log(lastAttempt);
    tune = {
      _id: tune._id,
      //Removes instrument names from abc strings
      abc: tune.abc.replace(/s?nm=".*"/g, ""),
      title: tune.title,
      points: tune.points,
    };

    return {
      props: {
        tune,
        lastAttempt,
        session,
      },
    };
  }
}
