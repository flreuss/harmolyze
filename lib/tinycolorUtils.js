import tinycolor from "tinycolor2";

export function produceRgbShade(r, g, b, luminosity) {
  const hsl = tinycolor(`rgb(${r}, ${g}, ${b})`).toHsl();
  hsl.l = luminosity;
  return tinycolor(hsl).toRgb();
}

export function produceRgbShades(r, g, b, amount) {
  let shades = [];

  for (let i = 6; i > 1; i -= 5 / amount) {
    // Decrements from 9 - 1; i being what luminosity (hsl.l) is multiplied by.
    shades.push(produceRgbShade(r, g, b, 0.1 * i));
  }

  return shades;
}

export function colorToRgbObj(color) {
  return tinycolor(color).toRgb();
}

export function calculateBounds(min, max) {
  // i.e. min & max pixels away from the center of the canvas.
  return {
    inside: (cursorPosFromCenter) => {
      // our relative mouse-position is passed through here to check.
      return cursorPosFromCenter >= min && cursorPosFromCenter <= max;
    },
  };
}

export function convertObjToString(obj) {
  return tinycolor(obj).toRgbString();
}

// Method is helpful for generating a radius representative of the stroke + taking into account lineWidth.
export function getEffectiveRadius(trueRadius, lineWidth) {
  return trueRadius - lineWidth / 2;
}
