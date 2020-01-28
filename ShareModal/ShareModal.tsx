import * as React from 'react'
import Router, { withRouter, WithRouterProps } from 'next/router'
import { Modal, message, Button, Icon } from 'antd'
import Confetti from 'react-dom-confetti'
import { find } from 'lodash'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Mutation, Query } from 'react-apollo'
import { LIST_BRANDS } from '../../Brands/Brands.queries'
import {
  ToggleModalOpen as TOGGLE_MODAL,
  GetModalStatus as GET_MODAL_STATUS
} from '../../Modal/Modal.client.graphql'
import { GET_BRAND_STATUS } from '../Publish/OnboardingPublish.queries'
import ReactTimeout, { ReactTimeoutProps } from 'react-timeout'
import EmailIcon from '../../../static/social-icons/Email.svg'
import TwitterIcon from '../../../static/social-icons/Tw.svg'
import FacebookIcon from '../../../static/social-icons/Fb.svg'
import LinkedinIcon from '../../../static/social-icons/LinkedIn.svg'
const copy = require('../../../lib/copy.json')
import styles from './ShareModal.css'
import Classnames from 'classnames/bind'

const cx = Classnames.bind(styles)

interface ShareModalProps extends ReactTimeoutProps, WithRouterProps {
  id: number
}

const initialState = {
  confettiStart: false
}

type ShareModalState = Readonly<typeof initialState>

class ShareModal extends React.Component<ShareModalProps, ShareModalState> {
  readonly state: ShareModalState = initialState
  constructor (props: ShareModalProps) {
    super(props)
    this.handleQueryCompleted = this.handleQueryCompleted.bind(this)
  }

  handleQueryCompleted () {
    this.props.setTimeout(
      () =>
        this.setState(prevState => ({
          ...prevState,
          confettiStart: true
        })),
      10
    )
  }

  handleModalClose (toggleModalOpen) {
    const { id, router: { query: { brandId } } } = this.props
    toggleModalOpen({
      variables: { id },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id }
        },
        {
          query: GET_BRAND_STATUS,
          variables: { brandId }
        }
      ]
    })
    /* If this is the post-publish share modal, we want to send
    the user straight to their /brands page after closing. */
    if (id === 19) {
      Router.push('/brands')
    }
  }

  onCopyHandler = () => {
    message.success('Copied!', 3)
  }

  render () {
    const protocol = window.location.protocol
    const host = window.location.host
    const { confettiStart } = this.state
    const { id, router: { query: { brandId } } } = this.props
    return (
      <Query query={LIST_BRANDS}>
        {({ data, loading }) => {
          if (loading) return null
          const brands = data !== undefined ? data.listBrands : []
          const brand = find(brands, brand => {
            return brand.brandId === brandId
          })

          const brandGuidelinesUrl = `${protocol}//${host}/brand/guidelines/${brand.domainSlug}`

          const iFrameCode = `<iframe src=${brandGuidelinesUrl}></iframe>`

          return (
            <Query
              query={GET_MODAL_STATUS}
              variables={{ id }}
              onCompleted={this.handleQueryCompleted}
            >
              {({ loading, data }) => {
                if (loading) return null
                const { isOpen } = data.getModalStatus
                /* We need a couple variables to let us determine what to load into
          the modal. */
                const isPublishShare = id === 19 ? true : false
                const {
                  title,
                  embedCodeFieldLabel,
                  embedCodeHelpText,
                  guidelinesUrlLabel
                } = isPublishShare
                  ? copy.private.brand.publishSuccessModal
                  : copy.private.brands.shareModal
                const {
                  instructions1,
                  instructions2,
                  instructions3,
                  buttonText
                } = isPublishShare ? copy.private.brand.publishSuccessModal : ''

                const confettiConfig = {
                  angle: 90,
                  spread: 130,
                  startVelocity: 45,
                  elementCount: 50,
                  dragFriction: 0.1,
                  duration: 3000,
                  stagger: 0,
                  width: '10px',
                  height: '10px',
                  colors: [
                    '#a864fd',
                    '#29cdff',
                    '#78ff44',
                    '#ff718d',
                    '#fdff6a'
                  ]
                }

                return (
                  <Mutation mutation={TOGGLE_MODAL}>
                    {toggleModalOpen => (
                      <Modal
                        centered
                        closable={false}
                        footer={null}
                        title={null}
                        visible={isOpen || false}
                        width={640}
                        wrapClassName={styles.shareModalContainer}
                        onCancel={() => this.handleModalClose(toggleModalOpen)}
                      >
                        <div className={styles.shareModalContent}>
                          <h2 className={styles.header}>{title}</h2>
                          {isPublishShare ? (
                            <p className={styles.subhead}>
                              <React.Fragment>
                                {instructions1} <strong>$5</strong>{' '}
                                {instructions2} <strong>$10</strong>{' '}
                                {instructions3}
                              </React.Fragment>
                            </p>
                          ) : null}
                          <div className={styles.socialButtons}>
                            <Icon
                              component={EmailIcon}
                              className={styles.socialButton}
                            />
                            <Icon
                              component={TwitterIcon}
                              className={styles.socialButton}
                            />
                            <Icon
                              component={FacebookIcon}
                              className={styles.socialButton}
                            />
                            <Icon
                              component={LinkedinIcon}
                              className={styles.socialButton}
                            />
                          </div>
                          {isPublishShare && (
                            <Confetti
                              active={confettiStart}
                              config={confettiConfig}
                            />
                          )}
                          <div className={styles.embedCodeContainer}>
                            <div className={styles.embedCodeLabelAndHelp}>
                              <span className={styles.embedCodeLabel}>
                                {embedCodeFieldLabel}
                              </span>
                              <a href='#' role='button'>
                                {embedCodeHelpText}
                              </a>
                            </div>
                            <div className={styles.embedCode}>
                              <span className={styles.iFrameLink}>
                                {iFrameCode}
                              </span>
                              <CopyToClipboard
                                text={iFrameCode}
                                onCopy={this.onCopyHandler}
                              >
                                <img
                                  className={styles.copyIcon}
                                  src='/static/copy-icon-black.svg'
                                  alt='color Copy Icon'
                                />
                              </CopyToClipboard>
                            </div>
                          </div>
                          <div className={styles.brandGuidelinesUrl}>
                            <p>{guidelinesUrlLabel}</p>
                            <p>
                              <a href={brandGuidelinesUrl} className='purple'>
                                {brandGuidelinesUrl}
                              </a>
                            </p>
                          </div>
                          <Button
                            className='onebrand-button'
                            size='large'
                            type='primary'
                            onClick={() =>
                              this.handleModalClose(toggleModalOpen)}
                          >
                            {buttonText}
                          </Button>
                        </div>
                      </Modal>
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
}

export default withRouter(ReactTimeout(ShareModal))
