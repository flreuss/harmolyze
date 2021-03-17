import { Box, Button, Heading, Text } from "grommet";
import { Clock, Home, StatusCritical } from "grommet-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/layout";
import { millisToMinutesAndSeconds } from "../../lib/stringUtils";

export default function Success(props) {
  const router = useRouter();

  return (
    <Layout>
      <Box
        animation={{ type: "fadeIn", size: "medium" }}
        fill
        align="center"
        justify="center"
        gap="medium"
      >
        <Heading textAlign="center">GESCHAFFT!</Heading>
        <Heading textAlign="center">{router.query.tune_title}</Heading>
        <Box
          direction="row"
          gap="medium"
          pad={{ horizontal: "medium", vertical: "small" }}
        >
          <Box direction="row" gap="xsmall">
            <StatusCritical />
            <Text>{router.query.mistakes}</Text>
          </Box>
          <Box direction="row" gap="xsmall">
            <Clock />
            <Text>{millisToMinutesAndSeconds(router.query.time)}</Text>
          </Box>
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
