import { gql } from 'apollo-boost'

export const ENCODE_LOGO = gql`
  mutation EncodeLogo($brandId: UUID!, $imageFile: String!, $fileExt: String!) {
    encodeLogo(brandId: $brandId, imageFile: $imageFile, fileExt: $fileExt) {
      __typename
      _id
      encodedSize {
        width
        height
        aspectRatio
      }
      encodedUrl
      originalUrl
      spacing {
        isEditedByUser
        topPercentage
        bottomPercentage
        leftPercentage
        rightPercentage
      }
      title
      tags
    }
  }
`

export const SET_SPACING = gql`
  mutation ReplaceLogoSpacingObj(
    $brandId: UUID!
    $_id: UUID!
    $spacing: LogoSpacingInput!
  ) {
    replaceLogoSpacingObj(brandId: $brandId, _id: $_id, spacing: $spacing) {
      success
    }
  }
`
