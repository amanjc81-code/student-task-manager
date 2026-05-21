
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
