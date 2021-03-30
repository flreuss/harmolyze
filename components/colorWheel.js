// NOTES:
// -- Array-destructuring assignment won't work w vanilla ie11; needs babel-polyfill lol

import React, { Component } from "react";
import PropTypes from "prop-types";

// Utils:
import {
  colorToRgbObj,
  getEffectiveRadius,
  calculateBounds,
} from "../lib/tinycolorUtils";

// Prop-types:
const propTypes = {
  radius: PropTypes.number.isRequired,
  lineWidth: PropTypes.number.isRequired,
  onValueSelected: PropTypes.func,
  padding: PropTypes.number,
  spacers: PropTypes.object,
  values: PropTypes.array,
  dynamicCursor: PropTypes.bool,
  preset: PropTypes.bool,
  presetValue: PropTypes.string,
  animated: PropTypes.bool,
  toRgbObj: PropTypes.bool,
};

const defaultProps = {
  padding: 0,
  dynamicCursor: true,
  preset: false,
  animated: true,
  toRgbObj: false,
};

// Global-vars:
const fullCircle = 2 * Math.PI;
const quarterCircle = fullCircle / 4;

class ColorWheel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      option: null,
      value: 0,
      innerWheelOpen: false,
      centerCircleOpen: false,
    };

    // Initialised just before the DOM has loaded; after constructor().
    this.outerWheelBounds = null;
    this.innerWheelBounds = null;
    this.centerCircleBounds = null;

    this.outerWheelRadius = null;
    this.innerWheelRadius = null;
    this.centerCircleRadius = null;
    this.firstSpacerRadius = null;
    this.secondSpacerRadius = null;

    // Initialised once the DOM has loaded.
    this.canvasEl = null;
    this.ctx = null;

    // Bindings:
    this.onCanvasHover = this.onCanvasHover.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);

    const { radius, lineWidth, padding } = props;

    // Setting effective radii:
    this.outerWheelRadius = radius;
    this.innerWheelRadius = this.outerWheelRadius - lineWidth - padding;
    this.centerCircleRadius = this.innerWheelRadius - lineWidth - padding;
    this.firstSpacerRadius = this.outerWheelRadius - lineWidth; // NOTE: effectiveRadius will take into account padding as lineWidth.
    this.secondSpacerRadius = this.innerWheelRadius - lineWidth;

    // Defining our bounds-objects, exposes a .inside(e) -> boolean method:
    this.outerWheelBounds = calculateBounds(radius - lineWidth, radius); // Draw this one out to illustrate
    this.innerWheelBounds = calculateBounds(
      this.innerWheelRadius - lineWidth,
      this.innerWheelRadius
    );
    this.centerCircleBounds = calculateBounds(0, this.centerCircleRadius);
    this.firstSpacerBounds = calculateBounds(
      this.firstSpacerRadius - padding,
      this.firstSpacerRadius
    );
    this.secondSpacerBounds = calculateBounds(
      this.secondSpacerRadius - padding,
      this.secondSpacerRadius
    );
  }

  // MARK - Common:
  getRelativeMousePos(clientX, clientY) {
    const { radius } = this.props;

    const canvasPos = this.canvasEl.getBoundingClientRect();
    const h = radius * 2;
    const w = radius * 2;

    // evtPos relative to our canvas.
    const onCanvas = {
      x: clientX - canvasPos.left,
      y: clientY - canvasPos.top,
    };

    // e is our mouse-position relative to the center of the canvasEl; using pythag
    const fromCenter = Math.sqrt(
      (onCanvas.x - w / 2) * (onCanvas.x - w / 2) +
        (onCanvas.y - h / 2) * (onCanvas.y - h / 2)
    );

    // This returns an object in which we have both mouse-pos relative to the canvas, as well as the true-middle.
    return {
      fromCenter,
      onCanvas,
    };
  }

  initCanvas() {
    const { radius } = this.props;

    const width = radius * 2;
    const height = radius * 2;

    this.ctx.clearRect(0, 0, width, height);

    this.drawOuterWheel();
    this.drawSpacers();
  }

  // MARK - Life-cycle methods:
  componentDidMount() {
    // Giving this context to our parent component.
    if (this.props.onRef) this.props.onRef(this);

    // Initialising our canvas & context objs.
    this.ctx = this.canvasEl.getContext("2d");

    if (this.props.preset) {
      for (let opt of this.props.options) {
        if (opt.values && opt.values.indexOf(this.props.presetValue) >= 0) {
          this.setState(
            {
              option: opt,
              value: opt.values.indexOf(this.props.presetValue),
              innerWheelOpen: true,
              centerCircleOpen: true,
            },
            () => {
              this.drawOuterWheel();
              this.drawInnerWheel();
              this.drawCenterCircle();
              this.drawSpacers();
            }
          );
        }
        for (let child of opt.children) {
          if (
            child.values &&
            child.values.indexOf(this.props.presetValue) >= 0
          ) {
            this.setState({ option: opt }, () => {
              this.drawOuterWheel();
              this.drawInnerWheel();
              this.setState(
                {
                  option: child,
                  value: child.values.indexOf(this.props.presetValue),
                  innerWheelOpen: true,
                  centerCircleOpen: true,
                },
                () => {
                  this.drawCenterCircle();
                  this.drawSpacers();
                }
              );
            });
          }
        }
      }
    } else {
      this.drawOuterWheel();
      this.drawSpacers();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.radius !== this.props.radius) {
      setTimeout(() => {
        if (this.canvasEl) {
          const { radius, lineWidth, padding } = this.props;
          // Setting effective radii:
          this.outerWheelRadius = radius;
          this.innerWheelRadius = this.outerWheelRadius - lineWidth - padding;
          this.centerCircleRadius = this.innerWheelRadius - lineWidth - padding;
          this.firstSpacerRadius = this.outerWheelRadius - lineWidth; // NOTE: effectiveRadius will take into account padding as lineWidth.
          this.secondSpacerRadius = this.innerWheelRadius - lineWidth;

          // Defining our bounds-objects, exposes a .inside(e) -> boolean method:
          this.outerWheelBounds = calculateBounds(radius - lineWidth, radius); // Draw this one out to illustrate
          this.innerWheelBounds = calculateBounds(
            this.innerWheelRadius - lineWidth,
            this.innerWheelRadius
          );
          this.centerCircleBounds = calculateBounds(0, this.centerCircleRadius);
          this.firstSpacerBounds = calculateBounds(
            this.firstSpacerRadius - padding,
            this.firstSpacerRadius
          );
          this.secondSpacerBounds = calculateBounds(
            this.secondSpacerRadius - padding,
            this.secondSpacerRadius
          );
          this.componentDidMount();
        }
      }, 250);
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  // MARK - mouse-events:
  onCanvasHover({ clientX, clientY }) {
    const evt = this.getRelativeMousePos(clientX, clientY);

    // Cases for mouse-location:
    if (this.outerWheelBounds.inside(evt.fromCenter)) {
      this.canvasEl.style.cursor = "pointer";
    } else if (
      this.innerWheelBounds.inside(evt.fromCenter) &&
      this.state.innerWheelOpen
    ) {
      this.canvasEl.style.cursor = "pointer";
    } else if (
      this.centerCircleBounds.inside(evt.fromCenter) &&
      this.state.centerCircleOpen
    ) {
      this.canvasEl.style.cursor = "pointer";
    } else {
      this.canvasEl.style.cursor = "auto";
    }
  }

  onCanvasClick({ clientX, clientY }) {
    const evt = this.getRelativeMousePos(clientX, clientY);

    // Cases for click-events:
    if (this.outerWheelBounds.inside(evt.fromCenter)) {
      this.outerWheelClicked(evt.onCanvas);
    } else if (
      this.innerWheelBounds.inside(evt.fromCenter) &&
      this.state.innerWheelOpen
    ) {
      this.innerWheelClicked(evt.onCanvas);
    } else if (this.centerCircleBounds.inside(evt.fromCenter)) {
      this.centerCircleClicked();
    }
  }

  // MARK - Clicks & action methods:
  outerWheelClicked(evtPos) {
    // returns an rgba array of the pixel-clicked.
    const rgbaArr = this.ctx.getImageData(evtPos.x, evtPos.y, 1, 1).data;
    const [r, g, b] = rgbaArr;
    const rgb = { r, g, b };

    const clicked = this.props.options.find(
      ({ color }) =>
        colorToRgbObj(color).r === rgb.r &&
        colorToRgbObj(color).g === rgb.g &&
        colorToRgbObj(color).b === rgb.b
    );

    if (clicked) {
      this.props.onValueSelected(clicked.values[0]);

      this.setState(
        {
          option: clicked,
          value: 0,
          innerWheelOpen: true,
          centerCircleOpen: true,
        },
        () => {
          this.drawInnerWheel();
          this.drawCenterCircle();
        }
      );
    }
  }

  innerWheelClicked(evtPos) {
    const rgbaArr = this.ctx.getImageData(evtPos.x, evtPos.y, 1, 1).data;
    const [r, g, b] = rgbaArr;
    const rgb = { r, g, b };

    let clicked = null;
    for (let opt of this.props.options) {
      for (let child of opt.children) {
        if (
          colorToRgbObj(child.color).r === rgb.r &&
          colorToRgbObj(child.color).g === rgb.g &&
          colorToRgbObj(child.color).b === rgb.b
        ) {
          clicked = child;
        }
      }
    }

    if (clicked) {
      this.props.onValueSelected(clicked.values[0]);

      this.setState(
        {
          option: clicked,
          value: 0,
          centerCircleOpen: true,
        },
        () => {
          this.drawCenterCircle();
        }
      );
    }
  }

  centerCircleClicked() {
    const value =
      this.state.value < this.state.option.values.length - 1
        ? this.state.value + 1
        : 0;
    this.props.onValueSelected(this.state.option.values[value]);
    this.setState(
      {
        value,
        centerCircleOpen: true,
      },
      () => {
        this.drawCenterCircle();
      }
    );
  }

  clear(callback = false) {
    this.setState(
      {
        rgb: null,
        innerWheelOpen: false,
        centerCircleOpen: false,
      },
      () => {
        // Reset state & re-draw.
        this.initCanvas();
        if (callback) callback();
      }
    );
  }

  // MARK - Drawing:
  drawOuterWheel() {
    const { radius, options, lineWidth } = this.props;
    const height = radius * 2;
    const width = radius * 2;

    // This value ensures that the stroke accounts for the lineWidth provided to produce an accurately represented radius.
    const effectiveRadius = getEffectiveRadius(radius, lineWidth);

    // Converting each color into a relative rgb-object we can iterate through.
    const rgbArr = options.map(({ color, values }) => ({
      rgb: colorToRgbObj(color),
      value: values[0],
    }));

    rgbArr.forEach(({ rgb, value }, i) => {
      this.ctx.beginPath();

      // Creates strokes 1 / rgbArr.length of the circle circumference.
      const startAngle = (fullCircle / rgbArr.length) * i;
      const endAngle = (fullCircle / rgbArr.length) * (i + 1);

      this.ctx.arc(
        width / 2,
        height / 2,
        effectiveRadius,
        startAngle,
        endAngle
      );
      this.ctx.lineWidth = lineWidth; // This is the width of the innerWheel.

      // Stroke-style changes based on the shade:
      this.ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      this.ctx.stroke();
      this.ctx.closePath();

      // Write text into the shades
      const midAngle = (startAngle + endAngle) / 2;

      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = `${lineWidth / 1.7}px Riemann`;
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        value,
        effectiveRadius * Math.cos(midAngle) + width / 2,
        effectiveRadius * Math.sin(midAngle) + height / 2,
        lineWidth
      );
    });
  }

  drawSpacers() {
    if (this.props.spacers) {
      this.drawSpacer(this.firstSpacerRadius);
      this.drawSpacer(this.secondSpacerRadius);
    }
  }

  drawSpacer(spacerRadius) {
    const {
      radius,
      padding,
      spacers: { color, shadowColor, shadowBlur },
    } = this.props;

    const height = radius * 2;
    const width = radius * 2;

    const effectiveRadius = getEffectiveRadius(spacerRadius, padding);

    this.ctx.beginPath();

    this.ctx.arc(width / 2, height / 2, effectiveRadius, 0, fullCircle);
    this.ctx.lineWidth = padding;

    this.ctx.shadowColor = shadowColor;
    this.ctx.shadowBlur = shadowBlur;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    this.ctx.closePath();

    // To reset our shadowColor for other strokes.
    this.ctx.shadowColor = "transparent";
  }

  drawInnerWheel(animationPercentage = 0) {
    // raf setup.
    let requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    const { radius, lineWidth, animated } = this.props;

    const height = radius * 2;
    const width = radius * 2;

    const effectiveRadius = getEffectiveRadius(
      this.innerWheelRadius,
      lineWidth
    );

    // Re-initialising canvas.
    this.ctx.clearRect(0, 0, width, height);

    this.drawOuterWheel();
    this.drawSpacers();

    const rgbShades = this.state.option.children;

    // Different functions for drawing our inner-wheel of shades.
    function drawShades() {
      rgbShades.forEach(({ color, value }, i) => {
        const rgb = colorToRgbObj(color);
        this.ctx.beginPath();

        const startAngle = (fullCircle / rgbShades.length) * i + quarterCircle;
        const endAngle =
          (fullCircle / rgbShades.length) * (i + 1) + (1 / 2) * Math.PI;

        this.ctx.arc(
          width / 2,
          height / 2,
          effectiveRadius,
          startAngle,
          endAngle
        );
        this.ctx.lineWidth = lineWidth; // This is the width of the innerWheel.

        // Stroke style changes based on the shade:
        this.ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.ctx.stroke();
        this.ctx.closePath();

        // Write text into the shades
        const midAngle = (startAngle + endAngle) / 2;

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${lineWidth / 1.7}px Riemann`;
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          value,
          effectiveRadius * Math.cos(midAngle) + width / 2,
          effectiveRadius * Math.sin(midAngle) + height / 2,
          lineWidth
        );
      });
    }

    function animateShades() {
      rgbShades.forEach(({ color, values }, i) => {
        const rgb = colorToRgbObj(color);
        this.ctx.beginPath();

        const startAngle = (fullCircle / rgbShades.length) * i + quarterCircle;
        const endAngle =
          (fullCircle / rgbShades.length) * (i + 1) + (1 / 2) * Math.PI;

        this.ctx.arc(
          width / 2,
          height / 2,
          effectiveRadius,
          startAngle,
          endAngle
        );
        this.ctx.lineWidth = lineWidth * animationPercentage; // This is the width of the innerWheel.

        // Stroke style changes based on the shade:
        this.ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.ctx.stroke();
        this.ctx.closePath();

        // Write text into the shades
        const midAngle = (startAngle + endAngle) / 2;

        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${lineWidth / 1.7}px Riemann`;
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          values[0],
          effectiveRadius * Math.cos(midAngle) + width / 2,
          effectiveRadius * Math.sin(midAngle) + height / 2,
          lineWidth
        );
      });

      animationPercentage += 1 / 10; // i.e. 1 / x frames

      // Essentially re-draws rgbShades.forEach until the animationPercentage reaches 1, i.e. 100%
      if (animationPercentage < 1) requestAnimationFrame(animateShades);
    }

    animateShades = animateShades.bind(this);
    drawShades = drawShades.bind(this);

    if (animated) {
      animateShades();
    } else {
      drawShades();
    }
  }

  drawCenterCircle() {
    const { option, value } = this.state;
    const rgb = option.color;
    const { radius } = this.props;

    const height = radius * 2;
    const width = radius * 2;
    this.ctx.lineWidth = 0;

    this.ctx.beginPath();
    this.ctx.arc(
      width / 2,
      height / 2,
      this.centerCircleRadius,
      0,
      2 * Math.PI
    );
    this.ctx.fillStyle = rgb;
    this.ctx.fill();
    this.ctx.lineWidth = 0.1;
    this.ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = `${this.centerCircleRadius / 1.7}px Riemann`;
    this.ctx.fillStyle = "white";
    this.ctx.fillText(option.values[value], width / 2, height / 2);
  }

  render() {
    const { radius, dynamicCursor } = this.props;

    return dynamicCursor ? (
      <canvas
        id="color-picker"
        onClick={this.onCanvasClick}
        onMouseMove={this.onCanvasHover}
        width={`${radius * 2}px`}
        height={`${radius * 2}px`}
        ref={(canvas) => (this.canvasEl = canvas)}
      />
    ) : (
      <canvas
        id="color-picker"
        onClick={this.onCanvasClick}
        width={`${radius * 2}px`}
        height={`${radius * 2}px`}
        ref={(canvas) => (this.canvasEl = canvas)}
      />
    );
  }
}

ColorWheel.propTypes = propTypes;
ColorWheel.defaultProps = defaultProps;

export default ColorWheel;
