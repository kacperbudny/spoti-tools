const SIGN_IN_FAILED = "Sign-in did not complete. You can try again.";

export function signInErrorMessage(error: string | undefined): string | null {
  if (!error) {
    return null;
  }
  return SIGN_IN_FAILED;
}
