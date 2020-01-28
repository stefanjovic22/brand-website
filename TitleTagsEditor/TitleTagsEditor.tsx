/// <reference path="../Brand.d.ts" />
/// <reference path="../../Modal/Modal.d.ts" />
import React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Query, Mutation } from 'react-apollo'
import {
  GetModalStatus as GET_MODAL_STATUS,
  ToggleModalOpen as TOGGLE_MODAL
} from '../../Modal/Modal.client.graphql'
import { GET_TITLE_TAGS } from './TitleTags.queries'
import { REPLACE_TITLE_TAGS } from './TitleTags.mutations'
import { GET_COLORS } from '../Colors/BrandColor.queries'
import { GET_LOGOS } from '../Logos/BrandLogo.queries'
import { GET_TYPOGRAPHY } from '../Typography/BrandTypography.queries'
import { Form, Input, Button, Select, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { InfoPopover } from '../../InfoPopover'
import { BrandItemType } from '../Brand.types'
import styles from './TitleTags.css'
const copy = require('../../../lib/copy.json')

const standardTags = {
  colors: [
    'Brand',
    'Primary',
    'Secondary',
    'Light',
    'Dark',
    'Body',
    'Heading'
  ],
  logos: [
    'Logotype',
    'Wordmark',
    'Logomark',
    'Logo Icon',
    'Brandmark',
    'Brand Signature',
    'Monogram',
    'Lockup'
  ],
  fonts: [
    'Wordmark',
    'Logotype',
    'Primary',
    'Secondary',
    'Web',
    'Serif',
    'Sans Serif',
    'Custom'
  ]
}

const initialState = {
  itemTitle: null,
  itemTags: null
}

type TitleTagsEditorState = Readonly<typeof initialState>

interface TitleTagsEditorProps extends WithRouterProps, FormComponentProps {
  itemType: BrandItemType
  itemId: number
  modalId: number
}

class TitleTagsEditor extends React.Component<
  TitleTagsEditorProps,
  TitleTagsEditorState
> {
  readonly state: TitleTagsEditorState = initialState
  constructor (props) {
    super(props)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleStandardTagSelect = this.handleStandardTagSelect.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSuccessfulUpdate = this.handleSuccessfulUpdate.bind(this)
    this.handleUpdateError = this.handleUpdateError.bind(this)
  }

  handleInputChange (event) {
    const key = event.target.id
    const { value } = event.target
    this.setState(prevState => ({
      ...prevState,
      [key]: value
    }))
  }

  handleSelectChange (value) {
    this.setState(prevState => ({
      ...prevState,
      itemTags: value
    }))
  }

  handleStandardTagSelect (value, tags) {
    /* If there are no tags in state, we can't just write `value`
    to state, as we might be overwriting existing tags pulled in
    from the item. */
    const itemTags = this.state.itemTags
      ? this.state.itemTags
      : tags ? tags : []
    itemTags.push(value)
    this.setState(prevState => ({
      ...prevState,
      itemTags
    }))
  }

  handleSubmit (event, replaceTitleTags, existingData) {
    event.preventDefault()
    const { itemId, router } = this.props
    const { brandId } = router.query
    const { itemTitle, itemTags } = this.state
    const { title, tags } = existingData
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        replaceTitleTags({
          variables: {
            brandId,
            _id: itemId,
            title: itemTitle !== null ? itemTitle : title,
            tags: itemTags !== null ? itemTags : tags
          }
        })
      }
    })
  }

  handleSuccessfulUpdate (toggleModalOpen) {
    const { itemType, modalId, itemId, router } = this.props
    const { brandId } = router.query
    toggleModalOpen({
      variables: { id: modalId },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id: modalId }
        },
        {
          query: GET_TITLE_TAGS,
          variables: { brandId, id: itemId }
        },
        {
          query:
            itemType === 'color'
              ? GET_COLORS
              : itemType === 'logo' ? GET_LOGOS : GET_TYPOGRAPHY,
          variables: { brandId }
        }
      ]
    })
  }

  handleUpdateError (error) {
    message.error(
      <React.Fragment>
        We couldn't update this item. Please try again later or contact our{' '}
        <a href='https://help.1brand.co' className='purple'>
          support team
        </a>.
      </React.Fragment>,
      4
    )
  }

  render () {
    const { itemType, itemId, router } = this.props
    const { brandId } = router.query
    const { itemTags } = this.state
    const {
      itemTitleFieldLabel,
      titleTooltip,
      tagsInstructions1,
      tagsInstructions2,
      itemTagsFieldLabel,
      tagsListLabel1,
      tagsListLabel2,
      buttonText
    } = copy.private.brand.titleTagsEditor
    const availableStandardTags = standardTags[`${itemType}s`]
    const { getFieldDecorator } = this.props.form
    return (
      <Query query={GET_TITLE_TAGS} variables={{ brandId, _id: itemId }}>
        {({ loading, data }) => {
          if (loading) return null
          const getTitleTags =
            data !== undefined ? data.getTitleTags : { title: '', tags: [] }
          /* If there are tags in state, the user has been editing, so
          we should use what's in state to display both the available
          standard tags and the tags already selected. If state is empty,
          we'll base these values on the existing item tags (if any). */
          const currentTags =
            itemTags !== null
              ? itemTags
              : getTitleTags.tags !== null ? getTitleTags.tags : []
          const filteredStandardTags = availableStandardTags.filter(
            item => !currentTags.includes(item)
          )
          return (
            <Mutation mutation={TOGGLE_MODAL}>
              {toggleModalOpen => (
                <Mutation
                  mutation={REPLACE_TITLE_TAGS}
                  onCompleted={() =>
                    this.handleSuccessfulUpdate(toggleModalOpen)}
                  onError={error => this.handleUpdateError(error)}
                >
                  {replaceTitleTags => (
                    <Form
                      className={styles.titleTagsEditor}
                      onSubmit={event =>
                        this.handleSubmit(
                          event,
                          replaceTitleTags,
                          getTitleTags
                        )}
                    >
                      <Form.Item
                        label={
                          <label className={styles.itemTitle}>
                            {`${itemType} ${itemTitleFieldLabel}`}
                            <InfoPopover content={titleTooltip} />
                          </label>
                        }
                      >
                        {getFieldDecorator('itemTitle', {
                          validateTrigger: 'onBlur',
                          rules: [
                            {
                              required: false,
                              message: 'Must be longer than 3 characters',
                              whitespace: true
                            }
                          ]
                        })(
                          <Input
                            placeholder={getTitleTags.title}
                            onChange={event => this.handleInputChange(event)}
                          />
                        )}
                      </Form.Item>
                      <p className={styles.customTagsDescription}>
                        {`${tagsInstructions1} ${itemType}s ${tagsInstructions2}`}
                      </p>
                      <Form.Item label={itemTagsFieldLabel}>
                        <Select
                          mode='tags'
                          placeholder='Add tags'
                          value={currentTags}
                          onChange={value => this.handleSelectChange(value)}
                          className={styles.customTagsSelect}
                          dropdownStyle={{ display: 'none' }}
                        />
                      </Form.Item>
                      <div className={styles.standardTagsDescription}>
                        {`${tagsListLabel1} ${itemType} ${tagsListLabel2}`}
                      </div>
                      <div className={styles.standardTagsItems}>
                        {filteredStandardTags.map(item => (
                          <div
                            className={styles.standardTagsItem}
                            onClick={event =>
                              this.handleStandardTagSelect(
                                (event.target as HTMLElement).textContent,
                                getTitleTags.tags
                              )}
                            key={item}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                      <Form.Item>
                        <Button
                          className='onebrand-button'
                          size='large'
                          type='primary'
                          htmlType='submit'
                        >
                          {buttonText}
                        </Button>
                      </Form.Item>
                    </Form>
                  )}
                </Mutation>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default withRouter(
  Form.create<TitleTagsEditorProps>({})(TitleTagsEditor)
)
