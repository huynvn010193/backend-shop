var express = require("express");
var router = express.Router();
var asyncHandler = require("../middleware/async");
const systemConfig = require(__path_configs + "system");
const controllerName = "auth";
const MainModel = require(__path_models + controllerName);
const MainValidate = require(__path_validates + controllerName);
const MainValidatePassword = require(__path_validates + "password");

const ErrorResponse = require("../utils/ErrorResponse");
var { protect } = require("../middleware/auth");
const notify = require(__path_configs + "notify");

const e = require("express");

router.post(
  "/register",
  asyncHandler(async (req, res, next) => {
    let err = await validateReq(req, res, next);
    if (!err) {
      const token = await MainModel.register(req.body);
      if (token) {
        saveCookieResponse(res, 200, token);
      }
    }
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    const token = await MainModel.login(req.body, res);
    if (token) {
      saveCookieResponse(res, 200, token);
    }
  }),
);

router.get(
  "/me",
  protect,
  asyncHandler(async (req, res, next) => {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  }),
);

router.post(
  "/forgotpassword",
  asyncHandler(async (req, res, next) => {
    const result = await MainModel.forgotPassword(req.body);
    if (!result) {
      res.status(401).json({
        success: true,
        message: notify.ERROR_EMAIL_NOT_EXIST,
      });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

router.post(
  "/resetPassword/:resetToken",
  asyncHandler(async (req, res, next) => {
    console.log("req", req.params);
    let err = await validatePasswordReq(req, res, next);
    if (!err) {
      const user = await MainModel.resetPassword({
        resetToken: req.params.resetToken,
        password: req.body.password,
      });
      if (!user) {
        res.status(401).json({
          success: true,
          message: notify.ERROR_INVALID_TOKEN,
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    }
  }),
);

router.get(
  "/logout",
  protect,
  asyncHandler(async (req, res, next) => {
    res
      .status(200)
      .cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
      });
  }),
);

const validateReq = async (req, res, next) => {
  let err = await MainValidate.validator(req);
  if (Object.keys(err).length > 0) {
    next(new ErrorResponse(400, err));
    return true;
  }
  return false;
};

const validatePasswordReq = async (req, res, next) => {
  let err = await MainValidatePassword.validator(req);
  if (Object.keys(err).length > 0) {
    next(new ErrorResponse(400, err));
    return true;
  }
  return false;
};

module.exports = router;

const saveCookieResponse = (res, statusCode, token) => {
  const option = {
    expires: new Date(
      Date.now() + systemConfig.COOKIE_EXP * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, // chỉ cho phép cookie được truy cập thông qua HTTP(S), không cho phép truy cập từ JavaScript
  };
  res.status(statusCode).cookie("token", token, option).json({
    success: true,
    token,
  });
};
