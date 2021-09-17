const mongoose = require("mongoose");
const Joi = require("joi");

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  url: {
    type: String,
    required: true,
  },
  subscription: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 10,
  },
  genre: {
    type: String,
    required: true,
  },
});

const Content = mongoose.model("Content", contentSchema);

function validateContent(content) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    type: Joi.string().min(5).max(10).required(),
    url: Joi.string().required(),
    subscription: Joi.string().valid(...["free trial", "basic", "premium"]),
    genre: Joi.string().required(),
  });

  return schema.validate(content);
}
exports.Content = Content;
exports.validate = validateContent;
