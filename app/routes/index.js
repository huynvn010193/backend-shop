var express = require("express");
var router = express.Router();
var { protect, authorize } = require("../middleware/auth");

router.use("/product", require("./product"));
router.use("/category", require("./category"));
router.use("/users", protect, authorize("admin"), require("./users"));
router.use("/auth", require("./auth"));

module.exports = router;
