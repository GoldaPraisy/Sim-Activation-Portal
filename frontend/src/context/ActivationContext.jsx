import { createContext, useContext, useState } from 'react';

const ActivationContext = createContext(null);

const initialActivationState = {
  step: 1, // 1: Device/EID, 2: Operator & Plan, 3: Mobile & OTP, 4: Payment, 5: SM-DP+ Profile & QR, 6: Status Timeline
  deviceId: null,
  device: null,
  customEid: '',
  deviceName: '',
  deviceType: 'iPhone',
  os: 'iOS 17.5',
  operator: 'Jio',
  selectedPlan: null,
  phone: '',
  isOtpVerified: false,
  otpCode: '',
  paymentResult: null,
  provisionedProfile: null
};

export const ActivationProvider = ({ children }) => {
  const [activationData, setActivationData] = useState(initialActivationState);

  const updateActivationData = (fields) => {
    setActivationData(prev => ({
      ...prev,
      ...fields
    }));
  };

  const nextStep = () => {
    setActivationData(prev => ({ ...prev, step: prev.step + 1 }));
  };

  const prevStep = () => {
    setActivationData(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const goToStep = (stepNumber) => {
    setActivationData(prev => ({ ...prev, step: stepNumber }));
  };

  const resetActivation = () => {
    setActivationData(initialActivationState);
  };

  return (
    <ActivationContext.Provider
      value={{
        activationData,
        updateActivationData,
        nextStep,
        prevStep,
        goToStep,
        resetActivation
      }}
    >
      {children}
    </ActivationContext.Provider>
  );
};

export const useActivation = () => {
  const context = useContext(ActivationContext);
  if (!context) {
    throw new Error('useActivation must be used within an ActivationProvider');
  }
  return context;
};
