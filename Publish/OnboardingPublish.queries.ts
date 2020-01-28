import { gql } from 'apollo-boost'

export const GET_GUIDELINE_ID = gql`
  query GuidelinesByBrandId($brandId: UUID!, $isPublic: Boolean!) {
    guidelinesByBrandId(brandId: $brandId, isPublic: $isPublic) {
      guidelineId
      isPublic
    }
  }
`
export const LISTCOVERART = gql`
  query listCoverArt {
    listCoverArt {
      coverArtId
      coverArtSlug
      coverArtTitle
    }
  }
`

export const GET_GUIDELINE_COVER_SLUG = gql`
  query DraftGuidelinesByBrandId($brandId: UUID!) {
    draftGuidelinesByBrandId(brandId: $brandId) {
      coverArtSlug
    }
  }
`

export const GET_BRAND_STATUS = gql`
  query GetBrandOnboardingStatus($brandId: UUID!) {
    getBrandOnboardingStatus(brandId: $brandId) {
      colors
      logos
      templates
      typography
    }
  }
`
