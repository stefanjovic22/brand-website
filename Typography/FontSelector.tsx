/// <reference path='../../Modal/Modal.d.ts' />
import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Mutation } from 'react-apollo'
import { ADD_TYPOGRAPHY } from './BrandTypography.mutations'
import { GET_TYPOGRAPHY } from './BrandTypography.queries'
import {
  ToggleModalOpen as TOGGLE_MODAL,
  GetModalStatus as GET_MODAL_STATUS
} from '../../Modal/Modal.client.graphql'
import { Form, Button, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import InfoPopover from '../../InfoPopover/InfoPopover'
import axios from 'axios'
import { jss } from 'react-jss'
import styles from './BrandTypography.css'
const copy = require('../../../lib/copy.json')

const UploadedFontItem = props => {
  const { style, selectedFonts, toggleSelected } = props
  const { fontFamily, fontWeight, fontStyle } = style
  const { fontPreviewText } = copy.private.brand.fonts.editor
  const isSelected =
    selectedFonts.findIndex(selectedFont => {
      return (
        selectedFont.fontFamily === style.fontFamily &&
        selectedFont.fontWeight === style.fontWeight &&
        selectedFont.fontStyle === style.fontStyle
      )
    }) === -1
      ? false
      : true
  return (
    <div className={styles.fontlistItem} style={style}>
      <div className={styles.fontName}>
        {fontFamily} {fontWeight} {fontStyle}
      </div>
      <div className={styles.fontListControl}>
        <div className={styles.fontdescription}>{fontPreviewText}</div>
        <Button
          icon={isSelected ? 'delete' : 'plus'}
          role='checkbox'
          aria-checked={isSelected}
          className={styles.deleteButton}
          onClick={() => {
            const newFont = { fontFamily, fontStyle, fontWeight }
            toggleSelected(newFont)
          }}
        />
      </div>
    </div>
  )
}

const initialState = {
  googleFonts: [],
  searchInput: null,
  inlineStyles: [],
  stylesheets: [],
  selectedFonts: []
}

type FontSelectorState = Readonly<typeof initialState>

interface FontSelectorProps extends WithRouterProps, FormComponentProps {
  fontId: string
}

const baseGoogleApiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts'
const apiKey = process.env.GOOGLE_FONTS_API_KEY

class FontSelector extends React.Component<
  FontSelectorProps,
  FontSelectorState
> {
  readonly state: FontSelectorState = initialState
  constructor (props: FontSelectorProps) {
    super(props)
    this.toggleSelectedFont = this.toggleSelectedFont.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.normalizeFontVariant = this.normalizeFontVariant.bind(this)
    this.searchGoogleFontsForInput = this.searchGoogleFontsForInput.bind(this)
    this.getCssForFoundFonts = this.getCssForFoundFonts.bind(this)
    this.getGoogleCssRule = this.getGoogleCssRule.bind(this)
    this.formatGoogleCssAsJss = this.formatGoogleCssAsJss.bind(this)
    this.createInlineStylesFromGoogleFont = this.createInlineStylesFromGoogleFont.bind(
      this
    )
  }

  componentDidMount () {
    const request = encodeURI(`${baseGoogleApiUrl}?key=${apiKey}`)
    axios
      .get(request)
      .then(response => {
        const googleFonts = response.data.items
        this.setState(prevState => ({
          ...prevState,
          googleFonts
        }))
      })
      .catch(error => console.log(error))
  }

  toggleSelectedFont (font) {
    const { selectedFonts } = this.state
    const index = selectedFonts.findIndex(selectedFont => {
      return (
        selectedFont.fontFamily === font.fontFamily &&
        selectedFont.fontWeight === font.fontWeight &&
        selectedFont.fontStyle === font.fontStyle
      )
    })
    const updatedSelectedFonts =
      index !== -1
        ? selectedFonts.slice(0, index).concat(selectedFonts.slice(index + 1))
        : selectedFonts.concat(font)
    this.setState(prevState => ({
      ...prevState,
      selectedFonts: updatedSelectedFonts
    }))
  }

  handleInputChange (event) {
    const searchInput = event.target.value
    const matchingFonts = searchInput
      ? this.searchGoogleFontsForInput(searchInput)
      : []
    if (matchingFonts) {
      this.getCssForFoundFonts(matchingFonts)
    }
    const inlineStyles = matchingFonts.reduce(
      (styles, font) =>
        styles.concat(this.createInlineStylesFromGoogleFont(font)),
      []
    )
    this.setState(prevState => ({
      ...prevState,
      searchInput,
      inlineStyles
    }))
  }

  handleSubmit (addTypography, toggleModalOpen) {
    const { selectedFonts } = this.state
    const { brandId } = this.props.router.query
    selectedFonts.forEach(font => {
      const { fontFamily } = font
      const fontVariant = this.normalizeFontVariant(font)
      /* The typography object type has room for lots of fields that    
          only matter for a scraped object. We only need family and variant. */
      const typographyObj = {
        element: null,
        color: null,
        font: null,
        fontFamily,
        fontSize: null,
        fontVariant
      }
      addTypography({
        variables: {
          brandId,
          typographyObj
        },
        refetchQueries: [
          {
            query: GET_TYPOGRAPHY,
            variables: { brandId }
          }
        ]
      })
    })
    const id = 2
    toggleModalOpen({
      variables: { id },
      refetchQueries: [
        {
          query: GET_MODAL_STATUS,
          variables: { id }
        }
      ]
    })
  }

  normalizeFontVariant (font) {
    /* Google fonts does not use "normal" or "bold" but "regular" and
      "700". Further, there may be range of weights for a typeface, 100
      through 900, and each may have an italic variant in the form of
      "100italic". So we need to make our output match that if we can. */
    const { fontWeight, fontStyle } = font
    const normalizedFontWeight =
      fontWeight === 'normal'
        ? 'regular'
        : fontWeight === 'bold' ? '700' : fontWeight
    const normalizedFontStyle = fontStyle === 'normal' ? '' : 'italic'
    return normalizedFontWeight + normalizedFontStyle
  }

  searchGoogleFontsForInput (searchInput) {
    const { googleFonts } = this.state
    /* We can't do a true full-featured search right now, but we'll
    be pretty liberal with returned results, including attempting to 
    be case-insensitive. */
    const matchingFonts = googleFonts.filter(font =>
      font.family.toLowerCase().includes(searchInput.toLowerCase())
    )
    return matchingFonts
  }

  async getCssForFoundFonts (fonts) {
    const requests = fonts.reduce((allRequests, font) => {
      const { family, variants } = font
      const baseGoogleCssUrl = 'https://fonts.googleapis.com/css'
      const variantRequests = variants.map(variant => {
        /* TODO: Better handling of variants and subsets, possibly using
        a UI that just presents the family, then expands when clicked
        to show variants/subsets */
        return encodeURI(
          `${baseGoogleCssUrl}?family=${family}:${variant}&subset=latin`
        )
      })
      return allRequests.concat(variantRequests)
    }, [])
    /* We don't want to keep adding new CSS to existing CSS from
    previous searches, so we'll start with a blank array. */
    const googleCssRules = await requests.map(async request => {
      const rule = await this.getGoogleCssRule(request)
      return rule
    })
    return axios.all(googleCssRules).then(rules => {
      const jssRules = this.formatGoogleCssAsJss(rules)
      const stylesheets = jssRules.map(rule =>
        jss.createStyleSheet(rule).attach()
      )
      this.setState(prevState => ({
        ...prevState,
        stylesheets
      }))
    })
  }

  async getGoogleCssRule (request) {
    const cssRule = await axios
      .get(request)
      .then(response => response.data)
      .catch(error => console.log(error))
    return cssRule
  }

  formatGoogleCssAsJss (googleCssRules) {
    const jssRules = googleCssRules.reduce((formattedRules, rule) => {
      /* These come back from Google with a lot of character variants
    we don't need for MVP, so first we need to locate the comment
    that indicates the 'latin' charset. For now, if that doesn't exist,
    we'll just take the first variant's rules. What remains will just
    be a big string with newlines and spaces for indentation. We want
    it to look more like an object. */
      const fontFaceContents =
        rule.split('/* latin */\n@font-face')[1] ||
        rule.split('\n@font-face')[1]
      const unformattedKeys = fontFaceContents.split('\n').slice(1, -1)
      const fontFaceObject = unformattedKeys.reduce((fontFaceObject, key) => {
        const cleanedKey = key.trim().split(';')[0].split(': ')
        const newObject = {
          ...fontFaceObject,
          [cleanedKey[0]]: cleanedKey[1]
        }
        return newObject
      }, {})
      const fontFamily = fontFaceObject['font-family']
      const fontStyle = fontFaceObject['font-style']
      const fontWeight = fontFaceObject['font-weight']
      const src = fontFaceObject.src.split(', ')
      /* The src key is an array, and the last item is the one
      that actually references the Google Fonts URL. The others
      are in the `local('Font Name')` format. */
      const primarySrc = src.pop()
      const fallbackSrc = src.slice(0, -1)
      /* We need to turn each fallBackSrc into an object */
      const fallbacks = fallbackSrc.reduce(
        (sources, src) => sources.concat({ src: src }),
        []
      )
      const formattedRule = {
        '@font-face': {
          fontFamily,
          fontStyle,
          fontWeight,
          src: primarySrc,
          fallbacks
        }
      }
      return formattedRules.concat(formattedRule)
    }, [])
    return jssRules
  }

  createInlineStylesFromGoogleFont (font) {
    const styles = font.variants.reduce((variantStyles, variant) => {
      const fontFamily = font.family
      const fontStyle = variant.includes('italic')
        ? 'italic'
        : variant.includes('oblique') ? 'oblique' : 'normal'
      const fontWeight = variant.includes('italic')
        ? variant.split('italic')[0]
        : variant.includes('oblique') ? variant.split('oblique')[0] : variant
      const variantStyle = {
        fontFamily,
        fontStyle,
        fontWeight
      }
      return variantStyles.concat(variantStyle)
    }, [])
    return styles
  }

  render () {
    const { inlineStyles, selectedFonts } = this.state
    const {
      searchInstructions,
      searchFieldLabel,
      searchFieldPlaceholder,
      searchFieldTooltip,
      previewAreaPlaceholder,
      buttonText
    } = copy.private.brand.fonts.editor

    return (
      <Mutation mutation={TOGGLE_MODAL}>
        {toggleModalOpen => (
          <Mutation mutation={ADD_TYPOGRAPHY}>
            {addTypography => (
              <Form
                layout='horizontal'
                className='fontSelectorForm'
                onSubmit={event => {
                  event.preventDefault()
                  event.stopPropagation()
                  this.handleSubmit(addTypography, toggleModalOpen)
                }}
              >
                <div className={styles.typographyEditor}>
                  <div className={styles.typographyEditorArea}>
                    <div className={styles.content}>{searchInstructions}</div>
                    <div className={styles.searchAndUploadArea}>
                      <div className={styles.searchArea}>
                        <p className={styles.searchTitle}>
                          {searchFieldLabel}
                          <InfoPopover content={searchFieldTooltip} />
                        </p>
                        <div className={styles.searchFields}>
                          <Input
                            className={styles.searchInput}
                            placeholder={searchFieldPlaceholder}
                            onChange={this.handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {inlineStyles.length > 0 ? (
                    <div className={styles.uploadedFontListArea}>
                      {inlineStyles.map((style, index) => (
                        <UploadedFontItem
                          style={style}
                          selectedFonts={selectedFonts}
                          toggleSelected={this.toggleSelectedFont}
                          key={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.fontPreviewsArea}>
                      <div className={styles.fontlistName}>
                        {previewAreaPlaceholder}
                      </div>
                    </div>
                  )}
                  <div className={styles.fontAddDoneButton}>
                    <Button
                      htmlType='submit'
                      className='onebrand-button'
                      type='primary'
                    >
                      {buttonText}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Mutation>
        )}
      </Mutation>
    )
  }
}

export default withRouter(
  Form.create<FontSelectorProps>({ name: 'Font Selector Form' })(FontSelector)
)
