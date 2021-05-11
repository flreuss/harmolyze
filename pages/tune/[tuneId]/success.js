import { Box, Button, Header, Heading, Image, Text, Tip } from "grommet";
import { Clock, Home, StatusCritical } from "grommet-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../../components/layout";
import { millisToMinutesAndSeconds } from "../../../lib/stringUtils";
import Head from "next/head";

export default function Success(props) {
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>HarmoLyze - {router.query.tune_title} gelöst</title>
      </Head>
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
        gap="medium"
        pad="medium"
      >
        <Heading textAlign="center" level={1}>
          GLÜCKWUNSCH!
        </Heading>
        <Image
          src="https://media.giphy.com/media/Q81NcsY6YxK7jxnr4v/giphy.gif"
          fit="cover"
          pad="medium"
        />
        <Heading textAlign="center" level={2}>
          Du hast "{router.query.tune_title}" gelöst.
        </Heading>
        <Box
          direction="row"
          gap="medium"
          pad={{ horizontal: "medium", vertical: "small" }}
        >
          <Tip content="Fehler">
            <Box direction="row" gap="xsmall">
              <StatusCritical />
              <Text>{router.query.mistakes}</Text>
            </Box>
          </Tip>
          <Tip content="Benötigte Zeit">
            <Box direction="row" gap="xsmall">
              <Clock />
              <Text>{millisToMinutesAndSeconds(router.query.time)}</Text>
            </Box>
          </Tip>
        </Box>
        <Link href="/" passHref>
          <Button
            size="small"
            hoverIndicator
            label="Zurück zum Start"
            icon={<Home />}
          />
        </Link>
      </Box>
    </Layout>
  );
}
