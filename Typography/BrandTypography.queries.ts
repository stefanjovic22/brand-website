import { gql } from 'apollo-boost'

export const GET_TYPOGRAPHY = gql`
  query GetTypography($brandId: UUID!) {
    typographyByBrandId(brandId: $brandId) {
      __typename
      _id
      color
      element
      font
      fontFamily
      fontSize
      fontVariant
      source {
        provider
        ref
        variants
      }
      tags
      title
    }
  }
`

export const FETCH_TYPOGRAPHY_SOURCE = gql`
  query FetchTypographySource($_id: String!, $brandId: UUID!) {
    fetchTypographySource(_id: $_id, brandId: $brandId) {
      _id
      source {
        provider
        ref
        variants
      }
    }
  }
`
