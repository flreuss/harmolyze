import React from "react";
// import { produceRgbShades } from "../lib/tinycolorUtils";

import ColorWheel from "../colorWheel";

export default function SelectionWheel({ value, onChange, radius, mode }) {
  // Important global variable! Do not delete!
  let colorWheel;

  return (
    <ColorWheel
      options={
        ["m", "min", "minor"].includes(mode)
          ? [
              {
                color: "rgb(255,0,0)",
                values: ["D", "(D)", "/D", "d"],
                children: [
                  { color: "rgb(179,0,0)", values: ["Dp", "DP", "dG", "dg"] },
                  {
                    color: "rgb(255,25,51)",
                    values: ["Dg", "DG", "dP", "dp"],
                  },
                ],
              },
              {
                color: "rgb(0,255,0)",
                values: ["s", "S"],
                children: [
                  {
                    color: "rgb(51, 255, 51)",
                    values: ["sG", "sg", "Sp", "SP"],
                  },
                  {
                    color: "rgb(0, 179, 0)",
                    values: ["sP", "sp", "Sg", "SG"],
                  },
                ],
              },
              {
                color: "rgb(0,0,255)",
                values: ["t", "T"],
                children: [
                  {
                    color: "rgb(51, 51, 255)",
                    values: ["tG", "tg", "Tp", "TP"],
                  },
                  {
                    color: "rgb(0, 0, 179)",
                    values: ["tP", "tp", "Tg", "TG"],
                  },
                ],
              },
            ]
          : [
              {
                color: "rgb(255,0,0)",
                values: ["D", "(D)", "/D", "d"],
                children: [
                  { color: "rgb(179,0,0)", values: ["Dp", "DP", "dG", "dg"] },
                  {
                    color: "rgb(255,25,51)",
                    values: ["Dg", "DG", "dP", "dp"],
                  },
                ],
              },
              {
                color: "rgb(0,255,0)",
                values: ["S", "s"],
                children: [
                  {
                    color: "rgb(51, 255, 51)",
                    values: ["Sp", "SP", "sG", "sg"],
                  },
                  {
                    color: "rgb(0, 179, 0)",
                    values: ["Sg", "SG", "sP", "sp"],
                  },
                ],
              },
              {
                color: "rgb(0,0,255)",
                values: ["T", "t"],
                children: [
                  {
                    color: "rgb(51, 51, 255)",
                    values: ["Tp", "TP", "tG", "tg"],
                  },
                  {
                    color: "rgb(0, 0, 179)",
                    values: ["Tg", "TG", "tP", "tp"],
                  },
                ],
              },
            ]
      }
      radius={radius}
      padding={10}
      lineWidth={50}
      onValueSelected={onChange}
      onRef={(ref) => (colorWheel = ref)}
      spacers={{
        color: "#FFFFFF",
        shadowColor: "grey",
        shadowBlur: 5,
      }}
      preset={value ? true : false}
      presetValue={value}
      animated
    />
  );
}
