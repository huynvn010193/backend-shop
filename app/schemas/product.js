const mongoose = require("mongoose");
const { Schema } = mongoose;

const databaseConfig = require(__path_configs + "database");

const schema = new mongoose.Schema({
  name: String,
  category: {
    id: {
      type: Schema.Types.String,
      ref: "category",
      required: true,
    },
    name: String,
  },
  price: Number,
  price_old: Number,
  description: String,
  like: Number,
  special: Boolean,
  brand: String,
  color: [String],
  size: [String],
});

module.exports = mongoose.model(databaseConfig.col_product, schema);
