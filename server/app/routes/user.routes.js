const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const express = require("express");

const router = new express.Router();

router.route("/all").get(controller.allAccess);
router.route("").get([authJwt.verifyToken], controller.userBoard);
router.route("/:id").get([authJwt.verifyToken], controller.userById);

router
  .route("/admin")
  .get([authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

module.exports = router;
