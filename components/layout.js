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
} from "grommet";
import { Home } from "grommet-icons";
import Link from "next/link";
import { grommet } from "grommet/themes";
import { signIn, useSession, signOut } from "next-auth/client";

const gravatarSrc =
  "//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80";

export default function Layout({ children }) {
  const [session, loading] = useSession();

  return (
    <Grommet full theme={grommet}>
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
              <Button
                size="small"
                hoverIndicator
                icon={<Home />}
                onClick={() => {}}
              />
            </Link>
          </Nav>
          <Box direction="row" align="center" gap="small">
            <Avatar
              src={gravatarSrc}
              onClick={session ? () => signOut() : () => signIn()}
            />
            <Anchor
              color="white"
              onClick={session ? () => signOut() : () => signIn()}
              label={
                session ? session.user.name || session.user.email : "Einloggen"
              }
            ></Anchor>
          </Box>
        </Header>
        <Main gridArea="main"> {children}</Main>
      </Grid>
    </Grommet>
  );
}
