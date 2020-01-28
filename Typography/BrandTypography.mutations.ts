import { gql } from 'apollo-boost'

export const ADD_TYPOGRAPHY = gql`
  mutation AddTypography($brandId: UUID!, $typographyObj: TypographyInput!) {
    addTypography(brandId: $brandId, typographyObj: $typographyObj) {
      success
    }
  }
`
