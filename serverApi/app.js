const express = require("express");
const app = express();
const mongoose = require("mongoose");

const weatherRoutes = require('./api/routes/weather');
const config = require('./config');

//connect to database
mongoose.connect(
    `mongodb+srv://krishnavamshi:${config.MONGO.PASSWORD}@weatherapp.s3k16.mongodb.net/${config.MONGO.DB_USER}?retryWrites=true&w=majority`,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
)

const connection = mongoose.connection;

connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
    console.log("Server is running");
});

connection.on('error', console.error.bind(console, 'connection error:'));

//For Cors requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use("/Weather", weatherRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;