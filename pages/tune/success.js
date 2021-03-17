import { Box, Button, Text } from "grommet";
import { Home } from "grommet-icons";
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
        <Text size="xlarge">Name: {router.query.tune_title}</Text>
        <Text size="large">Mistakes: {router.query.mistakes}</Text>
        <Text size="large">
          Time: {millisToMinutesAndSeconds(router.query.time)}
        </Text>
        <Link href="/" passHref>
          <Button size="small" hoverIndicator label="Zurück zum Start" icon={<Home />} />
        </Link>
      </Box>
    </Layout>
  );
}
