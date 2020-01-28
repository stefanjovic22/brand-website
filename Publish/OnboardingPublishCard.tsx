/// <reference path='./OnboardingPublish.d.ts' />
import * as React from 'react'
import { Query, Mutation } from 'react-apollo'
import { Row, Col, Button, Icon } from 'antd'
import Link from 'next/link'
import { WithRouterProps, withRouter } from 'next/router'
import { UPDATE_SELECTED_COVERMODE } from './OnboardingPublish.mutations'
import { GET_DRAFT_GUIDELINE_BY_DOMAINSLUG } from '../../PublishedBrandGuidelines/PublishedBrandGuidelines.queries'
import { GET_GUIDELINE_COVER_SLUG } from './OnboardingPublish.queries'
import { CountryCode, CountryLanguage } from './OnboardingPublish.types'
import OnboardingPublishCardTemplate from './OnboardingPublishCardTemplate'
import OneBrandLogoBrandmark from '../../OneBrandLogo/OneBrandLogoBrandmark'
import styles from './OnboardingPublish.css'
import classnames from 'classnames/bind'
const copy = require('../../../lib/copy.json')

const cx = classnames.bind(styles)

interface OnboardingPublishCardProps extends WithRouterProps {
  coverSlug: string
  coverArtUrl: string
  domainSlug: string
  title: string
  description?: string
  countryLanguage: CountryLanguage
  market: CountryCode
}

const OnboardingPublishCard: React.FunctionComponent<
  OnboardingPublishCardProps
> = props => {
  const {
    coverSlug,
    coverArtUrl,
    domainSlug,
    title,
    description,
    countryLanguage,
    market
  } = props
  const { coverArtPreviewButtonText } = copy.private.brand.publishModal

  const { brandId } = props.router.query

  function updateCoverModeError (error){
    console.log(error)
  }

  return (
    <Query
      query={GET_DRAFT_GUIDELINE_BY_DOMAINSLUG}
      variables={{ domainSlug: domainSlug }}
    >
      {({ loading, data }) => {
        if (loading) return null
        const {
          coverArtSlug,
          guidelineObj: { logos }
        } = data.draftGuidelineByDomainSlug
        const logo = logos[0] || { encodedUrl: '' }
        const selectedCardStyle = coverArtSlug === coverSlug ? 'selected' : null
        const cardStyle = cx(selectedCardStyle, 'brandOnboardingPublishCard')
        const cardOverlayStyle = cx(selectedCardStyle, 'cardOverlay')
        return (
          <div className={cardStyle}>
            <div className={styles.cardCover}>
              <div className={cardOverlayStyle} />
              <OnboardingPublishCardTemplate
                coverArtSlug={coverSlug}
                bgUrl={coverArtUrl}
                bgLogoUrl={logo.encodedUrl}
              />
              <div className={styles.cardCoverFooter}>
                <OneBrandLogoBrandmark title='footerLogo' width={15} />
                <p className={styles.cardCoverFooterTitle}>
                  <u>Brand Guidelines</u> by <u>1brand</u>
                </p>
              </div>

              <Mutation
                mutation={UPDATE_SELECTED_COVERMODE}
                onError={error => updateCoverModeError(error)}
              >
                {updateSelectedCoverMode => (
                  <div className={styles.cardCoverButtons}>
                    <button
                      className={styles.cardSelectButton}
                      onClick={() =>
                        updateSelectedCoverMode({
                          variables: {
                            brandId,
                            coverArtSlug: coverSlug
                          },
                          refetchQueries: [
                            {
                              query: GET_DRAFT_GUIDELINE_BY_DOMAINSLUG,
                              variables: { domainSlug }
                            },
                            {
                              query: GET_GUIDELINE_COVER_SLUG,
                              variables: { brandId }
                            }
                          ]
                        })}
                    />
                    <Button
                      ghost
                      className='onebrand-button'
                      onClick={() =>
                        updateSelectedCoverMode({
                          variables: {
                            brandId,
                            coverArtSlug: coverSlug
                          },
                          refetchQueries: [
                            {
                              query: GET_DRAFT_GUIDELINE_BY_DOMAINSLUG,
                              variables: { domainSlug }
                            }
                          ]
                        })}
                    >
                      <Link href={`/brand/guidelines/${domainSlug}/draft`}>
                        <a target='_blank'>{coverArtPreviewButtonText}</a>
                      </Link>
                    </Button>
                  </div>
                )}
              </Mutation>
            </div>
            <div className={styles.cardMetadata}>
              <Row type='flex' justify='space-between' align='middle'>
                <Col>
                  <span className={styles.cardTitle}>{title}</span>{' '}
                  <span className='cardDescription'>{description || null}</span>
                </Col>
                <Col>
                  <Icon type='upload' />
                </Col>
              </Row>
              <Row type='flex' justify='space-between' align='middle'>
                <Col>
                  <Icon type='global' />
                  <span>
                    {countryLanguage.countryCode} {countryLanguage.language}
                  </span>
                </Col>
                <Col>
                  <span>{market} market</span>
                </Col>
              </Row>
            </div>
          </div>
        )
      }}
    </Query>
  )
}

export default withRouter(OnboardingPublishCard)
