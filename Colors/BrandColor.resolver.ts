import { ApolloCache } from 'apollo-cache'
import { NormalizedCacheObject } from 'apollo-boost'
import BrandColorFragments from './BrandColor.fragments'
import { PickerColor, BrandColor, ColorMode } from '../Brand.types'
import { createUUID } from '../Brand.helpers'
import convert from 'color-convert'

// Later we'll actually need to send this through as a variable.
const brandId = `Brand:0`

function normalizeSelectedColor (color){
  const { hex, hsv, rgb } = color
  const lab = convert.hex.lab(hex)
  const cmyk = convert.hex.cmyk(hex)
  const newColor = {
    hexValue: hex,
    rgbValue: {
      __typename: 'RgbValue',
      red: rgb.r,
      green: rgb.g,
      blue: rgb.b
    },
    hsbValue: {
      __typename: 'HsbValue',
      hue: hsv.h,
      saturation: hsv.s,
      brightness: hsv.v
    },
    labValue: {
      __typename: 'LabValue',
      lightness: lab[0],
      a: lab[1],
      b: lab[2]
    },
    cmykValue: {
      __typename: 'CmykValue',
      cyan: cmyk[0],
      magenta: cmyk[1],
      yellow: cmyk[2],
      black: cmyk[3]
    }
  }
  return newColor
}

export default {
  Mutation: {
    setDefaultColorMode: (
      _: undefined,
      { defaultColorMode }: { defaultColorMode: ColorMode },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandColorFragments.defaultColorMode
      const id = brandId
      const currentDefaultColorMode = cache.readFragment<
        NormalizedCacheObject
      >({
        fragment,
        id
      })
      const data = {
        ...currentDefaultColorMode,
        defaultColorMode
      }
      cache.writeFragment({ fragment, id, data })
      return null
    },

    addOrUpdateBrandColor: (
      _: undefined,
      {
        color,
        id,
        selectedColorMode
      }: { color: PickerColor; id: string; selectedColorMode: ColorMode },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandColorFragments.colors
      const cacheData = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: brandId
      })

      const colors = cacheData.colors as BrandColor
      /* If this is an update to an existing color, `id` will have a value, and we'll use this to set the value we writeQuery with later. */
      const isUpdate = id !== null && id !== undefined
      const index = ((colors as unknown) as Array<BrandColor>).findIndex(
        color => color.id === id
      )
      const colorToUpdate = isUpdate && (colors[index] as BrandColor)
      const title = isUpdate
        ? colorToUpdate.title
        : `Primary ${((colors as unknown) as BrandColor[]).length + 1}`
      const tags = isUpdate ? colorToUpdate.tags : []
      const colorMode = isUpdate
        ? colorToUpdate.selectedColorMode
        : selectedColorMode
      /* Now we need to reformat color passed in from the `ChromePicker`
       format to that of our Brand schema*/
      const normalizedColor = normalizeSelectedColor(color)
      const colorId = isUpdate ? id : createUUID()

      const newColor: BrandColor = {
        __typename: 'Color',
        id: colorId,
        title,
        tags,
        selectedColorMode: colorMode,
        ...normalizedColor
      }

      if (isUpdate) {
        ;((colors as unknown) as BrandColor[]).splice(index, 1, newColor)
      } else {
        ;((colors as unknown) as BrandColor[]).push(newColor)
      }

      const data = {
        ...cacheData,
        colors
      }
      cache.writeFragment({ fragment, id: brandId, data })
      return null
    },

    updateColorMode: (
      _: undefined,
      { id, selectedColorMode }: { id: string; selectedColorMode: ColorMode },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandColorFragments.colors
      const cacheData = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: brandId
      })

      const colors = cacheData.colors as BrandColor
      const index = ((colors as unknown) as Array<BrandColor>).findIndex(
        color => color.id === id
      )
      colors[index].selectedColorMode = selectedColorMode

      const data = {
        ...cacheData,
        colors
      }
      cache.writeFragment({ fragment, id: brandId, data })
      return null
    }
  }
}
