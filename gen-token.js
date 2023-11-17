const crypto = require("crypto");
const secret = crypto.randomBytes(32).toString("hex");

console.log(secret);


catch (error) {
  const err = error as Error;

  if (err.name === "TokenExpiredError") {
    authUserRefreshToken.refreshTokens = [...newRefreshTokens];
  }

  if (err.name === "JsonWebTokenError") {
    return next(new ApiError(err.name, StatusCodes.FORBIDDEN, err.message));
  }
  next(error);
}
