import { useSession } from "next-auth/react";
import Layout from "../components/layout";
import React from "react";
import { Previous } from "grommet-icons";
import Head from "next/head";
import { Box, Heading, Table,
  TableBody,
  TableCell,
  TableRow,
  Text } from "grommet";
import imageSources from "../public/imageSources.json";

export default function Credits() {
  return (
    <Layout homeIcon={<Previous />}>
      <Head>
        <title>HarmoLyze - Impressum & Credits</title>
      </Head>
      <Box pad="medium" fill>
        <Heading>Impressum</Heading>
        <p>Angaben gemäß § 5 TMG:</p>
        <ul>
        <li>Florian Reuß (verantwortlich für den Inhalt nach § 55 Abs. 2 RStV)</li>
        <li>Universität Potsdam, Institut für Informatik und Computational Science, An der Bahn 2, 14476 Potsdam</li>
    <li>+49 331 977 307213</li>
    <li>florian.reuss.1@uni-potsdam.de</li>
        </ul>
        <Heading>Bildquellen</Heading>
        <Table>
          <TableBody>
          {imageSources.map((src) => (
          <TableRow key={src.tune}>
              <TableCell key="Tune">
                <Text>{src.tune}</Text>
              </TableCell>
              <TableCell key="ImageSrc">
                <Text><a href={src.source}>{src.source}</a></Text>
              </TableCell>
              <TableCell key="Author">
                <Text>Photo by <a href={src.authorURL}>{src.author}</a></Text>
              </TableCell>
          </TableRow>
        ))}
          </TableBody>
        </Table>
        <Heading>User für User</Heading>
        <ul>
          <li>König, H. (2003). Studienmaterial für die Disziplin Musiktheoretische Grundausbildung (Grundstudium). Hrsg.: Institut für Musik und Musikpädagogik, Abteilung Musiktheorie. überarbeitet von Bernfried Höhne und Eckhard Laube.</li>
          <li>
          Meyer, U. <a href="https://www.meyer-gitarre.de/musiklehre/akkorde/dsieben/index.html">Übung zur Auflösung von Dominantseptakkorden</a>, abgerufen am 24.10.2022
          </li>
        </ul>
      </Box>
    </Layout>
  );
}
