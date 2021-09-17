const { Content, validate } = require("../models/Content");
const { User } = require("../models/User");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { stat, createReadStream } = require("fs");
const { promisify } = require("util");
const fileInfo = promisify(stat);
const { upload } = require("../utils/upload");

const respondWithVideo = async (req, res) => {
  const fileName = `./uploads/${req.params.name}`;
  const { size } = await fileInfo(fileName);
  const range = req.headers.range;

  if (range) {
    let [start, end] = range.replace(/bytes=/, "").split("-");
    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "video/mp4",
    });
    createReadStream(fileName, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": size,
      "Content-Type": "video/mp4",
    });
    createReadStream(fileName).pipe(res);
  }
};

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findById(req.user._id).select("-__v");

    if (!user) return res.status(404).send({ message: "User not found." });

    const content = await Content.find({
      subscription: user.subscription,
    }).select("-__v");

    if (!content) return res.status(404).send({ message: "Content not found" });

    res.send(content);
  }
);

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const user = await User.findById(req.user._id).select("-__v");

    if (!user) return res.status(404).send({ message: "User not found." });

    const content = await Content.findOne({
      _id: req.params.id,
      subscription: user.subscription,
    }).select("-__v");

    if (!content) return res.status(404).send({ message: "Content not found" });
    const token = req.headers.authorization?.split(" ")[1];

    return res.render("content", {
      content,
      token,
    });
  }
);

router.get(
  "/video/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    respondWithVideo(req, res);
  }
);

// TODO: Only admin should be able to add content
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single('video'),
  async (req, res) => {

    const payload = { ...req.body, url: req.file.filename };
    
    const { error } = validate(payload);

    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const contentExists = await Content.findOne({
      title: req.body.title,
    });

    if (contentExists)
      return res.status(400).send({
        message: `Content with title ${req.body.title} already exists`,
      });

    const content = await Content.create(payload);

    res.send(content);
  }
);

module.exports = router;
