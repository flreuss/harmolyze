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
import { Home, Logout } from "grommet-icons";
import Link from "next/link";
import { grommet } from "grommet/themes";
import { deepMerge } from "grommet/utils";
import { useSession, signOut } from "next-auth/client";

const customTheme = deepMerge(grommet, {});

export default function Layout({ children }) {
  const [session, loading] = useSession();

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
          {!loading && session && (
            <Box direction="row" align="center" gap="small">
              <Avatar src={session.user.image} />
              <Anchor color="white" label={session.user.name} />
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
