const util = require("util");

const notify = require(__path_configs + "notify");

const options = {
  name: { min: 3, max: 100 },
  description: { min: 10, max: 500 },
};

module.exports = {
  validator: (req, res, next) => {
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();

    const errors = [];
    let message = {};

    if (name.length <= options.name.min || name.length >= options.name.max) {
      errors.push({
        param: "name",
        msg: util.format(notify.ERROR_NAME, options.name.min, options.name.max),
        value: req.body?.name,
        location: "body",
      });
    }

    if (
      description.length <= options.description.min ||
      description.length >= options.description.max
    ) {
      errors.push({
        param: "description",
        msg: util.format(
          notify.ERROR_DESCRIPTION,
          options.description.min,
          options.description.max,
        ),
        value: req.body?.description,
        location: "body",
      });
    }

    errors.map((val, ind) => {
      message[val.param] = val.msg;
    });

    return message;
  },
};
