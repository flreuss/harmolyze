import React, { Component } from "react";
import { produceRgbShades } from "../lib/tinycolorUtils";

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
          preset
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
