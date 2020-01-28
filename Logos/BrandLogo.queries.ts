import { gql } from 'apollo-boost'
import BrandLogoFragments from './BrandLogo.fragments'

export const GET_LOGOS_BY_DOMAIN_SLUG = gql`
  query getLogosByDomainSlug($domainSlug: String!) {
    logosByDomainSlug(domainSlug: $domainSlug) {
      _id
      originalUrl
      encodedUrl
      spacing {
        bottomPercentage
        isEditedByUser
        leftPercentage
        rightPercentage
        spacingMultiple
        topPercentage
      }
      title
      tags
      encodedSize {
        height
        width
        aspectRatio
      }
    }
  }
`

export const GET_LOGOS = gql`
  query getLogos($brandId: UUID!) {
    logosByBrandId(brandId: $brandId) {
      _id
      originalUrl
      encodedUrl
      spacing {
        bottomPercentage
        isEditedByUser
        leftPercentage
        rightPercentage
        spacingMultiple
        topPercentage
      }
      title
      tags
      encodedSize {
        height
        width
        aspectRatio
      }
    }
  }
`

export const GET_LOGO = gql`
  query LogoByObjId($_id: UUID!, $brandId: UUID!) {
    logoByObjId(_id: $_id, brandId: $brandId) {
      _id
      encodedSize {
        aspectRatio
        height
        width
      }
      encodedUrl
      originalUrl
      spacing {
        bottomPercentage
        isEditedByUser
        rightPercentage
        leftPercentage
        spacingMultiple
        topPercentage
      }
      tags
      title
    }
  }
`

// For LogoEditor to use in rendering the guides/bounding box
export const GET_GUIDE_RENDER_VALUES = gql`
  query editorGuides {
    editor @client {
      ...getLogoDisplaySize
      ...getControlsStatus
      guideOffset {
        top
        bottom
        left
        right
      }
      ...getSpacingMultiple
    }
  }
  ${BrandLogoFragments.displaySize}
  ${BrandLogoFragments.spacingMultiple}
  ${BrandLogoFragments.controls}
`

// For LogoEditorControls to get control display data
export const GET_CONTROL_DISPLAY_INFO = gql`
  query editorControls {
    editor @client {
      controlsEnabled
      widthControlsEnabled
      spacingMultiple
    }
  }
`

// For LogoEditorSliderSet
export const GET_AXIS_LINK_STATUS = gql`
  query editorAxisLinks {
    editor @client {
      axisLinked {
        y
        x
      }
    }
  }
`

// For LogoEditorSlider
export const GET_GUIDE_OFFSET = gql`
  query editorGuideOffsets {
    editor @client {
      guideOffset {
        top
        bottom
        left
        right
      }
    }
  }
`
