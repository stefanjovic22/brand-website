/// <reference path='../../Modal/Modal.d.ts' />
import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import Link from 'next/link'
import { compose, graphql, Mutation } from 'react-apollo'
import { GET_GUIDELINE_COVER_SLUG } from './OnboardingPublish.queries'
import { PublishGuideline } from './OnboardingPublish.types'
import {
  GetBrandStatusChildProps,
  UpdateBrandOnboardingStatus
} from '../../Brand/Brand.types'
import { LIST_BRANDS } from '../../Brands/Brands.queries'
import {
  ListBrandChildProps,
  GetScrapeStatusChildProps,
  SetBrandScrapeStatus,
  DraftGuidelinesByBrandIdChildProps
} from '../../Brands/Brand.types'
import {
  GetModalStatus as GET_MODAL_STATUS,
  ToggleModalOpen as TOGGLE_MODAL
} from '../../Modal/Modal.client.graphql'
import { ToggleModalOpen } from '../../Modal/Modal.types'
import {
  PUBLISH_GUIDELINE,
  UPDATE_ONBOARDING_STATUS
} from './OnboardingPublish.mutations'
import {
  GET_DRAFT_GUIDELINE_BY_DOMAINSLUG,
  GET_PUBLISHED_GUIDELINE_BY_DOMAINSLUG
} from '../../PublishedBrandGuidelines/PublishedBrandGuidelines.queries'
import { Button } from 'antd'
import styles from './OnboardingPublish.css'
import AllModals from '../../Modal/Modal.defaults'
const copy = require('../../../lib/copy.json')

const { modals } = AllModals
const publishModalId = modals.find(
  modal => modal.name === 'AddEditModalPublish'
).id
const successModalId = modals.find(
  modal => modal.name === 'ShareModalGuidelinesPublished'
).id

type OnboardingPublishFooterProps = WithRouterProps &
  ToggleModalOpen &
  GetBrandStatusChildProps &
  UpdateBrandOnboardingStatus &
  ListBrandChildProps &
  GetScrapeStatusChildProps &
  DraftGuidelinesByBrandIdChildProps &
  SetBrandScrapeStatus &
  PublishGuideline

const OnboardingPublishFooter: React.FunctionComponent<
  OnboardingPublishFooterProps
> = props => {
  function onPublishError (error){
    console.log(error)
  }

  function onPublishComplete (){
    const {
      router: { query: { brandId } },
      updateBrandOnboardingStatus,
      toggleModalOpen
    } = props
    /* If we're publishing, all stages of onboarding should be set to 
    "finished" even if somehow they didn't get set as finished before. */
    const values = {
      colors: 'finished',
      logos: 'finished',
      typography: 'finished',
      templates: 'finished'
    }
    updateBrandOnboardingStatus({
      variables: { brandId, values }
    })
    toggleModalOpen({
      variables: { id: publishModalId },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id: publishModalId }
        }
      ]
    })
    toggleModalOpen({
      variables: { id: successModalId },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id: successModalId }
        }
      ]
    })
  }

  const {
    listBrands: {
      listBrands = [],
      loading: listBrandsLoading,
      error: listBrandsError
    },
    draftGuidelinesByBrandId: {
      draftGuidelinesByBrandId,
      loading: draftGuidelinesByBrandIdLoading,
      error: draftGuidelinesByBrandIdError
    },
    router
  } = props

  if (listBrandsLoading || draftGuidelinesByBrandIdLoading) {
    return null
  }

  if (listBrandsError) {
    console.log(listBrandsError)
    return null
  }

  const {
    guidelinesUrlLabel,
    saveButtonText,
    publishButtonText
  } = copy.private.brand.publishModal

  const { brandId } = router.query
  const protocol = window.location.protocol
  const host = window.location.host

  const brand = listBrands.find(brand => {
    return brand.brandId === brandId
  })
  const { domainSlug } = brand ? brand : ''
  const brandGuidelinesUrl = `${protocol}//${host}/brand/guidelines/${domainSlug}/draft`
  const coverArtSlug = !draftGuidelinesByBrandIdError
    ? draftGuidelinesByBrandId ? draftGuidelinesByBrandId.coverArtSlug : ''
    : ''
  return (
    <div className={styles.brandOnboardingPublishFooter}>
      <span className={styles.guidelinesUrl}>
        {guidelinesUrlLabel}
        <Link
          href={`/brand/guidelines/${domainSlug}/${brand.isPublished
            ? 'published'
            : 'draft'}`}
        >
          <a>{brandGuidelinesUrl}</a>
        </Link>
      </span>
      <div className={styles.publishButtons}>
        <Button className='onebrand-button' size='large' disabled>
          {saveButtonText}
        </Button>
        {coverArtSlug !== '' ? (
          <Mutation
            mutation={PUBLISH_GUIDELINE}
            onCompleted={onPublishComplete}
            onError={onPublishError}
          >
            {publishGuideline => (
              <Button
                className='onebrand-button'
                size='large'
                type='primary'
                onClick={() =>
                  publishGuideline({
                    variables: { brandId },
                    refetchQueries: [
                      {
                        query: LIST_BRANDS
                      },
                      {
                        query: GET_PUBLISHED_GUIDELINE_BY_DOMAINSLUG,
                        variables: { domainSlug }
                      },
                      {
                        query: GET_DRAFT_GUIDELINE_BY_DOMAINSLUG,
                        variables: { domainSlug }
                      }
                    ]
                  })}
              >
                {publishButtonText}
              </Button>
            )}
          </Mutation>
        ) : null}
      </div>
    </div>
  )
}

export default compose(
  withRouter,
  graphql(LIST_BRANDS, { name: 'listBrands' }),
  graphql(GET_GUIDELINE_COVER_SLUG, {
    name: 'draftGuidelinesByBrandId',
    options: (props: OnboardingPublishFooterProps) => {
      const { brandId } = props.router.query
      return {
        variables: { brandId }
      }
    }
  }),
  graphql(UPDATE_ONBOARDING_STATUS, { name: 'updateBrandOnboardingStatus' }),
  graphql(TOGGLE_MODAL, { name: 'toggleModalOpen' })
)(OnboardingPublishFooter)
