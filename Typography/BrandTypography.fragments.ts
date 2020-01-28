import { gql } from 'apollo-boost'

const BrandTypographyFragments = {
  fonts: gql`
    fragment getAllFonts on Brand {
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

export default BrandTypographyFragments
