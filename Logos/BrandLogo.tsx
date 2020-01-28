import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Query } from 'react-apollo'
import { GET_LOGOS } from './BrandLogo.queries'
import { BrandLayout } from '../BrandLayout'
import { AddEditModal } from '../AddEditModal'
import { TitleTagsEditor } from '../TitleTagsEditor'

const BrandLogo: React.FunctionComponent<WithRouterProps> = ({ router }) => {
  const { brandId } = router.query
  return (
    <Query query={GET_LOGOS} variables={{ brandId }}>
      {({ data, loading }) => {
        if (loading) return null
        const logos =
          data !== undefined
            ? data.logosByBrandId !== null ? data.logosByBrandId : []
            : []
        return (
          <BrandLayout brandItems={logos}>
            <AddEditModal modalId={1} />
            <TitleTagsEditor itemType='logo' />
          </BrandLayout>
        )
      }}
    </Query>
  )
}

export default withRouter<WithRouterProps>(BrandLogo)
