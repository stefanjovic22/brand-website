import { gql } from 'apollo-boost'

/* Fragments for the resolver to use in mutations */

const BrandLogoFragments = {
  logo: gql`
    fragment getLogo on LogoPayload {
      _id
      encodedSize {
        aspectRatio
        width
        height
      }
      encodedUrl
      originalUrl
      spacing {
        isEditedByUser
        topPercentage
        bottomPercentage
        leftPercentage
        rightPercentage
        spacingMultiple
      }
    }
  `,
  logoSpacing: gql`
    fragment getLogoSpacing on LogoPayload {
      _id
      spacing {
        isEditedByUser
        topPercentage
        bottomPercentage
        leftPercentage
        rightPercentage
        spacingMultiple
      }
    }
  `,
  editor: gql`
    fragment getEditor on LogoEditor {
      logoDisplaySize {
        containerWidth
        containerHeight
        logoWidth
        logoHeight
      }
      controlsEnabled
      widthControlsEnabled
      guideOffset {
        top
        bottom
        left
        right
      }
      axisLinked {
        y
        x
      }
      spacingMultiple
    }
  `,
  displaySize: gql`
    fragment getLogoDisplaySize on LogoEditor {
      logoDisplaySize {
        containerWidth
        containerHeight
        logoWidth
        logoHeight
      }
    }
  `,
  controls: gql`
    fragment getControlsStatus on LogoEditor {
      controlsEnabled
      widthControlsEnabled
    }
  `,
  widths: gql`
    fragment getWidths on LogoEditor {
      widthControlsEnabled
      guideOffset {
        left
        right
      }
    }
  `,
  guides: gql`
    fragment getGuideValues on LogoEditor {
      guideOffset {
        top
        bottom
        left
        right
      }
      axisLinked {
        y
        x
      }
      spacingMultiple
    }
  `,
  spacingMultiple: gql`
    fragment getSpacingMultiple on LogoEditor {
      spacingMultiple
    }
  `
}

export default BrandLogoFragments
