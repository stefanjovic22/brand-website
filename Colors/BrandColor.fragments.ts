import { gql } from 'apollo-boost'

const BrandColorFragments = {
  defaultColorMode: gql`
    fragment getDefaultColorMode on Brand {
      defaultColorMode
    }
  `,
  colors: gql`
    fragment getAllColors on Brand {
      colors {
        id
        hexValue
        rgbValue {
          red
          green
          blue
        }
        hsbValue {
          hue
          saturation
          brightness
        }
        labValue {
          lightness
          a
          b
        }
        cmykValue {
          cyan
          magenta
          yellow
          black
        }
        selectedColorMode
        title
        tags
      }
    }
  `
}

export default BrandColorFragments
