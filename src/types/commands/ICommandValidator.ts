export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ICommandValidator<TArgs = unknown> {
  validate(args: TArgs): ValidationResult;
}
