import {
  Box,
  Button,
  Grommet,
  Grid,
  Header,
  Main,
  Nav,
  Avatar,
  Menu,
  Layer,
  Spinner,
} from "grommet";
import Link from "next/link";
import { grommet } from "grommet/themes";
import { deepMerge } from "grommet/utils";
import { signOut } from "next-auth/client";
import { Analytics, Home, Logout } from "grommet-icons";
import React from "react";
import { useRouter } from "next/router";

const customTheme = deepMerge(grommet, {});

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
        <Header gridArea="header" background="brand" pad="small">
          <Nav gap="small" direction="row">
            <Link href="/" passHref>
              <Button size="small" hoverIndicator icon={homeIcon || <Home />} />
            </Link>
          </Nav>

          <Box direction="row" align="center" gap="medium">
            {status}
            {user && (
              <Menu
                label={<Avatar src={user.image} size="small" />}
                dropProps={{
                  align: { top: "bottom", right: "right" },
                }}
                items={[
                  {
                    label: "Statistik",
                    onClick: () => {
                      router.push("/stats");
                    },
                    icon: (
                      <Box pad={{ right: "small" }}>
                        <Analytics />
                      </Box>
                    ),
                  },
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
