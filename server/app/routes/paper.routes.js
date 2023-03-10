const { authJwt } = require("../middlewares");
const controller = require("../controllers/paper.controller");
const express = require("express");
const multer = require("multer");
const app = express();
const router = new express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });
router.use(express.static(__dirname + "./uploads/"));

// router.route("/all").get(controller.allAccess);
// router.route("").get([authJwt.verifyToken], controller.userBoard);
router
  .route("/upload")
  .post(authJwt.checkToken, upload.single("paper"), controller.uploadPaper);
router
  .route("/uploadById")
  .post(authJwt.checkToken, controller.uploadPaperById);
router
  .route("/:id/semanticScholar")
  .get(controller.getPaperDetailsfromSemanticScholar);
router.route("/:id/citations").get(controller.getCitation);
router
  .route("/:id/abstractiveSummary")
  .post(controller.getAbstractSummary);
router
  .route("/:id/extractiveSummary")
  .post(controller.getExtractSummary);
router.route("/searchByTitle").post(controller.searchPaperByTitle);
router.route("/getPdf").post(controller.getPdf);
router.route("/:id").get(authJwt.checkToken, controller.getPaperDetails);

module.exports = router;
