var createError = require("http-errors");
var express = require("express");
var morgan = require("morgan");
var errorHandler = require("./app/middleware/error");
var cookieParser = require("cookie-parser");
const helmet = require("helmet");
const sanitizeHtml = require("sanitize-html");
const rateLimit = require("express-rate-limit");

const mongoose = require("mongoose");
const cors = require("cors");

// TODO: dùng express-rate-limit để giới hạn số lượng request từ một IP trong một khoảng thời gian nhất định, tránh DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

var app = express();
app.use(express.json());
app.use(morgan("tiny"));

// TODO: dùng sanitize-html để làm sạch dữ liệu đầu vào, tránh XSS
const sanitizeObject = (obj) => {
  if (!obj) return;

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = sanitizeHtml(obj[key]);
    }
  }
};

// CORS middleware
app.use(cors());

// FIXME : cookieParser
app.use(cookieParser());
app.use(helmet());
app.use(limiter);

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);
  next();
});

const pathConfig = require("./path");
global.__base = __dirname + "/";
global.__path_app = __base + pathConfig.folder_app + "/";

global.__path_schemas = __path_app + pathConfig.folder_schemas + "/";
global.__path_models = __path_app + pathConfig.folder_models + "/";
global.__path_routers = __path_app + pathConfig.folder_routers + "/";
global.__path_configs = __path_app + pathConfig.folder_configs + "/";
global.__path_validates = __path_app + pathConfig.folder_validates + "/";

const systemConfig = require(__path_configs + "system");
const databaseConfig = require(__path_configs + "database");

// Local variable
app.locals.systemConfig = systemConfig;

mongoose
  .connect(
    `mongodb+srv://${databaseConfig.username}:${databaseConfig.password}@cluster0.amr9jcd.mongodb.net/${databaseConfig.database}?retryWrites=true&w=majority`,
  )
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.log("Error connecting to database");
  });

// Setup router
app.use("/api/v1/", require(__path_routers));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
