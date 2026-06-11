const asyncHandler = require("./async");
var ErrorResponse = require("../utils/ErrorResponse");
const notify = require(__path_configs + "notify");
const systemConfig = require(__path_configs + "system");
var UserModel = require(__path_models + "users");

var jwt = require("jsonwebtoken");

exports.protect = asyncHandler(async (req, res, next) => {
  let token = "";

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse(401, notify.ERROR_LOGIN_USED));
  }

  // TODO: decode token
  try {
    const decoded = jwt.verify(token, systemConfig.JWT_SECRET);
    req.user = await UserModel.listItems({ id: decoded.id }, { task: "one" });
    next();
  } catch (error) {
    return next(new ErrorResponse(401, notify.ERROR_LOGIN_USED));
  }
});

// TODO: dùng ...roles để chuyển chuỗi string "publisher", "admin" thành mảng ["publisher", "admin"]
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(403, notify.ERROR_PERMISSION));
    }
    next();
  };
};
