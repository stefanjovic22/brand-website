/// <reference path="../../../Modal/Modal.d.ts" />
import * as React from 'react'
import { Button } from 'antd'
import { Query, Mutation } from 'react-apollo'
import { ChromePicker } from 'react-color'
import { GET_COLORS } from '../BrandColor.queries'
import {
  GetModalStatus as GET_MODAL_STATUS,
  ToggleModalOpen as TOGGLE_MODAL
} from '../../../Modal/Modal.client.graphql'
import { PickerColor, ColorObject } from '../../Brand.types'
import styles from './ColorPicker.css'
import { withRouter, WithRouterProps } from 'next/router'
import { ADD_COLOR } from '../BrandColor.mutations'
const copy = require('../../../../lib/copy.json')

const colorPickerModalId = 0

// Our initialState needs to have something to populate
// the color picker, both for display and in case the
// user clicks "OK" without making a selection
const defaultColor = {
  hex: '#504288',
  hsl: {
    a: 1,
    h: 252.00000000000003,
    l: 0.39607843137254906,
    s: 0.34653465346534645
  },
  hsv: {
    a: 1,
    h: 252.00000000000003,
    s: 0.5147058823529411,
    v: 0.5333333333333333
  },
  oldHue: 252.00000000000003,
  rgb: {
    a: 1,
    b: 136,
    g: 66,
    r: 80
  },
  source: 'hex',
  selectedColorMode: 'hex'
}

interface ColorPickerProps extends WithRouterProps {
  colorId?: string
}

type ColorPickerState = {
  selectedColor?: PickerColor
}

class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState> {
  readonly state: ColorPickerState = {
    selectedColor: null
  }

  constructor (props) {
    super(props)
    this.handleColorChangeComplete = this.handleColorChangeComplete.bind(this)
    this.handleColorSelectionComplete = this.handleColorSelectionComplete.bind(
      this
    )
  }

  handleColorChangeComplete (color) {
    this.setState(prevState => ({
      ...prevState,
      selectedColor: color
    }))
  }

  handleColorSelectionComplete (addColor, toggleModalOpen) {
    const color = this.state.selectedColor
    const { brandId } = this.props.router.query
    console.log('ColorPicker - addColor - color -> ', color)
    addColor({
      variables: {
        brandId: brandId,
        hex: !color ? defaultColor.hex : color.hex
      },
      refetchQueries: [
        {
          query: GET_COLORS,
          variables: { brandId }
        }
      ]
    })
    toggleModalOpen({
      variables: { id: colorPickerModalId },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id: colorPickerModalId }
        }
      ]
    })
  }

  render () {
    const { colorId, router } = this.props
    const { selectedColor } = this.state
    const {
      confirmButtonText,
      cancelButtonText
    } = copy.private.brand.colors.editor
    return (
      <Query query={GET_COLORS} variables={{ brandId: router.query.brandId }}>
        {({ data }) => {
          const colors =
            data !== undefined &&
            (Object.entries(data).length === 0 && data.constructor === Object)
              ? data.colorsByBrandId
              : []
          /* If an index is passed in, we're editing an existing color.
            We'll get the values for that color and load them into the
            picker. */
          const colorToEdit = colors.filter(
            (color: ColorObject) => color._id === colorId
          )
          /* If there's a selectedColor in state, a user has been
            interacting with the color picker, and we should display
            their selection. If not, we look for an existing colorToEdit.
            If neither exists, we'll load the defaultColor so the picker
            has something to display. */
          const displayColor = selectedColor
            ? selectedColor
            : colorToEdit === [] ? colorToEdit[0].hex : defaultColor
          return (
            <Mutation mutation={TOGGLE_MODAL}>
              {toggleModalOpen => (
                <React.Fragment>
                  <ChromePicker
                    disableAlpha
                    color={displayColor}
                    onChangeComplete={this.handleColorChangeComplete}
                  />
                  <div className={styles.colorPickerButtons}>
                    <Mutation mutation={ADD_COLOR}>
                      {addColor => (
                        <Button
                          className='onebrand-button'
                          type='primary'
                          onClick={() =>
                            this.handleColorSelectionComplete(
                              addColor,
                              toggleModalOpen
                            )}
                        >
                          {confirmButtonText}
                        </Button>
                      )}
                    </Mutation>
                    <Button
                      className='onebrand-button'
                      onClick={() =>
                        toggleModalOpen({
                          variables: { id: colorPickerModalId },
                          refetchQueries: [
                            {
                              query: GET_MODAL_STATUS,
                              variables: { id: colorPickerModalId }
                            }
                          ]
                        })}
                    >
                      {cancelButtonText}
                    </Button>
                  </div>
                </React.Fragment>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default withRouter(ColorPicker)
