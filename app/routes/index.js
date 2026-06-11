var express = require("express");
var router = express.Router();
var { protect, authorize } = require("../middleware/auth");

router.use("/items", require("./items"));
router.use("/careers", require("./careers"));
router.use("/users", protect, authorize("admin"), require("./users"));
router.use("/auth", require("./auth"));

module.exports = router;
