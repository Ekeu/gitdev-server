export const GITDEV_PASSWORD_MIN_LENGTH = 8;
export const GITDEV_PASSWORD_MAX_LENGTH = 72;
export const GITDEV_USERNAME_MIN_LENGTH = 5;
export const GITDEV_USERNAME_MAX_LENGTH = 40;
export const GITDEV_EMAIL_REGEX = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
export const GITDEV_PASSWORD_REGEX = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*.!@$%^&(){}[\\]:;<>,.?/~_+=|\\-]).{8,72}$",
);
export const GITDEV_ERRORS = {
  EMAIL_NOT_FOUND: {
    name: "Account already exists",
    message: "Invalid email or password",
  },
  INVALID_PASSWORD: {
    name: "Invalid password",
    message: "Invalid email or password",
  },
  ACCOUNT_ALREADY_EXISTS: {
    name: "Account already exists",
    message:
      "The provided email is already associated with an account. If you forgot your password, please use the reset password option.",
  },
  AVATAR_IMAGE_UPLOAD: {
    name: "Image upload error",
    message: "Error uploading avatar image",
  },
  SIGNIN_FAILED: {
    name: "Sign-in unsuccessful",
    message:
      "We couldn't sign you in with the provided credentials. Please check your email and password and try again.",
  },
  SIGNIN_ERROR: {
    name: "Sign-in Error",
    message: "Oops! Something went wrong during the sign-in process. Please try again.",
  },
  NO_TOKEN_PROVIDED: {
    name: "Authentication token missing",
    message: "No authentication token was provided.",
  },
  NOT_FOUND_OR_SIGNED_OUT: {
    name: "Account unavailable",
    message: "We couldn't find your account, or you may have already signed out. Please sign in again if necessary.",
  },
  TOKEN_REVOKE_FAILED: {
    name: "Token revocation error",
    message: "TWe encountered an error while trying to revoke the token. Please try again.",
  },
  USERNAME_ALREADY_EXISTS: {
    name: "Username unavailable",
    message: "Oops! The username you've chosen is already in use. Please choose a different username.",
  },
  UNAUTHENTICATED: {
    name: "Unauthenticated access",
    message: "Access denied. You must be logged in to view this resource.",
  },
  JWT_FAILED_OR_USER_NOT_FOUND: {
    name: "Authentication failed",
    message: "User not found or Invalid token.",
  },
};
export const GITDEV_AUTH_QUEUE = "auth-mq";
export const GITDEV_AUTH_SIGNUP_JOB = "auth-mq-signup";
export const GITDEV_SIGNUP_SUCCESSFUL = "Your account has been created successfully! Welcome to the community.";
export const GITDEV_SIGNIN_SUCCESSFUL = "You're signed in! Great to have you back.";
export const GITDEV_SIGNOUT_SUCCESSFUL = "You have been signed out successfully. We hope to see you again soon.";
