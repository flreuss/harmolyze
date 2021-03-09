import React from "react";
// import { produceRgbShades } from "../lib/tinycolorUtils";

import ColourWheel from "../colourWheel";

export default function SelectionWheel({ value, onChange, radius }) {
  let colourWheel;

  return (
    <ColourWheel
      options={[
        {
          colour: "rgb(255,0,0)",
          values: ["D", "(D)", "/D", "d"],
          children: [
            { colour: "rgb(179,0,0)", values: ["Dp", "DP", "dG", "dg"] },
            { colour: "rgb(255,25,51)", values: ["Dg", "DG", "dP", "dp"] },
          ],
        },
        {
          colour: "rgb(0,255,0)",
          values: ["S", "s"],
          children: [
            {
              colour: "rgb(51, 255, 51)",
              values: ["Sp", "SP", "sG", "sg"],
            },
            { colour: "rgb(0, 179, 0)", values: ["Sg", "SG", "sP", "sp"] },
          ],
        },
        {
          colour: "rgb(0,0,255)",
          values: ["T", "t"],
          children: [
            {
              colour: "rgb(51, 51, 255)",
              values: ["Tp", "TP", "tG", "tg"],
            },
            { colour: "rgb(0, 0, 179)", values: ["Tg", "TG", "tP", "tp"] },
          ],
        },
      ]}
      radius={radius}
      padding={10}
      lineWidth={50}
      onValueSelected={onChange}
      onRef={(ref) => (colourWheel = ref)}
      spacers={{
        colour: "#FFFFFF",
        shadowColour: "grey",
        shadowBlur: 5,
      }}
      preset={true}
      presetValue={value}
      animated
    />
  );
}
