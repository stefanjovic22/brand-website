import * as React from 'react'
import { Query, Mutation } from 'react-apollo'
import { Modal, Icon } from 'antd'
import {
  GetModalStatus as GET_MODAL_STATUS,
  ToggleModalOpen as TOGGLE_MODAL
} from '../../Modal/Modal.client.graphql'
import { BrandItemType } from '../Brand.types'
import TitleTagsEditor from './TitleTagsEditor'
import styles from './TitleTags.css'
const copy = require('../../../lib/copy.json')

interface TitleTagsModalProps {
  itemType: BrandItemType
}

const TitleTagsModal: React.FunctionComponent<TitleTagsModalProps> = props => {
  const { itemType } = props
  const { title } = copy.private.brand.titleTagsEditor
  /* 4 is the title/tags modal for colors, 5 for logos, 6 for fonts */
  const modalId = itemType === 'color' ? 4 : itemType === 'logo' ? 5 : 6
  return (
    <Query query={GET_MODAL_STATUS} variables={{ id: modalId }}>
      {({ loading, data }) => {
        if (loading) return null
        const { isOpen, itemId } = data.getModalStatus
        return (
          <Mutation mutation={TOGGLE_MODAL}>
            {toggleModalOpen => (
              <Modal
                centered
                title={
                  <div className={styles.titleTagsModalHeader}>
                    <div className={styles.headerTitle}>{title}</div>
                    <Icon
                      type='close'
                      className={styles.headerCloseIcon}
                      onClick={() =>
                        toggleModalOpen({
                          variables: { id: modalId },
                          refetchQueries: [
                            {
                              query: GET_MODAL_STATUS,
                              variables: { id: modalId }
                            }
                          ]
                        })}
                    />
                  </div>
                }
                closable={false}
                visible={isOpen}
                wrapClassName={styles.titleTagsModal}
                footer={null}
                onCancel={() => {
                  toggleModalOpen({
                    variables: { id: modalId },
                    refetchQueries: [
                      {
                        query: GET_MODAL_STATUS,
                        variables: { id: modalId }
                      }
                    ]
                  })
                }}
              >
                {itemId !== null && (
                  <TitleTagsEditor
                    itemType={itemType}
                    itemId={itemId}
                    modalId={modalId}
                  />
                )}
              </Modal>
            )}
          </Mutation>
        )
      }}
    </Query>
  )
}

export default TitleTagsModal
