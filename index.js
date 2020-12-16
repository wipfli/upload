const express = require('express')
const jwt = require('express-jwt')

const app = express()
app.use(express.json())

app.listen(process.env.PORT, () => {
    console.log('Upload service running on port ' + String(process.env.PORT))
})

const allowedKeys = [
    'gps_longitude',
    'gps_latitude',
    'gps_altitude',
    'gps_speed',
    'gps_heading',
    'gps_satellites',
    'gps_horizontal_dilution',
    'mic_sound_level_1s',
    'bmp_pressure',
    'bmp_temperature',
    'sht_temperature',
    'sht_humidity',
    'tsl_visible',
    'tsl_infrared',
    'lsm_accel_x',
    'lsm_accel_y',
    'lsm_accel_z',
    'lsm_mag_x',
    'lsm_mag_y',
    'lsm_mag_z',
    'vario_altitude',
    'vario_speed',
    'qnh'
]

const savePoint = (point, username) => {

    const key = allowedKeys.find(key => key in point)

    if (key === undefined) {
        return false
    }

    if (!('time' in point)) {
        return false
    }

    if (!('flight_id' in point)) {
        return false
    }

    const influxPoint = {
        measurement: 'ballometer',
        fields: {
            [key]: parseFloat(point[key])
        },
        tags: {
            username: username,
            flight_id: parseFloat(point.flight_id)
        },
        time: point.time
    }

    console.log(influxPoint)

    return true
}

// Assumes a payload of the form
//
// [
//     {
//         time: 'iso format string',
//         sht_temperature: 304.5,
//         flight_id: 1
//     },
//     {
//         time: 'iso format string',
//         sht_humidity: 43.3,
//         flight_id: 1
//     },
//     ...
// ]
// allowed keys for the measurement are stored in allowedKeys
app.post('/:username', jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }), (req, res) => {

    if (req.user.username !== req.params.username) {
        return res.sendStatus(403)
    }

    if (!req.body || !Array.isArray(req.body)) {
        return res.sendStatus(400)
    }

    const successes = req.body.map(point => savePoint(point, req.params.username))

    if (successes.includes(false)) {
        return res.status(200).send('Some points failed')
    }
    else {
        return res.sendStatus(200)
    }
})

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.sendStatus(403)
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.sendStatus(400)
    }
})
