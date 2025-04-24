export { };

declare global {
  namespace Express {
    interface Request {

      validated?<Q = Record<string, unknown>, P = unknown, B = unknown, H = unknown, C = unknown, F = unknown>(): {
        params: P | undefined
        query: Q | undefined
        body: B | undefined
        headers: H | undefined
        cookies: C | undefined
        files: F | undefined
        [x: string]: unknown
      }
    }
  }
}
