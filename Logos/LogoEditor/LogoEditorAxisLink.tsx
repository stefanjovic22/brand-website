import * as React from 'react'
import { Mutation } from 'react-apollo'
import { ToggleLogoSpacingAxisLink as TOGGLE_LINK } from '../BrandLogo.client.graphql'
import { Button } from 'antd'
import styles from './LogoEditor.css'

type LogoEditorAxisLinkProps = {
  linked: boolean
  axis: string
}

const LogoEditorAxisLink: React.FunctionComponent<
  LogoEditorAxisLinkProps
> = props => {
  const { axis, linked } = props
  let linkTitle: string
  let path: string
  if (linked) {
    linkTitle = 'Linked'
    path =
      'M3.9,12 C3.9,10.29 5.29,8.9 7,8.9 L11,8.9 L11,7 L7,7 C4.24,7 2,9.24 2,12 C2,14.76 4.24,17 7,17 L11,17 L11,15.1 L7,15.1 C5.29,15.1 3.9,13.71 3.9,12 Z M8,13 L16,13 L16,11 L8,11 L8,13 Z M17,7 L13,7 L13,8.9 L17,8.9 C18.71,8.9 20.1,10.29 20.1,12 C20.1,13.71 18.71,15.1 17,15.1 L13,15.1 L13,17 L17,17 C19.76,17 22,14.76 22,12 C22,9.24 19.76,7 17,7 Z'
  } else {
    linkTitle = 'Unlinked'
    path =
      'M17,7 L13,7 L13,8.9 L17,8.9 C18.71,8.9 20.1,10.29 20.1,12 C20.1,13.43 19.12,14.63 17.79,14.98 L19.25,16.44 C20.88,15.61 22,13.95 22,12 C22,9.24 19.76,7 17,7 Z M16,11 L13.81,11 L15.81,13 L16,13 L16,11 Z M2,4.27 L5.11,7.38 C3.29,8.12 2,9.91 2,12 C2,14.76 4.24,17 7,17 L11,17 L11,15.1 L7,15.1 C5.29,15.1 3.9,13.71 3.9,12 C3.9,10.41 5.11,9.1 6.66,8.93 L8.73,11 L8,11 L8,13 L10.73,13 L13,15.27 L13,17 L14.73,17 L18.74,21 L20,19.74 L3.27,3 L2,4.27 Z'
  }

  return (
    <Mutation mutation={TOGGLE_LINK}>
      {toggleLogoSpacingAxisLink => (
        <Button
          className={styles.axisLinkButton}
          onClick={() => {
            toggleLogoSpacingAxisLink({ variables: { axis } })
          }}
        >
          <svg width='24px' height='24px' viewBox='0 0 24 24' version='1.1'>
            <title>{linkTitle}</title>
            <g
              id={linkTitle}
              stroke='none'
              strokeWidth='1'
              fill='none'
              fillRule='evenodd'
            >
              <g>
                <polygon id='Path' points='0 0 24 0 24 24 0 24' />
                <path d={path} id='Shape' fill='#29282D' fillRule='nonzero' />
              </g>
            </g>
          </svg>
        </Button>
      )}
    </Mutation>
  )
}

export default LogoEditorAxisLink
