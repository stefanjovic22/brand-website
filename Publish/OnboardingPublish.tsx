import * as React from 'react'
import { AddEditModal } from '../AddEditModal'
import OnboardingPublishFooter from './OnboardingPublishFooter'

// Found in /components/Modal/Modal.defaults.ts
const modalId = 3

const AddYourBrandPublish: React.FunctionComponent = () => {
  return <AddEditModal modalId={modalId} footer={<OnboardingPublishFooter />} />
}

export default AddYourBrandPublish
