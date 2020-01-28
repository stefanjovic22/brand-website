import * as React from 'react'
import { Mutation, Query } from 'react-apollo'
import { GET_GUIDE_OFFSET } from '../BrandLogo.queries'
import { SetLogoGuideOffset as SET_GUIDE } from '../BrandLogo.client.graphql'
import { Form, Slider, InputNumber, Row, Col } from 'antd'

type LogoEditorSliderProps = {
  side: string
  min: number
  max: number
}

const LogoEditorSlider: React.FunctionComponent<
  LogoEditorSliderProps
> = props => {
  const { side, min, max } = props
  const axis = side === 'top' || side === 'bottom' ? 'Y' : 'X'
  return (
    <Query query={GET_GUIDE_OFFSET}>
      {({ data: { editor: { guideOffset } } }) => {
        const inputValue = guideOffset[side] ? guideOffset[side] : 0
        return (
          <Mutation mutation={SET_GUIDE}>
            {setLogoGuideOffset => (
              <Form.Item label={side}>
                <Row type='flex' justify='space-between' align='middle'>
                  <Col span={19}>
                    <Slider
                      min={min}
                      max={max}
                      onChange={value =>
                        setLogoGuideOffset({
                          variables: {
                            side,
                            offset: value
                          }
                        })}
                      value={inputValue}
                    />
                  </Col>
                  <Col span={5}>
                    <InputNumber
                      size='large'
                      min={min}
                      max={max}
                      formatter={_ => `${inputValue}  ${axis}`}
                      onChange={value =>
                        setLogoGuideOffset({
                          variables: {
                            side,
                            offset: value
                          }
                        })}
                    />
                  </Col>
                </Row>
              </Form.Item>
            )}
          </Mutation>
        )
      }}
    </Query>
  )
}

export default LogoEditorSlider
