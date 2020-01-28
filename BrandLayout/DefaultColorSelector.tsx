import * as React from 'react'
import { Mutation, Query } from 'react-apollo'
import { SetDefaultColorMode as SET_DEFAULT_COLOR_MODE } from '../Colors/BrandColor.client.graphql'
import { GET_DEFAULT_COLOR_MODE } from '../Colors/BrandColor.queries'
import { Select, Icon } from 'antd'
import styles from './DefaultColorSelector.css'

const { Option } = Select

const colorModes = [ 'HEX', 'RGB', 'HSB', 'LAB', 'CMYK' ]

const DefaultColorSelector: React.FunctionComponent = () => {
  return (
    <Query query={GET_DEFAULT_COLOR_MODE}>
      {({ data: { brand: { defaultColorMode } } }) => {
        const filteredOptions = colorModes.filter(
          item => item !== defaultColorMode
        )
        return (
          <div className={styles.defaultColorSelector}>
            <div className={styles.defaultColorSelectorDescription}>
              The default color mode is
            </div>
            <Mutation mutation={SET_DEFAULT_COLOR_MODE}>
              {setDefaultColorMode => (
                <Select
                  defaultValue={defaultColorMode}
                  className={styles.selectHandleColorType}
                  suffixIcon={<Icon type='caret-down' />}
                  dropdownMatchSelectWidth={false}
                  dropdownClassName={styles.selectDropdownOptions}
                  onChange={value => {
                    setDefaultColorMode({
                      variables: {
                        defaultColorMode: value
                      }
                    })
                  }}
                >
                  {filteredOptions.map(item => (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  ))}
                </Select>
              )}
            </Mutation>
          </div>
        )
      }}
    </Query>
  )
}

export default DefaultColorSelector
