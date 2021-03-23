import { Box } from "grommet";
import { getSession } from "next-auth/client";
import Layout from "../components/layout";
import { connectToDatabase } from "../lib/mongodb";

export default function Home({ session }) {
  return (
    <Layout user={session.user}>
      <Box
        pad="large"
        background="radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)"
        height="100%"
        fill
        overflow="auto"
      >
        Inhalt befindet sich im Aufbau...
      </Box>
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

    return {
      props: {
        session,
      },
    };
  }
}
