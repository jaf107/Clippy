const db = require("../models");
const User = db.user;
const Paper = db.paper;
const cloudinary = require("cloudinary");
const axios = require("axios");
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/";
exports.uploadPaper = async (req, res) => {
  const result = await cloudinary.v2.uploader
    .upload(req.params.id, {
      folder: "papers",
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => console.log(err));
  var paper = {
    user_id: req.userId,
    public_id: result.public_id,
    url: result.secure_url,
  };
  await Paper.create(paper);
  res.status(200).send("Paper Added");
};

exports.uploadPaperById = async (req, res) => {
  const paper_data = await axios
    .get(
      SEMANTIC_SCHOLAR_API +
        req.body.paper_id +
        "?fields=isOpenAccess,openAccessPdf"
    )
    .catch((err) => res.status(404).send("Paper Not Found"));

  if (paper_data.data) {
    if (!paper_data.data.isOpenAccess || !paper_data.data.openAccessPdf)
      res.status(404).send("Paper Not Accessible");
    else {
      const result = await cloudinary.v2.uploader
        .upload(paper_data.data.openAccessPdf.url, {
          folder: "papers",
        })
        .catch((err) => res.status(500).send(err));

      if (result) {
        var paper = {
          // user_id: req.userId,
          paper_id: req.body.paper_id,
          public_id: result.public_id,
          url: result.secure_url,
        };
        await Paper.create(paper);
        res.status(200).send(paper);
      }
    }
  }
};

// exports.uploadPaperByUrl = async (req, res) => {
//   const result = await cloudinary.v2.uploader
//     .upload(req.body.url, {
//       folder: "papers",
//     })
//     .then((res) => {
//       console.log(res);
//     })
//     .catch((err) => console.log(err));

//   if (result) {
//     var paper = {
//       public_id: result.public_id,
//       url: result.secure_url,
//     };
//     await Paper.create(paper);
//   }
//   res.status(200).send("Paper Added");
// };
