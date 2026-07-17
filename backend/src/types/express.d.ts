declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth` after a valid JWT */
      appUser: {
        id: string;
        email: string | null;
        displayName: string | null;
        provider: string | null;
      };
    }
  }
}

export {};
