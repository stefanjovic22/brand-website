import * as React from 'react'
const sizeMe = require('react-sizeme')
import styles from './LogoEditor.css'

type LogoContainerProps = {
  children?: React.ReactNode
}

const LogoContainer: React.FunctionComponent<LogoContainerProps> = props => {
  // This component doesn't do much exist let itself be
  // sized by react-sizeme so we know where to put the guides.
  return <div className={styles.logoSpacingContainer}>{props.children}</div>
}

export default sizeMe({
  monitorWidth: true,
  monitorHeight: true,
  refreshMode: 'debounce',
  refreshRate: 192
})(LogoContainer)
