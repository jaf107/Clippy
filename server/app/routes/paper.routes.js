const { authJwt } = require("../middlewares");
const controller = require("../controllers/paper.controller");
const express = require("express");

const router = new express.Router();

// router.route("/all").get(controller.allAccess);
// router.route("").get([authJwt.verifyToken], controller.userBoard);
router.route("/uploadById").post(controller.searchPaperById);
// router.route("/upload").post(controller.uploadPaperByUrl);
router.route("/:id/citations").get(controller.getCitation);
router.route("/searchByTitle").get(controller.searchPaperByTitle);

module.exports = router;
