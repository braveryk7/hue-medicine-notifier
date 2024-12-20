import React from 'react';

export type FormPartsWrapperProps = { children: React.ReactNode };

export type DisplayRangeValueProps = { value: number };

export type BrightnessSelectorProps = {
  brightness: number;
  setBrightness: React.Dispatch<React.SetStateAction<number>>;
};

type Brightness = {
  brightness: number;
  setBrightness: React.Dispatch<React.SetStateAction<number>>;
};

export type ColorModelProps = {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
} & Brightness;

export type WhiteAmbianceModelProps = {
  ct: number;
  setCt: React.Dispatch<React.SetStateAction<number>>;
} & Brightness;

export type WhiteModelProps = Brightness;
