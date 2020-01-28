/// <reference path="../BrandLogo.d.ts" />
import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Query, Mutation } from 'react-apollo'
import { GET_GUIDE_RENDER_VALUES, GET_LOGO } from '../BrandLogo.queries'
import { LoadLogoIntoEditor as LOAD_LOGO } from '../BrandLogo.client.graphql'
import LogoContainer from './LogoContainer'
import styles from './LogoEditor.css'

// `containerSize` comes from the react-sizeme HOC used on LogoContainer
function onLogoContainerSize (
  containerSize,
  logoSize,
  logoId,
  loadLogoIntoEditor
){
  const [
    containerWidth,
    containerHeight,
    logoEncodedWidth,
    logoEncodedHeight
  ] = [
    containerSize.width,
    containerSize.height,
    logoSize.width,
    logoSize.height
  ]
  /* The container size is predetermined by CSS flexbox properties.
  But the logo size needs to be calculated based on that container.
  So we'll use these intermediate values—the logo file's actual
  width and height in pixels—to make those calculations. */
  const [ logoWidth, logoHeight ] = calculateLogoDimensions(
    containerWidth,
    containerHeight,
    logoEncodedWidth,
    logoEncodedHeight
  )
  const logoDisplaySize = {
    containerWidth,
    containerHeight,
    logoWidth,
    logoHeight
  }
  loadLogoIntoEditor({
    variables: { logoId, logoDisplaySize },
    refetchQueries: [
      {
        query: GET_GUIDE_RENDER_VALUES
      }
    ]
  })
}

function calculateLogoDimensions (
  containerWidth,
  containerHeight,
  logoEncodedWidth,
  logoEncodedHeight
){
  /* In order to properly fit the logo into its container, we need to know
  whether it is wider than it is tall, or vice-versa. This is so we can
  keep both its dimensions within < 20% of the container, because otherwise
  the logo clearance bounding box we display might overflow the container
  at 2x (40% on each side and 20% for the logo itself). */
  const containerRatio = containerWidth / containerHeight
  const logoRatio = logoEncodedWidth / logoEncodedHeight

  const logoWidth =
    containerRatio > logoRatio
      ? /* The container is more "landscape-y" than the logo; that means
      we need to prioritize shrinking the logo's height to fit inside
      the container's height, and set the logo's width according to
      that ratio. */
        logoEncodedWidth / (logoEncodedHeight / (containerHeight * 0.19))
      : /* Other way around: The container is more "portrait-y"
      than the logo, so we'll prioritize shrinking the logo's width
      to fit inside the container's width. The logo's height will
      then be well within the container's. */
        containerWidth * 0.19
  // Here we'll just do the reverse of what we did for width.
  const logoHeight =
    containerRatio < logoRatio
      ? logoEncodedHeight / (logoEncodedWidth / (containerWidth * 0.19))
      : containerHeight * 0.19
  return [ logoWidth, logoHeight ]
}

function setGuideVisibility (guides){
  delete guides.__typename
  let visible = 'hidden'
  for (const key of Object.keys(guides)) {
    if (guides[key] !== null) {
      visible = 'visible'
    }
  }
  return visible
}

interface LogoEditorDisplayProps extends WithRouterProps {
  logoId: string
}

const LogoEditorDisplay: React.FunctionComponent<
  LogoEditorDisplayProps
> = props => {
  const { logoId, router } = props
  const { brandId } = router.query
  return (
    <Query query={GET_GUIDE_RENDER_VALUES}>
      {({ loading, data }) => {
        if (loading) return null
        const {
          logoDisplaySize,
          widthControlsEnabled,
          guideOffset,
          spacingMultiple
        } = data.editor
        const {
          containerWidth,
          containerHeight,
          logoWidth,
          logoHeight
        } = logoDisplaySize

        /* This is what we'll use to size the logo's containing <div>
        to exactly the size we need the logo to be. */
        const logoStyle = {
          width: `${logoWidth}px`,
          height: `${logoHeight}px`
        }

        // We need the location of each edge of the logo—
        // relative to the bottom-left corner of the container box—
        // for most of the calculations that follow.
        const logoTop = -(containerHeight / 2 + logoHeight / 2)
        const logoBottom = logoTop + logoHeight
        const logoLeft = (containerWidth - logoWidth) / 2
        const logoRight = logoLeft + logoWidth

        // We set the line-width of the guides here because the
        // LogoContainer needs it to render, and the sliders
        // also need it to set their yMax value.
        const lineBorderWidth = 1

        // If no edits have been made by the user, we'll
        // just keep all the lines/bounding box invisible.
        const lineVisibility = setGuideVisibility(guideOffset)
        const lineStyle = {
          position: 'relative',
          border: `${lineBorderWidth}px solid #ef5350`,
          visibility: lineVisibility,
          zIndex: 20
        } as React.CSSProperties

        // Top boundary line - don't forget that `logoTop`
        // is a negative number. Includes `lineBorderWidth * 2`
        // to account for its own thickness.
        const linePositionTop = logoTop + guideOffset.top - lineBorderWidth * 2
        const lineStyleTop = {
          ...lineStyle,
          top: `${linePositionTop}px`,
          width: '100%'
        } as React.CSSProperties

        // Bottom boundary line
        // Don't forget that `logoBottom` is a negative number.
        // This calculation also contains "lineBorderWidth * 2"
        // to account for the fact that the bottom line div
        // starts its relative position slightly lower than
        // the top line div because the top line div comes first.
        const linePositionBottom =
          logoBottom - guideOffset.bottom - lineBorderWidth * 2
        const lineStyleBottom = {
          ...lineStyle,
          top: `${linePositionBottom}px`,
          width: '100%'
        } as React.CSSProperties

        // Left boundary line
        const linePositionLeft = logoLeft + guideOffset.left - lineBorderWidth
        const lineStyleLeft = {
          ...lineStyle,
          left: `${linePositionLeft}px`,
          // Must include lineBorderWidth * 4 because
          // the left line comes "below" two other elements
          // that push it down by lineBorderWidth * 2 each
          top: `calc(-100% - ${lineBorderWidth * 4}px)`,
          width: `${lineBorderWidth}px`,
          height: '100%',
          // If the width controls aren't on, we hide this
          visibility: widthControlsEnabled ? lineVisibility : 'hidden'
        } as React.CSSProperties

        // Right boundary line
        const linePositionRight =
          logoRight - guideOffset.right - lineBorderWidth
        const lineStyleRight = {
          ...lineStyle,
          left: `${linePositionRight + lineBorderWidth}px`,
          // Must include lineBorderWidth * 4 because
          // the right line comes "below" two other elements
          // that push it down by lineBorderWidth * 2 each
          top: `calc(-200% - ${lineBorderWidth * 4}px)`,
          width: `${lineBorderWidth}px`,
          height: '100%',
          // If the width controls aren't on, we hide this
          visibility: widthControlsEnabled ? lineVisibility : 'hidden'
        } as React.CSSProperties

        /* Clearance Box */
        /* Here we'll calculate the dimensions of the box
        created by the guides themselves. We use Math.abs()
        to account for the possibility that the user might
        move the top/bottom or left/right guides past each other. */
        const guideBoxHeight = Math.abs(linePositionBottom - linePositionTop)
        const guideBoxWidth = Math.abs(linePositionRight - linePositionLeft)

        // Now we can use that box to calculate the actual clearance box.
        const clearanceBoxTop = `${(containerHeight - logoHeight) / 2 -
          guideBoxHeight * spacingMultiple}px`

        const clearanceBoxHeight = `${logoHeight +
          guideBoxHeight * 2 * spacingMultiple}px`

        const clearanceBoxLeft = !widthControlsEnabled
          ? // No x-axis controls are in use; use the y-axis dimensions
            `${logoLeft - guideBoxHeight * spacingMultiple}px`
          : // x-axis controls are in use
            `${logoLeft - guideBoxWidth * spacingMultiple}px`

        const clearanceBoxWidth = !widthControlsEnabled
          ? // No x-axis controls are in use; use the y-axis dimensions
            `${logoWidth + guideBoxHeight * 2 * spacingMultiple}px`
          : // x-axis controls are in use
            `${logoWidth + guideBoxWidth * 2 * spacingMultiple}px`

        const clearanceBoxStyle = {
          ...lineStyle,
          border: 0,
          backgroundColor: '#d7d7d7',
          position: 'absolute',
          top: clearanceBoxTop,
          left: clearanceBoxLeft,
          height: clearanceBoxHeight,
          width: clearanceBoxWidth,
          zIndex: 1
        } as React.CSSProperties

        return (
          <Query query={GET_LOGO} variables={{ _id: logoId, brandId }}>
            {({ loading, data }) => {
              if (loading) return null
              const logo = data.logoByObjId || {
                encodedUrl: '',
                encodedSize: { width: 0, height: 0 }
              }
              const { encodedUrl, encodedSize } = logo
              return (
                <Mutation mutation={LOAD_LOGO}>
                  {loadLogoIntoEditor => (
                    <LogoContainer
                      onSize={containerSize =>
                        onLogoContainerSize(
                          containerSize,
                          encodedSize,
                          logoId,
                          loadLogoIntoEditor
                        )}
                    >
                      <div className={styles.logoPositionBox}>
                        <div style={logoStyle}>
                          <img
                            src={encodedUrl}
                            className={styles.logo}
                            alt='Company logo'
                          />
                        </div>
                      </div>
                      <div
                        className='boundary-line boundary-line-top'
                        style={lineStyleTop}
                      />
                      <div
                        className='boundary-line boundary-line-bottom'
                        style={lineStyleBottom}
                      />
                      <div
                        className='boundary-line boundary-line-left'
                        style={lineStyleLeft}
                      />
                      <div
                        className='boundary-line boundary-line-right'
                        style={lineStyleRight}
                      />
                      <div className='clearanceBox' style={clearanceBoxStyle} />
                    </LogoContainer>
                  )}
                </Mutation>
              )
            }}
          </Query>
        )
      }}
    </Query>
  )
}

export default withRouter<LogoEditorDisplayProps>(LogoEditorDisplay)
