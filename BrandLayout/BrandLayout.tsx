/// <reference path='../../Modal/Modal.d.ts' />
import * as React from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import { Query } from 'react-apollo'
import { GetModalStatus as GET_MODAL_STATUS } from '../../Modal/Modal.client.graphql'
import { Row, Col } from 'antd'
import { ItemAddCard, ItemDisplayCard } from '../../Card'
import { BrandItem, BrandItemType } from '../Brand.types'
// import DefaultColorSelector from './DefaultColorSelector'
import { ShareModal } from '../ShareModal'
import styles from './BrandLayout.css'

interface BrandLayoutProps extends WithRouterProps {
  brandItems: Array<BrandItem>
}

const BrandLayout: React.FunctionComponent<BrandLayoutProps> = props => {
  const { brandItems, router, children } = props
  // ID for the "publish" version of the share modal we're opening below
  const id = 19
  /* We need 'color' | 'logo' | 'font' to pass as props below. We'll prefer to get them by reading the __typename from one of the brandItems passed
  in and truncating it before "Payload". This will be safer than our
  second option: in the event that brandItems is empty, we'll grab whatever
  comes after `/brand/` in the route, chop the 's' off the end, and walk
  away whistling. */
  // const brandItemType: BrandItemType =
  //   brandItems.length > 0
  //     ? brandItems[0].__typename
  //         .toLowerCase()
  //         .split('payload')[0] as BrandItemType
  //     : router.pathname.split('/')[2].slice(0, -1) as BrandItemType
  // const isColorsPage = brandItemType === 'color'
  return (
    <React.Fragment>
      {/* {isColorsPage && <DefaultColorSelector />} */}
      <div className={styles.itemCardArea}>
        <Row gutter={25} type='flex'>
          {brandItems.length > 0 &&
            brandItems.map((item, index) => (
              <Col xxl={4} xl={6} lg={8} md={12} sm={24} key={index}>
                <ItemDisplayCard item={item} />
              </Col>
            ))}
          <Col xxl={4} xl={6} lg={8} md={12} sm={24}>
            <ItemAddCard />
          </Col>
        </Row>
      </div>
      {children}
      <ShareModal id={id} />
    </React.Fragment>
  )
}

export default withRouter(BrandLayout)
