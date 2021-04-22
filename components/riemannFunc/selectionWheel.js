import React from "react";
import { colorToRgbObj, convertObjToString, produceRgbShade, produceRgbShades, tinycolor } from "../../lib/tinycolorUtils";

import ColorWheel from "../colorWheel";

export default function SelectionWheel({ value, onChange, mode, radius, lineWidth }) {
  // Important global variable! Do not delete!
  let colorWheel;

  return (
    <ColorWheel
      options={
        ["m", "min", "minor"].includes(mode)
          ? [
              {
                color: "#A2423D",
                values: ["D", "(D)", "/D", "d"],
                children: [
                  { color: convertObjToString(produceRgbShades(tinycolor("#A2423D"),2)[0]), values: ["Dp", "DP", "dG", "dg"] },
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#A2423D"),2)[1]),
                    values: ["Dg", "DG", "dP", "dp"],
                  },
                ],
              },
              {
                color: "#00873D",
                values: ["s", "S"],
                children: [
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00873D"),2)[0]),
                    values: ["sG", "sg", "Sp", "SP"],
                  },
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00873D"),2)[1]),
                    values: ["sP", "sp", "Sg", "SG"],
                  },
                ],
              },
              {
                color: "#00739D",
                values: ["t", "T"],
                children: [
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00739D"),2)[0]),
                    values: ["tG", "tg", "Tp", "TP"],
                  },
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00739D"),2)[1]),
                    values: ["tP", "tp", "Tg", "TG"],
                  },
                ],
              },
            ]
          : [
              {
                color: "#A2423D",
                values: ["D", "(D)", "/D", "d"],
                children: [
                  { color: convertObjToString(produceRgbShades(tinycolor("#A2423D"),2)[0]), values: ["Dp", "DP", "dG", "dg"] },
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#A2423D"),2)[1]),
                    values: ["Dg", "DG", "dP", "dp"],
                  },
                ],
              },
              {
                color: "#00873D",
                values: ["S", "s"],
                children: [
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00873D"),2)[0]),
                    values: ["Sp", "SP", "sG", "sg"],
                  },
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00873D"),2)[1]),
                    values: ["Sg", "SG", "sP", "sp"],
                  },
                ],
              },
              {
                color: "#00739D",
                values: ["T", "t"],
                children: [
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00739D"),2)[0]),
                    values: ["Tp", "TP", "tG", "tg"],
                  },
                  {
                    color: convertObjToString(produceRgbShades(tinycolor("#00739D"),2)[1]),
                    values: ["Tg", "TG", "tP", "tp"],
                  },
                ],
              },
            ]
      }
      radius={radius}
      padding={10}
      lineWidth={lineWidth}
      onValueSelected={onChange}
      onRef={(ref) => (colorWheel = ref)}
      spacers={{
        color: "white",
        shadowColor: "grey",
        shadowBlur: 5,
      }}
      preset={value ? true : false}
      presetValue={value}
      animated
    />
  );
}
