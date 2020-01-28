import * as React from 'react'
import { Modal } from 'antd'
import { Mutation, Query } from 'react-apollo'
import {
  ToggleModalOpen as TOGGLE_MODAL,
  GetModalStatus as GET_MODAL_STATUS
} from '../../Modal/Modal.client.graphql'
import { ClearEditorValues as CLEAR_EDITOR } from '../Logos/BrandLogo.client.graphql'
import { LogoAddEditLayout } from '../Logos'
import FontSelector from '../Typography/FontSelector'
import OnboardingPublishBody from '../Publish/OnboardingPublishBody'
import styles from './AddEditModal.css'
const copy = require('../../../lib/copy.json')

type AddEditModalProps = {
  modalId: number
  modalWidth?: string
  footer?: React.ReactNode
}

function handleModalCancel (id, clearEditorValues, toggleModalOpen){
  toggleModalOpen({
    variables: { id },
    refetchQueries: [
      {
        query: GET_MODAL_STATUS,
        variables: { id }
      }
    ]
  })
  // id 1 is the Logo Editor
  if (id === 1) {
    clearEditorValues()
  }
}

const AddEditModal: React.FunctionComponent<AddEditModalProps> = props => {
  const { modalId, modalWidth, footer } = props
  return (
    <Query query={GET_MODAL_STATUS} variables={{ id: modalId }}>
      {({ loading, data }) => {
        if (loading) return null
        const { isOpen, itemId } = data.getModalStatus
        /* We need a couple variables to let us determine what to load into
      the modal. */
        const isLogos = modalId === 1 ? true : false
        const isFonts = modalId === 2 ? true : false
        const isPublish = modalId === 3 ? true : false
        const { title } = isLogos
          ? copy.private.brand.logos.editor
          : isFonts
            ? copy.private.brand.fonts.editor
            : isPublish ? copy.private.brand.publishModal : 'Edit'
        return (
          <Mutation mutation={CLEAR_EDITOR}>
            {clearEditorValues => (
              <Mutation mutation={TOGGLE_MODAL}>
                {toggleModalOpen => (
                  <Modal
                    wrapClassName={styles.brandAddEditModal}
                    title={title}
                    footer={footer || null}
                    visible={isOpen || false}
                    centered={true}
                    width={modalWidth || '90%'}
                    onCancel={() =>
                      handleModalCancel(
                        modalId,
                        clearEditorValues,
                        toggleModalOpen
                      )}
                  >
                    {isLogos && isOpen ? (
                      <LogoAddEditLayout logoId={itemId} />
                    ) : null}
                    {isFonts && isOpen ? (
                      <FontSelector fontId={itemId} />
                    ) : null}
                    {isPublish && isOpen ? <OnboardingPublishBody /> : null}
                  </Modal>
                )}
              </Mutation>
            )}
          </Mutation>
        )
      }}
    </Query>
  )
}

export default AddEditModal
