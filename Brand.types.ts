import { DataValue } from 'react-apollo'

export type PickerColor = {
  hex: string
  hsl: {
    a: number
    h: number
    l: number
    s: number
  }
  hsv: {
    a: number
    h: number
    s: number
    v: number
  }
  oldHue: number
  rgb: {
    a: number
    b: number
    g: number
    r: number
  }
  source: string
}

export class ColorEntity {
  colors: ColorObject[]
}

export interface ColorObject {
  __typename: string
  _id: string
  hex: string
  hsl?: HslObject
  hsv?: HsvObject
  hwb?: HwbObject
  lab?: LabObject
  rgb?: RgbObject
  xyz?: XyzObject
  cmyk?: CmykObject
  tags?: string[]
  title: string
  selectedColorMode: ColorModeEnum
}

export interface HslObject {
  css: string
  hue: number
  lightness: number
  saturation: number
}

export interface HsvObject {
  css: string
  hue: number
  brightness: number
  saturation: number
}

export interface HwbObject {
  css: string
  hue: number
  blackness: number
  whiteness: number
}
export interface LabObject {
  css: string
  lightness: number
  a: number
  b: number
}

export interface RgbObject {
  css: string
  red: number
  blue: number
  green: number
}

export interface CmykObject {
  css: string
  cyan: number
  black: number
  yellow: number
  magenta: number
}

export interface XyzObject {
  css: string
  x: number
  y: number
  z: number
}

export enum ColorModeEnum {
  hex = 'hex',
  hsl = 'hsl',
  hsv = 'hsv',
  hwb = 'hwb',
  lab = 'lab',
  rgb = 'rgb',
  xyz = 'xyz',
  cmyk = 'cmyk'
}

type GetColorsResponse = {
  colorsByBrandId: [ColorObject]
}

export type GetColorsChildProps = {
  colorsByBrandId: DataValue<GetColorsResponse, {}>
}

export type Logo = {
  __typename: string
  _id: string
  id: string
  originalUrl: string
  encodedUrl: string
  encodedSize: LogoSize
  spacing: LogoSpacing
  title: string
  tags: Array<string>
}

export type LogoSize = {
  aspectRatio: number
  width: number
  height: number
}

export type LogoSpacing = {
  isEditedByUser: boolean
  topPercentage: number
  bottomPercentage: number
  leftPercentage: number
  rightPercentage: number
  spacingMultiple: number
}

export type BrandTypography = {
  body?: Font
  h1?: Font
  h2?: Font
  h3?: Font
}

export type Font = {
  __typename: string
  _id: string
  title: string
  tags: [string]
  element: string
  color: string
  font: string
  fontFamily: string
  fontSize: string
  fontVariant: string
  source: FontFamilySource
}

export type ColorMode = 'HEX' | 'RGB' | 'HSB' | 'LAB' | 'CMYK'

export type FontFamilySource = {
  ref: string
  provider: string
  variants: [string]
}

export type BrandItem = ColorObject | Logo | Font

export type BrandItemType = 'color' | 'logo' | 'font'

export type BrandOnboardingStatus = {
  colors: 'waiting' | 'process' | 'finished'
  logos: 'waiting' | 'process' | 'finished'
  typography: 'waiting' | 'process' | 'finished'
  templates: 'waiting' | 'process' | 'finished'
}

type GetBrandStatusResponse = {
  getBrandOnboardingStatus: BrandOnboardingStatus
}

export type GetBrandStatusChildProps = {
  getBrandOnboardingStatus: DataValue<GetBrandStatusResponse, {}>
}

export type UpdateBrandOnboardingStatus = {
  updateBrandOnboardingStatus: Function
}
