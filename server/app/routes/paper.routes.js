const { authJwt } = require("../middlewares");
const controller = require("../controllers/paper.controller");
const express = require("express");

const router = new express.Router();

// router.route("/all").get(controller.allAccess);
// router.route("").get([authJwt.verifyToken], controller.userBoard);
router.route("/upload/:id").post(controller.uploadPaper);
router.route("/upload").post(controller.uploadPaperByUrl);

module.exports = router;
