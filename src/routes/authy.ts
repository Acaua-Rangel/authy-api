import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path:'../.env'});
var authyRouter = express.Router();

import authy_controller from '../controllers/authy_controller.js';

authyRouter
    .post('/login', authy_controller.login)
    .post('/register', authy_controller.register)
    .post('/getToken', authy_controller.getToken)

export default authyRouter; 