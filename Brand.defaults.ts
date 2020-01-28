import { merge } from 'lodash'
import { LogoEditorDefaults } from './Logos/LogoEditor'

const BrandDefaults = {
  brand: {
    id: 0,
    __typename: 'Brand',
    defaultColorMode: 'HEX',
    colors: [
      {
        __typename: 'Color',
        id: '181b13a4-4a51-4d16-b50c-7bdd2e33fe88',
        hexValue: '#3f2e86',
        rgbValue: {
          __typename: 'RgbValue',
          red: 63,
          green: 46,
          blue: 134
        },
        hsbValue: {
          __typename: 'HsbValue',
          hue: 251.56626506024094,
          saturation: 0.66,
          brightness: 0.5262626262626262
        },
        labValue: {
          __typename: 'LabValue',
          lightness: 26,
          a: 32,
          b: -47
        },
        cmykValue: {
          __typename: 'CmykValue',
          cyan: 53,
          magenta: 66,
          yellow: 0,
          black: 47
        },
        selectedColorMode: 'CMYK',
        title: 'Primary 1',
        tags: [ 'Brand', 'Primary' ]
      }
    ],
    logos: [
      {
        __typename: 'Logo',
        id: '181b13a4-4971-4d16-b50c-7bdd2e33fe88',
        originalUrl: '/static/logo-test-original.svg',
        encodedUrl: '/static/logo-test-encoded.png',
        encodedSize: {
          __typename: 'LogoSize',
          width: 612,
          height: 489
        },
        spacing: {
          __typename: 'LogoSpacing',
          isEditedByUser: false,
          topPercentage: null,
          bottomPercentage: null,
          leftPercentage: null,
          rightPercentage: null,
          spacingMultiple: 1
        },
        title: 'Primary',
        tags: []
      },
      {
        __typename: 'Logo',
        id: '181b13a4-4971-4d16-b50c-7bdd2e55ae88',
        originalUrl: '/static/logo-test-tall-original.svg',
        encodedUrl: '/static/logo-test-tall-encoded.png',
        encodedSize: {
          __typename: 'LogoSize',
          width: 315,
          height: 722
        },
        spacing: {
          __typename: 'LogoSpacing',
          isEditedByUser: false,
          topPercentage: null,
          bottomPercentage: null,
          leftPercentage: null,
          rightPercentage: null,
          spacingMultiple: 1
        },
        title: 'Brandmark',
        tags: []
      },
      {
        __typename: 'Logo',
        id: '184c53a4-4971-4d16-b50c-7bdd2e55ae88',
        originalUrl: '/static/logo-test-wide-original.svg',
        encodedUrl: '/static/logo-test-wide-encoded.png',
        encodedSize: {
          __typename: 'LogoSize',
          width: 3460,
          height: 722
        },
        spacing: {
          __typename: 'LogoSpacing',
          isEditedByUser: false,
          topPercentage: null,
          bottomPercentage: null,
          leftPercentage: null,
          rightPercentage: null,
          spacingMultiple: 1
        },
        title: 'Lockup',
        tags: []
      }
    ],
    fonts: [
      {
        __typename: 'Font',
        id: '181b13a4-4971-4d16-3e0c-7bdd2e33fe88',
        element: 'body',
        source: 'GOOGLE_FONT',
        name: 'Montserrat',
        stylesUsed: [ 'medium', 'bold' ],
        title: 'body',
        tags: [],
        previewImageUrl: '',
        thumbnailImageUrl: '/static/font-body-thumbnail-test.png'
      }
    ],
    selectedTemplate: {
      __typename: 'GuidelineTemplate',
      id: 0,
      name: 'Clean and Minimal'
    },
    statuses: {
      __typename: 'BrandStatus',
      colors: 'finished',
      logos: 'process',
      fonts: 'waiting',
      template: 'waiting'
    },
    isComplete: false
  }
}

export default merge(BrandDefaults, LogoEditorDefaults)
