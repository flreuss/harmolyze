import { Box, Grid, Card, CardBody, CardFooter, Text } from "grommet";
import { useRouter } from "next/router";

export default function Home(props) {
  const tunes = props.tuneBook.tunes;
  const router = useRouter();

  return (
    <Box
      pad="large"
      background="url(https://blog.hdwallsource.com/wp-content/uploads/2014/11/gradient-26052-26737-hd-wallpapers.jpg.png)"
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
