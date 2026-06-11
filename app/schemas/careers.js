const mongoose = require("mongoose");

const databaseConfig = require(__path_configs + "database");

const schema = new mongoose.Schema({
  name: String,
  title: String,
  like: Number,
  dislike: Number,
});

schema.virtual("restaurants", {
  ref: "items",
  localField: "_id",
  foreignField: "careers",
});

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(databaseConfig.col_careers, schema);
