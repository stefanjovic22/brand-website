import { gql } from 'apollo-boost'

export const DELETE_ITEM_CARD = gql`
  mutation RemoveObject($brandId: UUID!, $id: UUID!) {
    removeObjByObjId(brandId: $brandId, _id: $id) {
      success
    }
  }
`
