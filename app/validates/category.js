const util = require("util");

const notify = require(__path_configs + "notify");

const options = {
  name: { min: 5, max: 100 },
  title: { min: 5, max: 100 },
};

module.exports = {
  validator: (req, res, next) => {
    const name = String(req.body?.name || "").trim();
    const title = String(req.body?.title || "").trim();

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
      title.length <= options.title.min ||
      title.length >= options.title.max
    ) {
      errors.push({
        param: "title",
        msg: util.format(
          notify.ERROR_DESCRIPTION,
          options.title.min,
          options.title.max,
        ),
        value: req.body?.title,
        location: "body",
      });
    }

    errors.map((val, ind) => {
      message[val.param] = val.msg;
    });

    return message;
  },
};
