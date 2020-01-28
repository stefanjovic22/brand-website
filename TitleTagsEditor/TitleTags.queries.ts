import { gql } from 'apollo-boost'

export const GET_TITLE_TAGS = gql`
  query GetTitleTags($brandId: UUID!, $_id: UUID!) {
    getTitleTags(brandId: $brandId, _id: $_id) {
      _id
      title
      tags
    }
  }
`
