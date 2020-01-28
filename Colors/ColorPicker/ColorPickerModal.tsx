import * as React from 'react'
import { Mutation, Query } from 'react-apollo'
import { Modal } from 'antd'
import {
  ToggleModalOpen as TOGGLE_MODAL,
  GetModalStatus as GET_MODAL_STATUS
} from '../../../Modal/Modal.client.graphql'
import ColorPicker from './ColorPicker'
import styles from './ColorPicker.css'

const colorPickerModalId = 0

const ColorPickerModal: React.FunctionComponent = () => {
  return (
    <Query query={GET_MODAL_STATUS} variables={{ id: colorPickerModalId }}>
      {({ loading, data }) => {
        if (loading) return null
        const { isOpen, itemId } = data.getModalStatus
        return (
          <Mutation mutation={TOGGLE_MODAL}>
            {toggleModalOpen => (
              <Modal
                className={styles.brandColorPickerModal}
                visible={isOpen}
                width={'225px'}
                closable={false}
                onCancel={() => {
                  toggleModalOpen({
                    variables: { id: colorPickerModalId },
                    refetchQueries: [
                      {
                        query: GET_MODAL_STATUS,
                        variables: { id: colorPickerModalId }
                      }
                    ]
                  })
                }}
                footer={null}
              >
                <ColorPicker colorId={itemId} />
              </Modal>
            )}
          </Mutation>
        )
      }}
    </Query>
  )
}

export default ColorPickerModal
