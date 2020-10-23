const request = require('request');
const config = require('../../config');
const weatherModel = require('../models/weather');

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

const cleanUpOldData = () => {
    return weatherModel.deleteMany({ created: { $lt: today } })
        .then((data) => { })
        .catch((error) => {
            console.log('error in deleting old datd in database', error);
        })
}

exports.getWeather = async (req, res, next) => {

    //return error message when city name is missing
    if (!req.query.city) {
        return res.status(500).json({
            message: 'Missing city name.'
        })
    }

    //cleanup old data async, as weather changes every day
    cleanUpOldData();

    //check in db if data exists
    let cityWeather = await weatherModel.find({ created: { $gte: today }, name: req.query.city })
        .exec()
        .catch((error) => {
            return res.status(500).json({
                message: error
            })
        })
    if (cityWeather && cityWeather.length > 0) {
        return res.status(200).json({
            data: cityWeather[0]
        });
    }
    else {

        //form url to call weather api
        let url = `${config.API_URL}${req.query.city}&APPID=${config.APP_ID}&units=metric`;

        //make request to openwhetherapi
        request(url, (error, response, body) => {
            if (error) {
                return res.status(response.statusCode).json({
                    message: error
                })
            }

            //convert string body to Json
            body = JSON.parse(body);

            //when city name is not found 
            if (body.cod == '404') {
                return res.status(404).json({
                    message: body.message
                })
            }

            //prepare response object
            let responseObj = {
                'name': req.query.city,
                'created': new Date(),
                'temp': body.hasOwnProperty('main') && body.main.hasOwnProperty('temp') ? body.main.temp : 0,
                'tempMin': body.hasOwnProperty('main') && body.main.hasOwnProperty('temp_min') ? body.main.temp_min : 0,
                'tempMax': body.hasOwnProperty('main') && body.main.hasOwnProperty('temp_max') ? body.main.temp_max : 0,
                'humidity': body.hasOwnProperty('main') && body.main.hasOwnProperty('humidity') ? body.main.humidity : 0,
                'rain': body.hasOwnProperty('rain') ? true : false,
                'clouds': body.hasOwnProperty('clouds') && body.clouds.hasOwnProperty('all') ? body.clouds.all : 0
            };

            //Insert into db
            weatherModel.create(responseObj)
                .then((data) => { })
                .catch((error) => {
                    console.log('error in inserting into database', error);
                })
            //return data from api
            return res.status(200).json({
                data: responseObj
            });
        })
    }
}