import { Box, Grid, Card, CardBody, CardFooter, Text } from "grommet";
import { getSession } from "next-auth/client";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/layout";
import { connectToDatabase } from "../lib/mongodb";

export default function Home({ tunebooks }) {
  const router = useRouter();

  return (
    <Layout>
      <Box
        pad="large"
        background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
        height="100%"
      >
        {tunebooks.map((tunebook) => (
          <Box>
            <Text>{tunebook.name}</Text>
            {tunebook.tunes.map((tune) => (
              <Grid gap="medium" columns={{ count: "fit", size: "small" }}>
                <AnimatedCard
                  key={tune.id}
                  onClick={() => router.push(`/tunebook/${tunebook._id}/tune/${tune.id}`)}
                  background="white"
                >
                  <CardBody pad="small">
                    <Text size="medium">{tune.title}</Text>
                  </CardBody>

                  <CardFooter pad={{ horizontal: "medium", vertical: "small" }}>
                    <Text size="xsmall">Exercise {tune.id}</Text>
                  </CardFooter>
                </AnimatedCard>
              </Grid>
            ))}
          </Box>
        ))}
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
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  } else {
    const { db } = await connectToDatabase();

    const tunebooks = await db
      .collection("tunebooks")
      .find()
      .sort({ _id: 1 })
      .toArray();

    return {
      props: {
        tunebooks,
      },
    };
  }
}
