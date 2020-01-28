import * as React from 'react'
import { WithRouterProps, withRouter } from 'next/router'
import { Row, Col } from 'antd'
import { find } from 'lodash'
import { Query } from 'react-apollo'
import { LIST_BRANDS } from '../../Brands/Brands.queries'
import { LISTCOVERART } from './OnboardingPublish.queries'
import OnboardingPublishCard from './OnboardingPublishCard'
import styles from './OnboardingPublish.css'
const copy = require('../../../lib/copy.json')

interface Props extends WithRouterProps {}

const OnboardingPublishBody: React.FunctionComponent<Props> = ({ router }) => {
  const { instructions } = copy.private.brand.publishModal
  return (
    <Query query={LIST_BRANDS}>
      {({ data, loading }) => {
        if (loading) return null
        const brands = data !== undefined ? data.listBrands : []
        const brand = find(brands, brand => {
          return brand.brandId === router.query.brandId
        })
        return (
          <Query query={LISTCOVERART}>
            {({ data, loading }) => {
              if (loading) return null
              const listCoverArt = data.listCoverArt
              return (
                <div className={styles.brandOnboardingPublishContent}>
                  <p>{instructions}</p>
                  <Row>
                    {listCoverArt.map(coverArt => {
                      const {
                        coverArtId,
                        coverArtSlug,
                        coverArtTitle
                      } = coverArt
                      const coverArtUrl = `/static/brand-onboarding/guideline-bg-${coverArtSlug}.png`
                      return (
                        <Col lg={8} md={12} sm={24} key={coverArtId}>
                          <OnboardingPublishCard
                            coverSlug={coverArtSlug}
                            coverArtUrl={coverArtUrl}
                            domainSlug={brand.domainSlug}
                            title={name}
                            description='Clean and Minimal'
                            countryLanguage={{
                              countryCode: 'US',
                              language: 'English'
                            }}
                            market='US'
                          />
                        </Col>
                      )
                    })}
                  </Row>
                </div>
              )
            }}
          </Query>
        )
      }}
    </Query>
  )
}

export default withRouter(OnboardingPublishBody)
