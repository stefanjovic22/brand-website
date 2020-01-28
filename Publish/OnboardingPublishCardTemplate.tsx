import * as React from 'react'
import styles from './OnboardingPublish.css'
import classnames from 'classnames/bind'

const cx = classnames.bind(styles)

type Props = {
  coverArtSlug: string
  bgUrl?: string
  bgLogoUrl?: string
}

const OnboardingPublishCardTemplate: React.FunctionComponent<Props> = props => {
  const { coverArtSlug, bgUrl, bgLogoUrl } = props
  const getBodyContainer = coverArtSlug => {
    switch (coverArtSlug) {
      case 'cover3':
        return (
          <div className={styles.defaultCoverBodyLayout}>
            <div className={cx(styles.guidelinesTitle, styles.textWhiteColor)}>
              BRAND GUIDELINES
            </div>
            <div className={styles.logoArea}>
              <img src={bgLogoUrl} className={styles.logo} alt='Brand Logo' />
            </div>
          </div>
        )
      case 'cover4':
        return (
          <React.Fragment>
            <div className={styles.logoArea}>
              <img
                src={bgLogoUrl}
                className={cx(styles.templateFourLogo, styles.logo)}
                alt='Brand Logo'
              />
            </div>
            <div
              className={cx(
                styles.guidelinesTitle,
                styles.templateFourTitle,
                styles.textWhiteColor
              )}
            >
              BRAND GUIDELINES
            </div>
          </React.Fragment>
        )
      case 'cover5':
        return (
          <div className={styles.temFiveCoverBodyLayout}>
            <div className={styles.logoArea}>
              <img src={bgLogoUrl} className={styles.logo} alt='Brand Logo' />
            </div>
            <div className={cx(styles.guidelinesTitle, styles.textWhiteColor)}>
              BRAND GUIDELINES
            </div>
          </div>
        )
      case 'cover6':
        return (
          <div className={styles.defaultCoverBodyLayout}>
            <div className={cx(styles.guidelinesTitle, styles.textWhiteColor)}>
              BRAND GUIDELINES
            </div>
            <div className={styles.logoArea}>
              <img src={bgLogoUrl} className={styles.logo} alt='Brand Logo' />
            </div>
          </div>
        )
      default:
        return (
          <div className={styles.defaultCoverBodyLayout}>
            <div className={styles.logoArea}>
              <img src={bgLogoUrl} className={styles.logo} alt='Brand Logo' />
            </div>
            <div className={styles.guidelinesTitle}>BRAND GUIDELINES</div>
          </div>
        )
    }
  }
  const cardBodyBgStyle =
    coverArtSlug === 'cover3' ? 'cardCoverBodyBgColor' : 'cardCoverBodyBgImg'
  const cardCoverBodyStyle = cx(cardBodyBgStyle, 'cardCoverBody')
  return (
    <div
      className={cardCoverBodyStyle}
      style={{
        backgroundImage: `url(${bgUrl})`
      }}
    >
      {getBodyContainer(coverArtSlug)}
    </div>
  )
}

export default OnboardingPublishCardTemplate
