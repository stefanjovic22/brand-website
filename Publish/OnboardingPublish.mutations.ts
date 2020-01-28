import { gql } from 'apollo-boost'

export const PUBLISH_GUIDELINE = gql`
  mutation PublishGuideline($brandId: UUID!) {
    publishGuideline(brandId: $brandId) {
      success
    }
  }
`

export const UPDATE_SELECTED_COVERMODE = gql`
  mutation UpdateSelectedCoverMode($brandId: UUID!, $coverArtSlug: String!) {
    updateSelectedCoverMode(brandId: $brandId, coverArtSlug: $coverArtSlug) {
      success
    }
  }
`

export const UPDATE_ONBOARDING_STATUS = gql`
  mutation UpdateBrandOnboardingStatus($brandId: UUID!, $values: JSON!) {
    updateBrandOnboardingStatus(brandId: $brandId, values: $values)
  }
`
