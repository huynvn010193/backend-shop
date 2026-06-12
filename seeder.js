const fs = require("fs");
const mongoose = require("mongoose");

const pathConfig = require("./path");
global.__base = __dirname + "/";
global.__path_app = __base + pathConfig.folder_app + "/";

global.__path_configs = __path_app + pathConfig.folder_configs + "/";

const databaseConfig = require(__path_configs + "database");

mongoose.connect(
  `mongodb+srv://${databaseConfig.username}:${databaseConfig.password}@cluster0.amr9jcd.mongodb.net/${databaseConfig.database}`,
);

const ProductSchema = require("./app/schemas/product");
const CategorySchema = require("./app/schemas/category");
const UsersSchema = require("./app/schemas/users");

const Product = JSON.parse(
  fs.readFileSync(`${__dirname}/app/_data/product.json`, "utf-8"),
);

const Category = JSON.parse(
  fs.readFileSync(`${__dirname}/app/_data/category.json`, "utf-8"),
);

const Users = JSON.parse(
  fs.readFileSync(`${__dirname}/app/_data/users.json`, "utf-8"),
);

const importData = async () => {
  try {
    await ProductSchema.create(Product);
    await CategorySchema.create(Category);
    await UsersSchema.create(Users);
    console.log("Data imported successfully");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error);
  }
};

const deleteData = async () => {
  try {
    await ProductSchema.deleteMany({});
    await CategorySchema.deleteMany({});
    await UsersSchema.deleteMany({});
    console.log("Data deleted successfully");
    process.exit();
  } catch (error) {
    console.error("Error deleting data:", error);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
} else {
  console.log("Invalid option. Use -i to import data or -d to delete data.");
  process.exit();
}
