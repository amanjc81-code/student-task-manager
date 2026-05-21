const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

connectDB();

module.exports = app;
