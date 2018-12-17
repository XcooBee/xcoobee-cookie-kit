export default class NotAuthorizedError extends Error {
  constructor() {
    super("Failed to connect to XcooBee. Please log in and try again.");
  }
}
