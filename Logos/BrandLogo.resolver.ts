import { ApolloCache } from 'apollo-cache'
import { NormalizedCacheObject } from 'apollo-boost'
import Editor from './LogoEditor/LogoEditor.defaults'
import {
  getSides,
  getOppositeSide,
  getAxis
} from './LogoEditor/LogoEditor.helpers'
import BrandLogoFragments from './BrandLogo.fragments'
import { LogoSpacing } from '../Brand.types'
import { LogoDisplaySize } from './BrandLogo.types'

/* We'll only have one instance of an editor for now,
so we'll just import and use the id from the defaults. */
const editorId = `LogoEditor:${Editor.editor.id}`

export default {
  Mutation: {
    loadLogoIntoEditor: (
      _: undefined,
      {
        logoId,
        logoDisplaySize
      }: { logoId: string; logoDisplaySize: LogoDisplaySize },
      {
        cache
      }: {
        cache: ApolloCache<NormalizedCacheObject>
      }
    ) => {
      /* This mutation runs any time the logoContainer gets (re-)sized,
      so sometimes the editor will already be full of values when that
      happens. So first we'll check for those values; if they exist,
      we only need to write the new LogoDisplaySize. */
      const editorFragment = BrandLogoFragments.editor
      const editor = cache.readFragment<NormalizedCacheObject>({
        fragment: editorFragment,
        id: editorId
      })
      const { guideOffset } = editor
      /* We want the guides in an array so we can test whether they're all null. `.slice()` gets rid of the `__typename` entry at the end. */
      const guides = Object.entries(guideOffset)
        .map(([ key, value ]) => ({ [key]: value }))
        .slice(0, -1)
      /* If every value in `guides` is null (the default state of the
        editor), we can assume that this is a fresh load of the editor.
        If even one is not null, the user has already been working with
        this logo in the editor. */
      const isNotYetLoaded = guides.every(guide =>
        Object.values(guide).every(value => value === null)
      )
      /* These are the values we'll always be writing into the editor,
      regardless of the outcome of our isNotYetLoaded check. */
      const {
        containerWidth,
        containerHeight,
        logoWidth,
        logoHeight
      } = logoDisplaySize

      /* But if we're re-opening a previously edited logo, we'll need to
      use some of its values directly, and derive others logically. */
      const logoFragment = BrandLogoFragments.logo
      const id = cache['config'].dataIdFromObject({
        __typename: 'LogoPayload',
        id: logoId
      })
      const logo = cache.readFragment<NormalizedCacheObject>({
        fragment: logoFragment,
        id
      })
      const isEditedByUser = logo.spacing ? logo.spacing.isEditedByUser : null
      const topPercentage = logo.spacing
        ? logo.spacing.topPercentage as number
        : null
      const bottomPercentage = logo.spacing
        ? logo.spacing.bottomPercentage as number
        : null
      const leftPercentage = logo.spacing
        ? logo.spacing.leftPercentage as number
        : null
      const rightPercentage = logo.spacing
        ? logo.spacing.rightPercentage as number
        : null
      const spacingMultiple = logo.spacing
        ? logo.spacing.spacingMultiple as number
        : 1
      /* For both these controls toggles, we'll first check whether
      they're currently off. If they're on, that means the user turned
      them on, and they should stay on. If they're off, we have to decide
      whether they should A) stay off because the user turned them off,
      B) stay off because the logo has never been edited before, or C)
      get turned on because the user has edited the logo before and used
      them. */
      const controlsEnabled = editor.controlsEnabled
        ? true
        : isNotYetLoaded ? isEditedByUser : editor.controlsEnabled
      /* We can assume that if both x-axis percentages are at zero the
      user either never enabled the width controls or did but didn't use
      them. In the latter case, it seems safe to assume they can be
      turned back off. */
      const widthControlsEnabled = editor.widthControlsEnabled
        ? true
        : isNotYetLoaded
          ? !(!leftPercentage && !rightPercentage)
          : editor.widthControlsEnabled

      const newSpacingMultiple = isNotYetLoaded
        ? spacingMultiple
        : editor.spacingMultiple

      /* Now we need to convert our percentage spacing values into
        pixels, based on the `logoDisplaySize` param. We check that
        the values in that param aren't also null—meaning that
        this logo has never been edited at all and doesn't have
        values to provide. If there are incoming values, we should
        prefer those, because it means the user has been editing but
        their edits haven't been written yet. */
      /* We're using Math.round() on any non-null results because
        we don't massive decimals in our nice clean UI. */
      const currentLogoWidth = editor.logoDisplaySize.logoWidth as number
      const currentLogoHeight = editor.logoDisplaySize.logoHeight as number
      const top =
        guideOffset.top !== null
          ? Math.round(
              logoHeight * (guideOffset.top as number) / currentLogoHeight
            )
          : topPercentage !== null
            ? Math.round(logoHeight * (topPercentage / 100))
            : null
      const bottom =
        guideOffset.bottom !== null
          ? Math.round(
              logoHeight * ((guideOffset.bottom as number) / currentLogoHeight)
            )
          : bottomPercentage !== null
            ? Math.round(logoHeight * (bottomPercentage / 100))
            : null
      const left =
        guideOffset.left !== null
          ? Math.round(
              logoWidth * ((guideOffset.left as number) / currentLogoWidth)
            )
          : leftPercentage !== null
            ? Math.round(logoWidth * (leftPercentage / 100))
            : null
      const right =
        guideOffset.right !== null
          ? Math.round(
              logoWidth * ((guideOffset.right as number) / currentLogoWidth)
            )
          : rightPercentage !== null
            ? Math.round(logoWidth * (rightPercentage / 100))
            : null

      /* Now we'll use some more logic. If we don't have axisLinked
        values already, we will assume that if both top and bottom percentages are identical, the y axis is linked. Same goes
        for the left/right percentages and the x axis. UNLESS those
        values are null (this logo has never been edited at all) or
        equal to 0, which probably means the user just never touched
        those controls, so we shouldn't assume. */
      const y = isNotYetLoaded
        ? topPercentage === bottomPercentage &&
          (topPercentage !== 0 && topPercentage !== null)
        : editor.axisLinked.y
      const x = isNotYetLoaded
        ? leftPercentage === rightPercentage &&
          (rightPercentage !== 0 && rightPercentage !== null)
        : editor.axisLinked.x

      /* Now we can actually construct our new editor from these values. */
      const data = {
        ...editor,
        logoDisplaySize: {
          ...editor.logoDisplaySize,
          containerWidth,
          containerHeight,
          logoWidth,
          logoHeight
        },
        controlsEnabled,
        widthControlsEnabled,
        spacingMultiple: newSpacingMultiple,
        guideOffset: {
          ...guideOffset,
          top,
          bottom,
          left,
          right
        },
        axisLinked: {
          ...editor.axisLinked,
          y,
          x
        }
      }
      cache.writeFragment({ fragment: editorFragment, id: editorId, data })
      return data
    },

    toggleLogoSpacingControls: (
      _: undefined,
      __: undefined,
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.controls
      const editor = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: editorId
      })
      const controlsEnabled = editor.controlsEnabled

      const data = {
        ...editor,
        controlsEnabled: !controlsEnabled
      }
      cache.writeFragment({ fragment, id: editorId, data })
      return null
    },

    toggleLogoSpacingWidthControls: (
      _: undefined,
      __: undefined,
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.widths
      const editor = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: editorId
      })
      const widthControlsEnabled = editor.widthControlsEnabled

      // If we're turning the width controls *off*
      // we should reset their values to default.
      // This way the Y values will be used for all sides.
      if (widthControlsEnabled) {
        const guideOffset = editor.guideOffset
        const data = {
          ...editor,
          guideOffset: {
            ...guideOffset,
            left: null,
            right: null
          },
          widthControlsEnabled: !widthControlsEnabled
        }
        cache.writeFragment({ fragment, id: editorId, data })
        return null
      } else {
        const data = {
          ...editor,
          widthControlsEnabled: !widthControlsEnabled
        }
        cache.writeFragment({ fragment, id: editorId, data })
        return null
      }
    },
    setLogoGuideOffset: (
      _: undefined,
      { side, offset }: { side: string; offset: number },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.guides
      const editor = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: editorId
      })
      const guideOffset = editor.guideOffset
      const axesLinked = editor.axisLinked
      const axis = getAxis(side)
      const axisLinked = axesLinked[axis]
      // If the axis values are supposed to be linked, we need
      // to set both of them to the same value....
      if (axisLinked) {
        const oppositeSide = getOppositeSide(side)
        const data = {
          ...editor,
          guideOffset: {
            ...guideOffset,
            [side]: offset,
            [oppositeSide]: offset
          }
        }
        cache.writeFragment({ fragment, id: editorId, data })
        return null
      } else {
        const data = {
          ...editor,
          guideOffset: {
            ...guideOffset,
            [side]: offset
          }
        }
        cache.writeFragment({ fragment, id: editorId, data })
        return null
      }
    },
    toggleLogoSpacingAxisLink: (
      _: undefined,
      { axis }: { axis: string },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.guides
      const editor = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: editorId
      })
      const guideOffset = editor.guideOffset
      const axisLinked = editor.axisLinked
      const linked = axisLinked[axis]

      // If the values are currently not linked, we'll update the
      // two side values to match when the user clicks the link
      // button. We'll choose the greater of the two values.
      if (!linked) {
        // Get the two state values and compare them
        const [ side1, side2 ] = getSides(axis)
        const sideValue =
          guideOffset[side1] > guideOffset[side2]
            ? guideOffset[side1]
            : guideOffset[side2]
        const data = {
          ...editor,
          guideOffset: {
            ...guideOffset,
            [side1]: sideValue,
            [side2]: sideValue
          },
          axisLinked: {
            ...axisLinked,
            [axis]: !linked
          }
        }
        cache.writeFragment({ fragment, id: editorId, data })
        return null
      } else {
        const data = {
          ...editor,
          axisLinked: {
            ...axisLinked,
            [axis]: !linked
          }
        }
        cache.writeFragment({ fragment, id: editorId, data })
        return null
      }
    },
    setLogoSpacingMultiple: (
      _: undefined,
      { spacingMultiple }: { spacingMultiple: number },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.spacingMultiple
      const editor = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: editorId
      })

      const data = {
        ...editor,
        spacingMultiple
      }
      cache.writeFragment({ fragment, id: editorId, data })
      return null
    },

    setLogoSpacing: (
      _: undefined,
      { logoId, spacing }: { logoId: string; spacing: LogoSpacing },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.logoSpacing
      const id = cache['config'].dataIdFromObject({
        __typename: 'LogoPayload',
        id: logoId
      })
      const logo = cache.readFragment<NormalizedCacheObject>({
        fragment,
        id
      })
      const {
        isEditedByUser,
        topPercentage,
        bottomPercentage,
        leftPercentage,
        rightPercentage,
        spacingMultiple
      } = spacing
      const data = {
        ...logo,
        spacing: {
          ...logo.spacing,
          __typename: 'LogoSpacing',
          isEditedByUser,
          topPercentage,
          bottomPercentage,
          leftPercentage,
          rightPercentage,
          spacingMultiple
        }
      }

      cache.writeFragment({ fragment, id, data })
      return null
    },

    clearEditorValues: (
      _: undefined,
      __: undefined,
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandLogoFragments.editor
      const id = editorId
      const editor = cache.readFragment<NormalizedCacheObject>({ fragment, id })
      const data = {
        ...editor,
        logoDisplaySize: {
          ...editor.logoDisplaySize,
          containerWidth: null,
          containerHeight: null,
          logoWidth: null,
          logoHeight: null
        },
        controlsEnabled: false,
        widthControlsEnabled: false,
        spacingMultiple: 1,
        guideOffset: {
          ...editor.guideOffset,
          top: null,
          bottom: null,
          left: null,
          right: null
        },
        axisLinked: {
          ...editor.axisLinked,
          y: false,
          x: false
        }
      }
      cache.writeFragment({ fragment, id, data })
      return null
    }
  }
}
