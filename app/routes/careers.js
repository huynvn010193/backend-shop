var express = require("express");
var router = express.Router();
var asyncHandler = require("../middleware/async");

const controllerName = "careers";
const MainModel = require(__path_models + controllerName);
const MainValidate = require(__path_validates + controllerName);
const ErrorResponse = require("../utils/ErrorResponse");

var { protect, authorize } = require("../middleware/auth");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await MainModel.listCareers(req.query, { task: "all" });
    if (!data) {
      res.status(200).json({
        success: true,
        data: "Dữ liệu không tồn tại",
      });
    }
    res.status(200).json({
      success: true,
      data: data,
      count: data.length,
    });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await MainModel.listCareers(
      { id: req.params.id },
      { task: "one" },
    );
    if (!data) {
      res.status(200).json({
        success: true,
        data: "Dữ liệu không tồn tại",
      });
    }
    res.status(200).json({
      success: true,
      data: data,
    });
  }),
);

router.post(
  "/add",
  asyncHandler(async (req, res, next) => {
    let err = await validateReq(req, res, next);
    if (!err) {
      const data = await MainModel.create(req.body);
      res.status(201).json({
        success: true,
        data: data,
      });
    }
  }),
);

router.put(
  "/edit/:id",
  asyncHandler(async (req, res, next) => {
    let err = await validateReq(req, res, next);
    if (!err) {
      const data = await MainModel.editItem(
        { id: req.params.id, body: req.body },
        { task: "edit" },
      );
      res.status(200).json({
        success: true,
        data: data,
      });
    }
  }),
);

// TODO: Like dislike careers
router.put(
  "/even/:type/:id",
  protect,
  authorize("publisher", "admin"),
  asyncHandler(async (req, res, next) => {
    const data = await MainModel.even({
      id: req.params.id,
      type: req.params.type,
    });
    if (!data) {
      return next(new ErrorResponse(404, "Dữ liệu không tồn tại"));
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  }),
);

router.delete(
  "/delete/:id",
  asyncHandler(async (req, res) => {
    const data = await MainModel.deleteItem(
      { id: req.params.id },
      { task: "one" },
    );
    res.status(200).json({
      success: true,
      data: data,
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

module.exports = router;
