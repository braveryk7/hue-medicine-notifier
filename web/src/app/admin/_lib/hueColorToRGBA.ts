import { Light } from '@/app/types/HueLight';
import Color from 'colorjs.io';

type colorStatus = {
  x?: number;
  y?: number;
  brightness?: number;
  colorTemperature?: number;
  rgba?: object;
};
type HugLightToRGBA = (lightData: Light) => colorStatus;

type HueColorToRGBA = (params: { x: number; y: number; brightness: number }) => string;
type HueNonColorToRGBA = (params: { brightness: number; colorTemperature: number }) => string;

export const hueLightToRGBA: HugLightToRGBA = (lightData) => {
  let rgba = 'rgba(0, 0, 0, 1.0)';

  const colorStatus = {
    x: lightData.color?.xy?.x || undefined,
    y: lightData.color?.xy?.y || undefined,
    brightness: lightData.dimming?.brightness || undefined,
    colorTemperature: lightData.color_temperature?.mirek || undefined,
    rgba: {},
  };

  if (colorStatus.x && colorStatus.y && colorStatus.brightness) {
    rgba = hueColorToRGBA({ x: colorStatus.x, y: colorStatus.y, brightness: colorStatus.brightness });
  } else if (colorStatus.brightness && colorStatus.colorTemperature) {
    rgba = hueNonColorToRGBA({ brightness: colorStatus.brightness, colorTemperature: colorStatus.colorTemperature });
  } else if (colorStatus.brightness) {
    rgba = hueBrightnessToRGBA(colorStatus.brightness);
  }

  colorStatus.rgba = rgba;

  return { ...colorStatus };
};

export const hueColorToRGBA: HueColorToRGBA = ({ x, y, brightness }) => {
  const Y = brightness / 100;
  const color = new Color('xyz', [x * (Y / y), Y, (1 - x - y) * (Y / y)]);
  const [r, g, b] = color.to('srgb').coords;
  const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 1.0)`;

  return rgba;
};

export const hueNonColorToRGBA: HueNonColorToRGBA = ({ brightness, colorTemperature }) => {
  const kelvin = 1_000_000 / Math.min(Math.max(colorTemperature, 153), 500);
  const normalizedBrightness = Math.min(Math.max(brightness, 0), 100) / 100;

  // kelvinToRgbでRGBを計算し、各チャネルに明るさを適用
  const [r, g, b] = Object.values(kelvinToRgb(kelvin)).map((channel) => channel * normalizedBrightness);

  // RGBA形式の文字列を生成
  const rgba = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 1.0)`;

  // 一貫性を持たせてオブジェクト形式で返す
  return rgba;
};

export const hueBrightnessToRGBA = (bri: number): string => {
  // 明るさを0～1の範囲に正規化
  const normalizedBrightness = Math.min(Math.max(bri, 0), 100) / 100;

  // 白黒（GrayScale）としてRGBAを生成
  const gray = Math.round(normalizedBrightness * 255);
  const rgba = `rgba(${gray}, ${gray}, ${gray}, 1.0)`;

  return rgba;
};

const kelvinToRgb = (kelvin: number): { r: number; g: number; b: number } => {
  let temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green = temp;
    green = 99.4708025861 * Math.log(green) - 161.1195681661;
    blue = temp <= 19 ? 0 : temp - 10;
    blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
  } else {
    red = temp - 60;
    red = 329.698727446 * Math.pow(red, -0.1332047592);
    green = temp - 60;
    green = 288.1221695283 * Math.pow(green, -0.0755148492);
    blue = 255;
  }

  return {
    r: Math.min(Math.max(Math.round(red), 0), 255),
    g: Math.min(Math.max(Math.round(green), 0), 255),
    b: Math.min(Math.max(Math.round(blue), 0), 255),
  };
};
