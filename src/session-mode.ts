export function automaticGuestEnabled(config: { qa?: boolean; phoneVerification?: boolean }) {
  return config.qa === true && config.phoneVerification !== true;
}
