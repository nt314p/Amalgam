const mongoose = require('mongoose');
const app = require("./app");
require('dotenv').config();

const uri = process.env.DB_URI;
const PORT = process.env.PORT || 4000;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log("Database is connected"))
    .catch(error => console.log("Cannot connect to database: " + error));

app.listen(PORT, console.log('Server is running on port:', PORT));