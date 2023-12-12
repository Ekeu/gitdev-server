export const GITDEV_PASSWORD_MIN_LENGTH = 8;
export const GITDEV_PASSWORD_MAX_LENGTH = 72;
export const GITDEV_USERNAME_MIN_LENGTH = 5;
export const GITDEV_USERNAME_MAX_LENGTH = 40;
export const GITDEV_PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z]).{8,72}$/;
export const GITDEV_ERRORS = {
  EMAIL_NOT_FOUND: {
    name: "AccounAlreadyExists",
    message: "Invalid email or password",
  },
  INVALID_PASSWORD: {
    name: "InvalidPassword",
    message: "Invalid email or password",
  },
  ACCOUNT_ALREADY_EXISTS: {
    name: "AccounAlreadyExists",
    message:
      "The provided email is already associated with an account. If you forgot your password, please use the reset password option.",
  },
  AVATAR_IMAGE_UPLOAD: {
    name: "ImageUploadError",
    message: "Error uploading avatar image",
  },
  SIGNIN_FAILED: {
    name: "SignInUnsuccessful",
    message:
      "We couldn't sign you in with the provided credentials. Please check your email and password and try again.",
  },
  SOCIAL_SIGNIN_FAILED: {
    name: "SocialSignInUnsuccessful",
    message: "Sign-in with the provided credentials failed. Please check your social account details and try again.",
  },
  SIGNIN_ERROR: {
    name: "SignInError",
    message: "Oops! Something went wrong during the sign-in process. Please try again.",
  },
  NO_TOKEN_PROVIDED: {
    name: "AuthenticationTokenMissing",
    message: "No authentication token was provided.",
  },
  NOT_FOUND_OR_SIGNED_OUT: {
    name: "AccountUnavailable",
    message: "We couldn't find your account, or you may have already signed out. Please sign in again if necessary.",
  },
  TOKEN_REVOKE_FAILED: {
    name: "TokenRevocationError",
    message: "TWe encountered an error while trying to revoke the token. Please try again.",
  },
  USERNAME_ALREADY_EXISTS: {
    name: "UsernameUnavailable",
    message: "Oops! The username you've chosen is already in use. Please choose a different username.",
  },
  UNAUTHENTICATED: {
    name: "UnauthenticatedAccess",
    message: "Access denied. You must be logged in to view this resource.",
  },
  JWT_FAILED_OR_USER_NOT_FOUND: {
    name: "AuthenticationFailed",
    message: "User not found or Invalid token.",
  },
  FORGOT_PASSWORD: {
    name: "ForgotPasswordError",
    message: "Oops! Something went wrong during the password reset process. Please try again.",
  },
  RESET_PASSWORD_TOKEN_INVALID: {
    name: "ResetPasswordTokenInvalid",
    message:
      "The reset password link you've entered is invalid or expired. Please request a new link to reset your password.",
  },
  EMAIL_VERIFICATION_TOKEN_INVALID: {
    name: "EmailVerificationTokenInvalid",
    message: "Invalid or expired token",
  },
};
export const GITDEV_AUTH_QUEUE = "auth-mq";
export const GITDEV_AUTH_SIGNUP_JOB = "job-mq-signup";
export const GITDEV_SIGNUP_SUCCESSFUL = "Your account has been created successfully! Welcome to the community.";
export const GITDEV_SIGNIN_SUCCESSFUL = "You're signed in! Great to have you back.";
export const GITDEV_SIGNOUT_SUCCESSFUL = "You have been signed out successfully. We hope to see you again soon.";
