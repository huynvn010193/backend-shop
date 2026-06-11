const util = require("util");

const notify = require(__path_configs + "notify");

const options = {
  username: { min: 3, max: 100 },
  email: { min: 1, max: 30 },
  password: { min: 4, max: 30 },
  enum: ["publisher", "user"],
};

module.exports = {
  validator: (req, res, next) => {
    const username = String(req.body?.username || "").trim();
    const email = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "").trim();
    const role = String(req.body?.role || "").trim();

    const errors = [];
    let message = {};

    if (
      username.length <= options.username.min ||
      username.length >= options.username.max
    ) {
      errors.push({
        param: "username",
        msg: util.format(
          notify.ERROR_USERNAME,
          options.username.min,
          options.username.max,
        ),
        value: req.body?.username,
        location: "body",
      });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push({
        param: "email",
        msg: util.format(notify.ERROR_EMAIL),
        value: req.body?.email,
        location: "body",
      });
    }

    if (
      password.length <= options.password.min ||
      password.length >= options.password.max
    ) {
      errors.push({
        param: "password",
        msg: util.format(
          notify.ERROR_PASSWORD,
          options.password.min,
          options.password.max,
        ),
        value: req.body?.password,
        location: "body",
      });
    }

    if (!options.enum.includes(role)) {
      errors.push({
        param: "role",
        msg: util.format(notify.ERROR_ROLE),
        value: req.body?.role,
        location: "body",
      });
    }

    errors.map((val, ind) => {
      message[val.param] = val.msg;
    });

    return message;
  },
};
