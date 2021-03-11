import { Box, Grid, Card, CardBody, CardFooter, Text } from "grommet";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";
import { connectToDatabase } from "../lib/mongodb";

export default function Home({ tunes }) {
  const router = useRouter();

  return (
    <Layout>
      <Box
        pad="large"
        background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
        height="100%"
      >
        <Grid gap="medium" columns={{ count: "fit", size: "small" }}>
          {tunes.map((tune) => (
            <AnimatedCard
              key={tune.id}
              onClick={() => router.push(`/exercise/${tune.id}`)}
              background="white"
            >
              <CardBody pad="small">
                <Text size="medium">{tune.title}</Text>
              </CardBody>

              <CardFooter pad={{ horizontal: "medium", vertical: "small" }}>
                <Text size="xsmall">Exercise {tune.id}</Text>
              </CardFooter>
            </AnimatedCard>
          ))}
        </Grid>
      </Box>
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
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  } else {
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
}
