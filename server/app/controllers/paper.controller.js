const db = require("../models");
const User = db.user;
const Paper = db.paper;
const cloudinary = require("cloudinary");

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
    public_id: result.public_id,
    url: result.secure_url,
  };
  await Paper.create(paper);
  res.status(200).send("Paper Added");
};

exports.uploadPaperByUrl = async (req, res) => {
  const result = await cloudinary.v2.uploader
    .upload(req.body.url, {
      folder: "papers",
    })
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  var paper = {
    public_id: result.public_id,
    url: result.secure_url,
  };
  await Paper.create(paper);
  res.status(200).send({
    username: user.username,
    email: user.email,
    roles: user.roles,
  });
};
