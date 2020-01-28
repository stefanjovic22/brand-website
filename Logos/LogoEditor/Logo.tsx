import * as React from 'react'
import styles from './LogoEditor.css'

/* The logo has to be in its own component like this so
we can size that component with the react-sizeme HOC. */

type LogoProps = {
  url: string
}

const Logo: React.FunctionComponent<LogoProps> = props => {
  const { url } = props
  return <img src={url} className={styles.logo} alt='Company logo' />
}

export default Logo
