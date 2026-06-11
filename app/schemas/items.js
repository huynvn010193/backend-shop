const mongoose = require("mongoose");
const { Schema } = mongoose;

const databaseConfig = require(__path_configs + "database");

const schema = new mongoose.Schema({
  name: String,
  description: String,
  careers: [{ type: Schema.Types.ObjectId, ref: "careers", required: true }],
  type: [String],
  local: [String],
  web: String,
  address: String,
  phone: Number,
  email: String,
});

module.exports = mongoose.model(databaseConfig.col_items, schema);
