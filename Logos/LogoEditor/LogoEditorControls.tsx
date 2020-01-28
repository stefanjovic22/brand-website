/// <reference path="../BrandLogo.d.ts" />
/// <reference path="../../../Modal/Modal.d.ts" />
import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Mutation, Query } from 'react-apollo'
import {
  SetLogoSpacingMultiple as SPACING_MULTIPLE,
  ToggleLogoSpacingControls as TOGGLE_CONTROLS,
  ToggleLogoSpacingWidthControls as TOGGLE_WIDTH_CONTROLS,
  ClearEditorValues as CLEAR_EDITOR
} from '../BrandLogo.client.graphql'
import {
  GetModalStatus as GET_MODAL_STATUS,
  ToggleModalOpen as TOGGLE_MODAL
} from '../../../Modal/Modal.client.graphql'
import { GET_GUIDE_RENDER_VALUES, GET_LOGO } from '../BrandLogo.queries'
import { SET_SPACING } from '../BrandLogo.mutations'
import { Row, Col, Icon, Form, Switch, Select, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { InfoPopover } from '../../../InfoPopover'
import LogoEditorSliderSet from './LogoEditorSliderSet'
import styles from './LogoEditor.css'
const copy = require('../../../../lib/copy.json')

const Option = Select.Option

function getLogoClearanceAsPercentage (guides, logoSize, spacingMultiple){
  const { logoWidth, logoHeight } = logoSize
  const { top, bottom, left, right } = guides
  /* What we need here is each guideOffset (coming in as pixels)
  represented as a percentage of the logo's height or width, for
  y and x values, respectively. */
  const topPercentage = top === 0 || top === null ? 0 : top / (logoHeight / 100)
  const bottomPercentage =
    bottom === 0 || bottom === null ? 0 : bottom / (logoHeight / 100)
  const leftPercentage =
    left === 0 || left === null ? 0 : left / (logoWidth / 100)
  const rightPercentage =
    right === 0 || right === null ? 0 : right / (logoWidth / 100)

  const spacing = {
    isEditedByUser: true,
    topPercentage,
    bottomPercentage,
    leftPercentage,
    rightPercentage,
    spacingMultiple
  }
  return spacing
}

async function handleEditorDoneButton (
  logoId,
  brandId,
  spacing,
  replaceLogoSpacingObj,
  clearEditorValues,
  toggleModalOpen
){
  const modalId = 1
  await replaceLogoSpacingObj({
    variables: {
      brandId,
      _id: logoId,
      spacing
    },
    refetchQueries: [
      {
        query: GET_LOGO,
        variables: { _id: logoId, brandId }
      }
    ]
  })
  clearEditorValues()
  toggleModalOpen({
    variables: { id: modalId },
    refetchQueries: [
      {
        query: GET_MODAL_STATUS,
        variables: { id: modalId }
      }
    ]
  })
}

// Eventually we'll probably be getting this from the back end
const spacingMultipleOptions = [ 0.5, 1, 1.5, 2.0 ]

interface LogoEditorControlsProps extends FormComponentProps, WithRouterProps {
  logoId: string
}

const LogoEditorControls: React.FunctionComponent<
  LogoEditorControlsProps
> = props => {
  const { logoId, router } = props
  const { brandId } = router.query
  const {
    controlsToggleLabel,
    controlsToggleTooltip,
    controlsInstructions,
    buttonText
  } = copy.private.brand.logos.editor
  const instructions = controlsInstructions
    .split('\n')
    .map((paragraph, key) => (
      <React.Fragment key={key}>
        {paragraph}
        <br />
      </React.Fragment>
    ))
  return (
    <Query query={GET_GUIDE_RENDER_VALUES}>
      {({ loading, data }) => {
        if (loading) return null
        const {
          logoDisplaySize,
          controlsEnabled,
          widthControlsEnabled,
          spacingMultiple,
          guideOffset
        } = data.editor
        const { logoWidth, logoHeight } = logoDisplaySize
        // Max values for the sliders (Min is always 0)
        const yMax = Math.ceil(logoHeight) + 1 // LineBorderHeight
        const xMax = Math.ceil(logoWidth)

        return (
          <div className={styles.logoEditorControlsContainer}>
            <Form layout='horizontal' className={styles.logoEditorControls}>
              <Row
                className={styles.controlsHeader}
                type='flex'
                justify='space-between'
                align='bottom'
              >
                <Col span={17}>
                  <p className={styles.controlsTitle}>
                    {controlsToggleLabel}
                    <InfoPopover content={controlsToggleTooltip} />
                  </p>
                </Col>
                <Col span={5}>
                  <Form.Item>
                    <Mutation mutation={TOGGLE_CONTROLS}>
                      {toggleLogoSpacingControls => (
                        <Switch
                          checked={controlsEnabled}
                          onChange={() => toggleLogoSpacingControls()}
                        />
                      )}
                    </Mutation>
                  </Form.Item>
                </Col>
              </Row>
              {controlsEnabled ? (
                <React.Fragment>
                  <LogoEditorSliderSet axis='y' min={0} max={yMax} />
                  {widthControlsEnabled ? (
                    <LogoEditorSliderSet axis='x' min={0} max={xMax} />
                  ) : (
                    <Mutation mutation={TOGGLE_WIDTH_CONTROLS}>
                      {toggleLogoSpacingWidthControls => (
                        <div className={styles.enableWidth}>
                          <a
                            role='button'
                            onClick={() => toggleLogoSpacingWidthControls()}
                          >
                            Add logo width
                          </a>
                        </div>
                      )}
                    </Mutation>
                  )}
                  <Row type='flex' justify='center' align='middle'>
                    <Col span={24}>
                      <Form.Item
                        label='Spacing Multiple'
                        className={styles.spacingMultiple}
                      >
                        <Mutation mutation={SPACING_MULTIPLE}>
                          {setLogoSpacingMultiple => (
                            <Select
                              size='large'
                              defaultValue={spacingMultiple}
                              onChange={value =>
                                setLogoSpacingMultiple({
                                  variables: { spacingMultiple: value }
                                })}
                              suffixIcon={<Icon type='caret-down' />}
                            >
                              {spacingMultipleOptions.map(option => {
                                return (
                                  <Option key={option} value={option}>
                                    {option}x
                                  </Option>
                                )
                              })}
                            </Select>
                          )}
                        </Mutation>
                      </Form.Item>
                    </Col>
                  </Row>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div className={styles.logoEditorExampleGraphic}>
                    <img
                      src='/static/logo-clearance-example-logo-graphic.svg'
                      alt='Graphic showing an example logo with guides indicated on all four sides'
                    />
                  </div>
                  <div className={styles.logoEditorControlsExplainerText}>
                    <p>{instructions}</p>
                  </div>
                </React.Fragment>
              )}
              <Row
                type='flex'
                justify='end'
                align='middle'
                className={styles.logoEditorDoneButton}
              >
                <Col>
                  <Form.Item>
                    <Mutation mutation={TOGGLE_MODAL}>
                      {toggleModalOpen => (
                        <Mutation mutation={CLEAR_EDITOR}>
                          {clearEditorValues => (
                            <Mutation mutation={SET_SPACING}>
                              {replaceLogoSpacingObj => (
                                <Button
                                  className='onebrand-button'
                                  type='primary'
                                  onClick={() => {
                                    const spacing = getLogoClearanceAsPercentage(
                                      guideOffset,
                                      logoDisplaySize,
                                      spacingMultiple
                                    )
                                    handleEditorDoneButton(
                                      logoId,
                                      brandId,
                                      spacing,
                                      replaceLogoSpacingObj,
                                      clearEditorValues,
                                      toggleModalOpen
                                    )
                                  }}
                                >
                                  {buttonText}
                                </Button>
                              )}
                            </Mutation>
                          )}
                        </Mutation>
                      )}
                    </Mutation>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        )
      }}
    </Query>
  )
}

export default withRouter(
  Form.create<LogoEditorControlsProps>({
    name: 'LogoEditorControls'
  })(LogoEditorControls)
)
