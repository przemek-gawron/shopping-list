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
