import { ApolloCache } from 'apollo-cache'
import { NormalizedCacheObject } from 'apollo-boost'
import { merge } from 'lodash'
import { BrandItem, BrandItemType, Logo } from './Brand.types'
import BrandFragments from './Brand.fragments'
import BrandLogoResolover from './Logos/BrandLogo.resolver'
import BrandColorResolver from './Colors/BrandColor.resolver'

// Later we'll actually need to send this through as a variable.
const brandId = `Brand:0`

const BrandResolver = {
  Query: {
    getBrandItemTitleAndTags: (
      _: undefined,
      { id, type }: { id: string; type: BrandItemType },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      /* `type` is going to be color | logo | font, so this lets us
      dynamically select the correct fragment and the correct property of
      the returned data. But first we need to add an 's'. */
      console.log(id)
      const key = `${type}s`
      const fragment = BrandFragments[key]
      const items = (cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: brandId
      }) as unknown) as Array<BrandItem>
      console.log(items)
      const index = ((items[key] as unknown) as Array<BrandItem>).findIndex(
        item => item._id === id
      )
      const item = items[key][index]
      console.log(item)
      return item
    }
  },

  Mutation: {
    addOrEditItemTitleAndTags: (
      _: undefined,
      {
        id,
        type,
        title,
        tags
      }: {
        id: string
        type: BrandItemType
        title: string
        tags: Array<string>
      },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const key = `${type}s`
      const fragment = BrandFragments[key]
      const items = (cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: brandId
      }) as unknown) as Array<BrandItem>
      const index = ((items[key] as unknown) as Array<BrandItem>).findIndex(
        item => item.id === id
      )
      /* The user might open the title/tags editor, make no changes to
      one or both values, and submit. In that case, null values will
      be passed in, and we don't want to overwrite existing non-null
      values with null values. */
      items[key][index].title = title !== null ? title : items[key][index].title
      items[key][index].tags = tags !== null ? tags : items[key][index].tags
      const data = {
        ...items,
        [key]: items[key]
      }
      cache.writeFragment({ fragment, id: brandId, data })
      return null
    },

    deleteBrandItem: (
      _: undefined,
      { id, type }: { id: string; type: BrandItemType },
      { cache }: { cache: ApolloCache<NormalizedCacheObject> }
    ) => {
      const fragment = BrandFragments[type]
      const items = (cache.readFragment<NormalizedCacheObject>({
        fragment,
        id: brandId
      }) as unknown) as Array<BrandItem>
      const index = ((items[type] as unknown) as Array<BrandItem>).findIndex(
        item => item.id === id
      )
      items[type].splice(index, 1)
      const data = {
        ...items,
        [type]: items[type]
      }
      cache.writeFragment({ fragment, id: brandId, data })
      return null
    }
  }
}

export default merge(BrandLogoResolover, BrandColorResolver, BrandResolver)
