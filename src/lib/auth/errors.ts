export class SessionDeadError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionDeadError";
  }
}
