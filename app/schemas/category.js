const mongoose = require("mongoose");

const databaseConfig = require(__path_configs + "database");

const schema = new mongoose.Schema({
  name: String,
  title: String,
  splug: String,
});

schema.virtual("product", {
  ref: "product",
  localField: "_id",
  foreignField: "category.id",
});

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(databaseConfig.col_category, schema);
