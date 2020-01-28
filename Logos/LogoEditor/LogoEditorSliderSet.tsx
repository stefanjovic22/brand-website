import * as React from 'react'
import { Row, Col } from 'antd'
import { getSides } from './LogoEditor.helpers'
import styles from './LogoEditor.css'
import LogoEditorSlider from './LogoEditorSlider'
import LogoEditorAxisLink from './LogoEditorAxisLink'
import { Query, Mutation } from 'react-apollo'
import { GET_AXIS_LINK_STATUS } from '../BrandLogo.queries'
import { ToggleLogoSpacingWidthControls as TOGGLE_WIDTH_CONTROLS } from '../BrandLogo.client.graphql'

type LogoEditorSliderSetProps = {
  axis: string
  min: number
  max: number
}

const LogoEditorSliderSet: React.FunctionComponent<
  LogoEditorSliderSetProps
> = props => {
  const { axis, min, max } = props
  const [ side1, side2 ] = getSides(axis)
  return (
    <React.Fragment>
      <Row type='flex' justify='space-between' align='middle'>
        <Col
          span={12}
          className={styles.logoEditorSliderSetLabel}
        >{`Logo ${axis === 'y' ? 'height' : 'width' || ''}`}</Col>
        <Col span={12} className={styles.disableWidth}>
          {axis === 'x' ? (
            <Mutation mutation={TOGGLE_WIDTH_CONTROLS}>
              {toggleLogoSpacingWidthControls => (
                <a
                  role='button'
                  onClick={() => toggleLogoSpacingWidthControls()}
                >
                  Remove
                </a>
              )}
            </Mutation>
          ) : null}
        </Col>
      </Row>
      <Row type='flex' justify='center' align='middle'>
        <Col span={24}>
          <LogoEditorSlider side={side1} min={min || 0} max={max || 100} />
        </Col>
      </Row>
      <Row type='flex' justify='center' align='middle'>
        <Col span={5} offset={19}>
          <Row type='flex' justify='center' align='middle'>
            <Col span={24}>
              <Query query={GET_AXIS_LINK_STATUS}>
                {({ data: { editor: { axisLinked } } }) => {
                  const isLinked = axisLinked[axis]
                  return <LogoEditorAxisLink linked={isLinked} axis={axis} />
                }}
              </Query>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row type='flex' justify='center' align='middle'>
        <Col span={24}>
          <LogoEditorSlider side={side2} min={min || 0} max={max || 100} />
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default LogoEditorSliderSet
