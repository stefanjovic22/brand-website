import { gql } from 'apollo-boost'
import BrandColorFragments from './BrandColor.fragments'

export const GET_COLORS = gql`
  query GetColors($brandId: UUID!) {
    colorsByBrandId(brandId: $brandId) {
      __typename
      _id
      hex
      rgb {
        red
        green
        blue
      }
      hsv {
        hue
        saturation
        value
      }
      lab {
        lightness
        a
        b
      }
      cmyk {
        cyan
        magenta
        yellow
        key
      }
      hwb {
        hue
        whiteness
        blackness
      }
      xyz {
        x
        y
        z
      }
      selectedColorMode
      title
      tags
    }
  }
`

export const GET_DEFAULT_COLOR_MODE = gql`
  ${BrandColorFragments.defaultColorMode}
  query getColorMode {
    brand @client {
      ...getDefaultColorMode
    }
  }
`
