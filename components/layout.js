import {
  Box,
  Button,
  Grommet,
  Grid,
  Header,
  Main,
  Nav,
  Avatar,
  Anchor,
  Text,
} from "grommet";
import { Home, Logout, Money } from "grommet-icons";
import Link from "next/link";
import { grommet } from "grommet/themes";
import { deepMerge } from "grommet/utils";
import { signOut } from "next-auth/client";

const customTheme = deepMerge(grommet, {});

export default function Layout({ children, session, score }) {
  return (
    <Grommet full theme={customTheme}>
      <Grid
        fill
        rows={["auto", "flex"]}
        columns={["auto", "flex"]}
        areas={[
          { name: "header", start: [0, 0], end: [1, 0] },
          { name: "main", start: [1, 1], end: [1, 1] },
        ]}
      >
        <Header gridArea="header" background="brand" pad="small">
          <Nav gap="small" direction="row">
            <Link href="/" passHref>
              <Button size="small" hoverIndicator icon={<Home />} />
            </Link>
          </Nav>
          {session && (
            <Box direction="row" align="center" gap="small">
              <Box direction="row" gap="xsmall">
                <Money />
                <Text>{score}</Text>
              </Box>
              <Avatar src={session.user.image} />
              <Anchor color="white" label={session.user._id} />
              <Button
                size="small"
                hoverIndicator
                icon={<Logout />}
                onClick={() => signOut()}
              />
            </Box>
          )}
        </Header>
        <Main gridArea="main">{children}</Main>
      </Grid>
    </Grommet>
  );
}
