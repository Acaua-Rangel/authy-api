const express = require('express');
require('dotenv').config({path:'../.env'});
var router = express.Router();

const authy_controller = require('../controllers/authy_controller.js');

router
    .get('/status', authy_controller.status)

module.exports = router;