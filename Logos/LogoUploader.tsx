import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Mutation } from 'react-apollo'
import { ENCODE_LOGO } from './BrandLogo.mutations'
import { GET_LOGOS } from './BrandLogo.queries'
import {
  UpdateModalContents as UPDATE_MODAL_CONTENTS,
  GetModalStatus as GET_MODAL_STATUS
} from '../../Modal/Modal.client.graphql'
const { Upload, Icon, Spin, Alert, Button } = require('antd')
import Uppy from '@uppy/core'
import styles from './BrandLogo.css'
import Classnames from 'classnames/bind'
const copy = require('../../../lib/copy.json')

const cx = Classnames.bind(styles)

const Dragger = Upload.Dragger

const uppyParams = {
  id: 'brandLogoUploader',
  autoProceed: false,
  allowMultipleUploads: false,
  restrictions: {
    maxFileSize: null,
    maxNumberOfFiles: 1,
    minNumberOfFiles: 1,
    allowedFileTypes: [ '.ai', '.eps', '.pdf', '.svg', '.png' ]
  }
}

const uppy = Uppy(uppyParams)

// We probably won't need this except for testing.
uppy.on('upload', data => console.log("Here's the data!", data))

const initialState = {
  isUploading: false,
  isError: false
}

type LogoUploaderState = Readonly<typeof initialState>

/* Must be a class component so we can use componentWillUnmount to
close Uppy */
class LogoUploader extends React.Component<WithRouterProps, LogoUploaderState> {
  constructor (props) {
    super(props)
    this.handleLogoEncodeCompleted = this.handleLogoEncodeCompleted.bind(this)
    this.handleLogoEncodeError = this.handleLogoEncodeError.bind(this)
  }
  readonly state: LogoUploaderState = initialState

  componentWillUnmount () {
    uppy.close()
  }

  uppyRequest (file, brandId, encodeLogo) {
    this.setState(prevState => ({
      ...prevState,
      isUploading: true
    }))
    /* The uploader doesn't explicitly give us the extension of
    the uploaded file, so we'll read it from the file.name. */
    const fileExt = file.name.split('.').pop()
    const reader = new FileReader()
    reader.onload = () => {
      const imageFile = reader.result
      encodeLogo({ variables: { imageFile, brandId, fileExt } })
    }
    reader.readAsDataURL(file)
  }

  handleLogoEncodeCompleted (data, updateModalContents, brandId) {
    this.setState(prevState => ({
      ...prevState,
      isUploading: false
    }))
    const id = 1
    const itemId = data.encodeLogo._id
    updateModalContents({
      variables: { id, itemId },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id }
        },
        {
          query: GET_LOGOS,
          variables: { brandId }
        }
      ]
    })
  }

  handleLogoEncodeError (graphQLErrors, networkError) {
    console.error(graphQLErrors, networkError)
    this.setState(prevState => ({
      ...prevState,
      isError: true,
      isUploading: false
    }))
  }

  updateCacheAfterSuccessfulUpload (cache, logo) {
    const { brandId } = this.props.router.query
    const query = GET_LOGOS
    const cacheData = cache.readQuery({ query, variables: { brandId } })
    const logos = cacheData.logosByBrandId
    const updatedLogos = logos.concat(logo)
    const data = {
      ...cacheData,
      logosByBrandId: updatedLogos
    }
    cache.writeQuery({ query, data })
  }

  render () {
    const { brandId } = this.props.router.query
    const { isUploading, isError } = this.state
    const { uploaderInstructions } = copy.private.brand.logos.editor

    const draggerProps = {
      name: 'logo',
      multiple: false,
      accept: '.ai,.eps,.pdf,.svg,.png',
      showUploadList: false,
      disabled: isUploading || isError
    }

    const logoUploaderCardClassNames = cx(
      'logoUploaderCardOutline',
      (isUploading || isError) && 'active'
    )

    return (
      <Mutation mutation={UPDATE_MODAL_CONTENTS}>
        {updateModalContents => (
          <Mutation
            mutation={ENCODE_LOGO}
            onCompleted={data =>
              this.handleLogoEncodeCompleted(
                data,
                updateModalContents,
                brandId
              )}
            onError={({ graphQLErrors, networkError }) =>
              this.handleLogoEncodeError(graphQLErrors, networkError)}
            update={(cache, { data: { encodeLogo } }) =>
              this.updateCacheAfterSuccessfulUpload(cache, encodeLogo)}
            refetchQueries={[
              {
                query: GET_LOGOS,
                variables: { brandId }
              }
            ]}
          >
            {encodeLogo => (
              <Dragger
                className={styles.logoUploaderContainer}
                customRequest={({ file }) => {
                  this.uppyRequest(file, brandId, encodeLogo)
                }}
                {...draggerProps}
              >
                <div className={logoUploaderCardClassNames}>
                  {!isUploading && !isError ? (
                    <React.Fragment>
                      <div className={styles.logoUploaderContent}>
                        <Icon
                          type='cloud-upload'
                          style={{ fontSize: '64px' }}
                        />
                        <div className={styles.logoUploaderCardTitle}>
                          Vector
                        </div>
                        <div className={styles.logoUploaderCardDescription}>
                          {uploaderInstructions}
                        </div>
                      </div>
                      <div className={styles.logoUploaderTypeDescription}>
                        SVG, AI, EPS, PDF
                      </div>
                    </React.Fragment>
                  ) : isUploading ? (
                    <Spin size='large' />
                  ) : (
                    isError && (
                      <div className={styles.uploadError}>
                        <Alert
                          message='Upload Failed'
                          description='Please try again in a moment'
                          type='error'
                        />
                        <Button
                          className='onebrand-button'
                          type='primary'
                          onClick={() =>
                            this.setState(prevState => ({
                              ...prevState,
                              isError: false
                            }))}
                        >
                          Try again
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </Dragger>
            )}
          </Mutation>
        )}
      </Mutation>
    )
  }
}

export default withRouter<WithRouterProps>(LogoUploader)
