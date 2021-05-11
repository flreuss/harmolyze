import {
  Box,
  Button,
  Grommet,
  Grid,
  Header,
  Main,
  Nav,
  Menu,
  Layer,
  Spinner,
  Image,
  Text,
  Heading,
} from "grommet";
import Link from "next/link";
import { grommet } from "grommet/themes";
import { deepMerge } from "grommet/utils";
import { signOut } from "next-auth/client";
import { Analytics, Home, Logout } from "grommet-icons";
import React from "react";
import { useRouter } from "next/router";
import Avatar from "avataaars";

const customTheme = deepMerge(grommet, {
  global: {
    breakpoints: {
      small: {
        value: 767,
      },
      medium: {
        value: 1536,
      },
    },
  },
});

export default function Layout({ children, user, status, homeIcon, loading }) {
  const router = useRouter();

  return (
    <Grommet full theme={customTheme}>
      <Grid
        fill
        rows={["auto", "flex"]}
        columns={["auto", "flex"]}
        areas={[
          ["header", "header"],
          ["main", "main"],
        ]}
      >
        <Header
          gridArea="header"
          background="brand"
          pad={{ horizontal: "small" }}
        >
          <Nav gap="small" direction="row">
            <Link href="/" passHref>
              <Button
                margin="small"
                size="small"
                hoverIndicator
                icon={homeIcon || <Image src="/music-clef-treble.png" />}
                label={
                  homeIcon ? (
                    ""
                  ) : (
                    <Heading level="3" margin="none">
                      HarmoLyze
                    </Heading>
                  )
                }
                plain
              />
            </Link>
          </Nav>

          <Box direction="row" align="center" gap="medium">
            {status}
            {user && (
              <Menu
                label={
                  <Avatar
                    style={{ width: "50px", height: "50px" }}
                    avatarStyle="Circle"
                    clotheType="Hoodie"
                    clotheColor="Heather"
                    {...user.avatar}
                  />
                }
                dropProps={{
                  align: { top: "bottom", right: "right" },
                }}
                items={[
                  {
                    label: "Abmelden",
                    onClick: () => {
                      signOut({ callbackUrl: "/" });
                    },
                    icon: (
                      <Box pad={{ right: "small" }}>
                        <Logout />
                      </Box>
                    ),
                  },
                ]}
              />
            )}
          </Box>
        </Header>
        <Main gridArea="main">
          {children}
          {loading && (
            <Layer
              position="center"
              align="center"
              background={{ opacity: true }}
              justify="center"
              responsive={false}
            >
              <Spinner size="large" />
            </Layer>
          )}
        </Main>
      </Grid>
    </Grommet>
  );
}
