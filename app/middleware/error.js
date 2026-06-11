var ErrorResponse = require("../utils/ErrorResponse");
var notify = require("../configs/notify");

const errorHandler = (err, req, res, next) => {
  console.error(err);
  let error = { ...err };
  if (err.name === "CastError") {
    let message = notify.ERROR_CASTEROR;
    error = new ErrorResponse(404, message);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
