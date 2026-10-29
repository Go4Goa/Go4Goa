export type TwilioVerifyCredentials = {
  credentialSid: string;
  credentialSecret: string;
  serviceSid: string;
};

export function selectTwilioVerifyCredentials(values: {
  apiKeySid: string;
  apiKeySecret: string;
  accountSid: string;
  authToken: string;
  serviceSid: string;
}): TwilioVerifyCredentials {
  const restricted = Boolean(values.apiKeySid && values.apiKeySecret);
  return {
    credentialSid: restricted ? values.apiKeySid : values.accountSid,
    credentialSecret: restricted ? values.apiKeySecret : values.authToken,
    serviceSid: values.serviceSid,
  };
}

export function phoneVerificationEnabled(enabled: boolean, credentials: TwilioVerifyCredentials) {
  return enabled && Boolean(credentials.credentialSid && credentials.credentialSecret && credentials.serviceSid);
}
