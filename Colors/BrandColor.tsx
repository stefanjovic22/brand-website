/// <reference path="./BrandColor.d.ts" />
/// <reference path="../../Modal/Modal.d.ts" />
import * as React from 'react'
import { compose, graphql } from 'react-apollo'
import { GET_COLORS } from './BrandColor.queries'
import { GetColorsChildProps } from '../Brand.types'
import { BrandLayout } from '../BrandLayout'
import { ColorPicker } from '../Colors/ColorPicker'
import { AlertInfoModal } from '../../Modal'
import {
  GetModalStatus as GET_MODAL_STATUS,
  OpenModal as OPEN_MODAL
} from '../../Modal/Modal.client.graphql'
import AllModals from '../../Modal/Modal.defaults'
import { OpenModal } from '../../Modal/Modal.types'
import { TitleTagsEditor } from '../TitleTagsEditor'
import { WithRouterProps, withRouter } from 'next/router'
const copy = require('../../../lib/copy.json')

const { modals } = AllModals
const modalId = modals.find(modal => modal.name === 'AlertModalOnboardingStart')
  .id

type BrandColorProps = WithRouterProps & GetColorsChildProps & OpenModal

const BrandColor: React.FC<BrandColorProps> = props => {
  const {
    colorsByBrandId: {
      colorsByBrandId: colors = [],
      loading: colorsByBrandIdLoading,
      error: colorsByBrandIdError
    },
    openModal
  } = props

  React.useEffect(() => {
    const modalShownValue = localStorage.getItem(
      'brandOnboardingFirstLaunchInfoShown'
    )
    /* We want to mostly default to NOT showing this modal, so as not to
      annoy the user. */
    const modalWasShown =
      modalShownValue === null || modalShownValue === 'false'
        ? false
        : modalShownValue === 'true' ? true : false
    if (!modalWasShown) {
      openModal({
        variables: { id: modalId },
        refetchQueries: [
          {
            query: GET_MODAL_STATUS,
            variables: { id: modalId }
          }
        ]
      })
    }
  })

  const {
    title,
    instructions,
    buttonText
  } = copy.private.brand.infoModalTitleAndTags
  if (colorsByBrandIdLoading) return null
  if (colorsByBrandIdError) {
    console.log(colorsByBrandIdError)
    return null
  }
  return (
    <BrandLayout brandItems={colors}>
      <ColorPicker />
      <TitleTagsEditor itemType='color' />
      <AlertInfoModal
        alertOrInfo='alert'
        modalId={modalId}
        title={title}
        body={instructions}
        buttonText={buttonText}
      />
    </BrandLayout>
  )
}
export default compose(
  withRouter,
  graphql(GET_COLORS, {
    name: 'colorsByBrandId',
    options: (props: BrandColorProps) => {
      const { brandId } = props.router.query
      return { variables: { brandId } }
    }
  }),
  graphql(OPEN_MODAL, { name: 'openModal' })
)(BrandColor)
