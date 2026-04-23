export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class UpstreamAuthError extends HttpError {
  constructor() {
    super(502, 'UPSTREAM_AUTH', 'Anthropic rejected the server API key');
  }
}

export class UpstreamError extends HttpError {
  constructor(status: number, detail: string) {
    super(502, 'UPSTREAM_ERROR', `Anthropic error (${status}): ${detail}`);
  }
}

export class ParseToolError extends HttpError {
  constructor(message: string) {
    super(502, 'PARSE_ERROR', message);
  }
}
