import { gql } from 'apollo-boost'

export const REPLACE_TITLE_TAGS = gql`
  mutation ReplaceTitleTags(
    $brandId: UUID!
    $_id: UUID!
    $title: String
    $tags: [String]
  ) {
    replaceTitleTags(brandId: $brandId, _id: $_id, title: $title, tags: $tags) {
      success
    }
  }
`
