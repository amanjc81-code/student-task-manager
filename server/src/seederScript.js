
const dotenv = require("dotenv");
const productsData = require("./data/products");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(productsData);
    console.log("Data Import Success");
    process.exit();
  } catch (error) {
    console.error("Error with data import");
    process.exit(1);
  }
};

importData();
