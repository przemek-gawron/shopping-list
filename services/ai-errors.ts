export class ApiKeyError extends Error {
  constructor() {
    super('Invalid API key');
    this.name = 'ApiKeyError';
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

/** Thrown when the user must be signed in to use AI (guest or no token). */
export class UnauthenticatedError extends Error {
  constructor(
    public readonly reason: 'guest' | 'no_token'
  ) {
    super(reason === 'guest' ? 'Sign in to use this feature' : 'Not signed in');
    this.name = 'UnauthenticatedError';
  }
}
