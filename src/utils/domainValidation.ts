// Domain validation will be added alongside the authentication flow.
export type DomainValidationResult = {
  isValid: boolean;
  domain?: string;
};
