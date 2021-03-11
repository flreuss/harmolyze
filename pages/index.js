import { Box, Grid, Card, CardBody, CardFooter, Text } from "grommet";
import { useRouter } from "next/router";
import { connectToDatabase } from "../lib/mongodb";

export default function Home({ tunes }) {
  const router = useRouter();

  return (
    <Box
      pad="large"
      background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
      height="100%"
    >
      <Grid gap="medium" columns={{ count: "fit", size: "small" }}>
        {tunes.map((tune) => (
          <Card
            background="white"
            animation={{ type: "fadeIn", size: "medium" }}
            key={tune.id}
            onClick={() => router.push(`/exercise/${tune.id}`)}
          >
            <CardBody pad="small">
              <Text size="medium">{tune.title}</Text>
            </CardBody>

            <CardFooter pad={{ horizontal: "medium", vertical: "small" }}>
              <Text size="xsmall">Exercise {tune.id}</Text>
            </CardFooter>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}

export async function getServerSideProps() {
  const { db } = await connectToDatabase();

  const tunes = await db
    .collection("Tunes")
    .find()
    .project({ title: 1, id: 1, _id: 0 })
    .sort({ id: 1 })
    .toArray();

  return {
    props: {
      tunes,
    },
  };
}
