const path = require('path');
const postgres = require('postgres');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

module.exports = sql;   