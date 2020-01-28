import { gql } from 'apollo-boost'

export const UPDATE_SELECTED_COLOR_MODE = gql`
  mutation UpdateSelectedColorMode(
    $brandId: UUID!
    $id: UUID!
    $selectedColorMode: ColorModeEnum!
  ) {
    updateSelectedColorMode(
      brandId: $brandId
      _id: $id
      selectedColorMode: $selectedColorMode
    ) {
      success
    }
  }
`

export const ADD_COLOR = gql`
  mutation AddColor($brandId: UUID!, $hex: String!) {
    addColor(brandId: $brandId, hex: $hex) {
      success
    }
  }
`
