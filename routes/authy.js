import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path:'../.env'});
var router = express.Router();

import authy_controller from '../controllers/authy_controller.js';

export default router
    .post('/login', authy_controller.login)
    .post('/register', authy_controller.register)