const express = require('express');
require('dotenv').config({path:'../.env'});
var router = express.Router();

const authy_controller = require('../controllers/authy_controller.js');

router
    .post('/login', authy_controller.login)
    .post('/register', authy_controller.register)

module.exports = router;