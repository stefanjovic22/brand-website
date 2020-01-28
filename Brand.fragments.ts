import { gql } from 'apollo-boost'

const BrandFragments = {
  colors: gql`
    fragment getColors on Brand {
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
  `,
  logos: gql`
    fragment getLogos on Brand {
      logos {
        id
        originalUrl
        encodedUrl
        encodedSize {
          width
          height
        }
        spacing {
          isEditedByUser
          topPercentage
          bottomPercentage
          leftPercentage
          rightPercentage
          spacingMultiple
        }
        title
        tags
      }
    }
  `,
  fonts: gql`
    fragment getFonts on Brand {
      fonts {
        id
        element
        source
        name
        stylesUsed
        title
        tags
        previewImageUrl
        thumbnailImageUrl
      }
    }
  `
}

export default BrandFragments
