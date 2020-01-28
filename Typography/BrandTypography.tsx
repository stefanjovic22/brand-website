import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Query } from 'react-apollo'
import { GET_TYPOGRAPHY } from './BrandTypography.queries'
import { BrandLayout } from '../BrandLayout'
import { AddEditModal } from '../AddEditModal'
import { TitleTagsEditor } from '../TitleTagsEditor'
import { BrandItem } from '../Brand.types'

function extractFontFamilyNamesFromList (fonts){
  const typography = fonts.reduce((updatedFonts, font) => {
    /* `fontFamily` is a string-format list of Font Families, including
  acceptable alternatives. We'll be ignoring the alternatives because
  it is to be assumed they are not actually the official brand fonts. */
    const firstEntry = font.fontFamily.split(',')[0]
    /* Fonts with spaces in their names will be surrounded by double
  quotes; we need to get rid of those. */
    const minusQuotes =
      firstEntry.slice(0, 1) === '"' ? firstEntry.slice(1, -1) : firstEntry
    /* Some fontFamily names come in with hyphen separators instead
      of spaces. */
    const fontFamily = minusQuotes.split('-').join(' ')
    const newFont = {
      ...font,
      fontFamily
    }
    return updatedFonts.concat(newFont)
  }, [])
  return typography
}

const BrandTypography: React.FunctionComponent<WithRouterProps> = ({
  router
}) => {
  const { brandId } = router.query
  return (
    <Query query={GET_TYPOGRAPHY} variables={{ brandId }}>
      {({ data, loading }) => {
        if (loading) return null
        const rawFonts = data !== undefined ? data.typographyByBrandId : []
        const fonts = extractFontFamilyNamesFromList(rawFonts)
        return (
          <BrandLayout brandItems={(fonts as unknown) as Array<BrandItem>}>
            <AddEditModal modalId={2} />
            <TitleTagsEditor itemType='font' />
          </BrandLayout>
        )
      }}
    </Query>
  )
}

export default withRouter<WithRouterProps>(BrandTypography)
