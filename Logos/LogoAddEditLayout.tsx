import * as React from 'react'
import { Row, Col } from 'antd'
import LogoUploader from './LogoUploader'
import { LogoEditorDisplay, LogoEditorControls } from './LogoEditor'
import styles from './BrandLogo.css'

type LogoAddEditLayoutProps = {
  logoId?: string
}

const LogoAddEditLayout: React.FunctionComponent<
  LogoAddEditLayoutProps
> = props => {
  const { logoId } = props
  const isEditMode = logoId ? true : false
  return (
    <Row type='flex' justify='center' gutter={0}>
      {isEditMode ? (
        <React.Fragment>
          <Col md={17} sm={24}>
            <div className={styles.logoUploadAndDisplay}>
              <LogoEditorDisplay logoId={logoId} />
            </div>
          </Col>
          <Col md={7} sm={24}>
            {isEditMode ? <LogoEditorControls logoId={logoId} /> : null}
          </Col>
        </React.Fragment>
      ) : (
        <Col span={24}>
          <div className={styles.logoUploadAndDisplay}>
            <LogoUploader />
          </div>
        </Col>
      )}
    </Row>
  )
}

export default LogoAddEditLayout
