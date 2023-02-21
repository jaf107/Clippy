const db = require("../models");
const User = db.user;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.userById = async (req, res) => {
  var user = await User.findById(req.params.id).populate("roles", "-__v");
  console.log(req.params.id);
  res.status(200).send({
    username: user.username,
    email: user.email,
    roles: user.roles,
  });
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
