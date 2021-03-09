import React, { Component } from "react";
import {
  produceRgbShades,
} from "../lib/tinycolorUtils";

// react-colour-wheel:
import ColourWheel from "../components/colourWheel";

class ColourWheelTest extends Component {
  state = {
    selectedValue: "T",
  };

  clearColourWheel = () => {
    this.colourWheel.clear(() => {
      this.setState({ selectedValue: "T" });
    });
  };

  render() {
    const { selectedValue: selectedValue } = this.state;

    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          backgroundColor: "#394032",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#FFFFFF" }}>
          <h1>
            <span>react-colour-wheel</span>
          </h1>
          <h2>
            <span>{selectedValue}</span>
          </h2>
        </div>

        <ColourWheel
          values={[
            {
              colour: "rgb(255,0,0)",
              value: "D",
              shades: [
                { colour: "rgb(255,51,51)", value: "Dp" },
                { colour: "rgb(179,0,0)", value: "Dg" },
                { colour: "rgb(255,25,51)", value: "(D)" },
                { colour: "rgb(179,25,25)", value: "/D" },
              ],
            },
            {
              colour: "rgb(0,255,0)",
              value: "S",
              shades: [
                { colour: "rgb(51, 255, 51)", value: "Sp" },
                { colour: "rgb(0, 179, 0)", value: "Sg" },
              ],
            },
            {
              colour: "rgb(0,0,255)",
              value: "T",
              shades: [
                { colour: "rgb(51, 51, 255)", value: "Tp" },
                { colour: "rgb(0, 0, 179)", value: "Tg" },
              ],
            },
          ]}
          radius={175}
          padding={10}
          lineWidth={50}
          onValueSelected={(val) => this.setState({ selectedValue: val })}
          onRef={(ref) => (this.colourWheel = ref)}
          spacers={{
            colour: "#FFFFFF",
            shadowColour: "grey",
            shadowBlur: 5,
          }}
          preset // You can set this bool depending on whether you have a pre-selected colour in state.
          presetValue={this.state.selectedValue}
          animated
        />

        <div
          onClick={this.clearColourWheel}
          style={{
            cursor: "pointer",
            fontSize: 20,
            fontWeight: "500",
            color: "#FFFFFF",
            marginTop: 20,
          }}
        >
          clear
        </div>
      </div>
    );
  }
}

export default ColourWheelTest;
