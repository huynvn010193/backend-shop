const util = require("util");

const notify = require(__path_configs + "notify");

const options = {
  password: { min: 4, max: 30 },
};

module.exports = {
  validator: (req, res, next) => {
    const password = String(req.body?.password || "").trim();

    const errors = [];
    let message = {};

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

    errors.map((val, ind) => {
      message[val.param] = val.msg;
    });

    return message;
  },
};
