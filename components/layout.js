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
} from "grommet";
import Link from "next/link";
import { grommet } from "grommet/themes";
import { deepMerge } from "grommet/utils";
import { signOut } from "next-auth/client";
import { Home, Logout } from "grommet-icons";
import React from "react";

const customTheme = deepMerge(grommet, {});

export default function Layout({ children, user, status, homeIcon, loading }) {
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
                    label: "Abmelden",
                    onClick: () => {
                      signOut();
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
              <Box alignSelf="center" className="loader" align="center" />
            </Layer>
          )}
        </Main>
      </Grid>
    </Grommet>
  );
}
