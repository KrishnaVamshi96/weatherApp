const mongoose = require('mongoose');

//Schema
const weatherSchema = mongoose.Schema({
    name: { type: String, required: true },
    created: { type: Date, required: true },
    clouds: { type: Object },
    temp: { type: Number },
    tempMin: { type: Number },
    tempMax: { type: Number },
    humidity: { type: Number },
    rain: { type: Boolean }
});

module.exports = mongoose.model('weather', weatherSchema);