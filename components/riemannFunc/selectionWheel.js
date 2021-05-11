import React from "react";
import { BASE_FUNC_TYPES } from "../../lib/riemannFunc";
import {
  convertObjToString,
  produceRgbShades,
  tinycolor,
} from "../../lib/tinycolorUtils";

import ColorWheel from "../colorWheel";

export default function SelectionWheel({
  value,
  onChange,
  mode,
  radius,
  lineWidth,
  baseFuncTypes,
}) {
  // Important global variable! Do not delete!
  let colorWheel;

  function getOptionTree() {
    const colors = {
      dominant: "#A2423D",
      subdominant: "#00873D",
      tonic: "#00739D",
    };

    let optionTree = ["m", "min", "minor"].includes(mode)
      ? [
          {
            color: colors.dominant,
            values: ["D", "/D", "(D)"],
            children: [],
          },
          {
            color: colors.subdominant,
            values: ["s"],
            children: [],
          },
          {
            color: colors.tonic,
            values: ["t"],
            children: [],
          },
        ]
      : [
          {
            color: colors.dominant,
            values: ["D", "/D", "(D)"],
            children: [],
          },
          {
            color: colors.subdominant,
            values: ["S"],
            children: [],
          },
          {
            color: colors.tonic,
            values: ["T"],
            children: [],
          },
        ];

    if (
      !baseFuncTypes ||
      baseFuncTypes.some(
        (type) =>
          type.name === BASE_FUNC_TYPES.PARALLEL.name ||
          type.name === BASE_FUNC_TYPES.MEDIANT.name
      )
    ) {
      optionTree[0].children.push(
        {
          color: convertObjToString(
            produceRgbShades(tinycolor(colors.dominant), 2)[0]
          ),
          values: ["Dp"],
        },
        {
          color: convertObjToString(
            produceRgbShades(tinycolor(colors.dominant), 2)[1]
          ),
          values: ["Dg"],
        }
      );

      optionTree[1].children.push(
        {
          color: convertObjToString(
            produceRgbShades(tinycolor(colors.subdominant), 2)[0]
          ),
          values: ["m", "min", "minor"].includes(mode) ? ["sG"] : ["Sg"],
        },
        {
          color: convertObjToString(
            produceRgbShades(tinycolor(colors.subdominant), 2)[1]
          ),
          values: ["m", "min", "minor"].includes(mode) ? ["sP"] : ["Sp"],
        }
      );
      optionTree[2].children.push(
        {
          color: convertObjToString(
            produceRgbShades(tinycolor(colors.tonic), 2)[0]
          ),
          values: ["m", "min", "minor"].includes(mode) ? ["Tp"] : ["tP"],
        },
        {
          color: convertObjToString(
            produceRgbShades(tinycolor(colors.tonic), 2)[1]
          ),
          values: ["m", "min", "minor"].includes(mode) ? ["Tg"] : ["tG"],
        }
      );
    }

    if (
      !baseFuncTypes ||
      baseFuncTypes.some((type) => type.name === BASE_FUNC_TYPES.MEDIANT.name)
    ) {
      optionTree[0].children[0].values.push("DP", "dG", "dg");
      optionTree[0].children[1].values.push("DG", "dP", "dp");

      if (["m", "min", "minor"].includes(mode)) {
        optionTree[1].children[0].values.push("sg", "Sp", "SP");
        optionTree[1].children[1].values.push("sp", "Sg", "SG");

        optionTree[2].children[0].values.push("tg", "Tp", "TP");
        optionTree[2].children[1].values.push("tp", "Tg", "TG");
      } else {
        optionTree[1].children[0].values.push("SP", "sG", "sg");
        optionTree[1].children[1].values.push("SG", "sP", "sp");

        optionTree[2].children[0].values.push("TP", "tG", "tg");
        optionTree[2].children[1].values.push("TG", "tP", "tp");
      }
    }

    if (
      !baseFuncTypes ||
      baseFuncTypes.some((type) => type.name === BASE_FUNC_TYPES.VARIANT.name)
    ) {
      optionTree[0].values.push("d");
      optionTree[1].values.push(
        ["m", "min", "minor"].includes(mode) ? "S" : "s"
      );
      optionTree[2].values.push(
        ["m", "min", "minor"].includes(mode) ? "T" : "t"
      );
    }

    return optionTree;
  }

  return (
    <ColorWheel
      options={getOptionTree()}
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
