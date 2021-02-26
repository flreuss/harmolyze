import React from "react";
import abc from "abcjs";
import {
  Box,
  Button,
  Heading,
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
import { useRouter } from "next/router";
import { grommet } from "grommet/themes";

import "../styles/globals.css";

import RiemannFunc from "../lib/RiemannFunc";

const gravatarSrc =
  "//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

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
            <Avatar src={gravatarSrc} />

            <Anchor color="white" href="https://github.com/ShimiSun">
              Florian Reuß
            </Anchor>
          </Box>
        </Header>
        <Main gridArea="main">
          <Component {...pageProps} />
        </Main>
      </Grid>
    </Grommet>
  );
}
