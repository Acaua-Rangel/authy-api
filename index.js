require('dotenv').config({path:'.env'});
const express = require('express');
//const { exec } = require('child_process');
const compression = require('compression');
const cors = require('cors');
const bodyParser =  require('body-parser');
const http = require('http');
//const session = require('express-session');
var authyRouter = require('./routes/authy.js');

const app = express();

const httpPORT = process.env.PORT || 3000;

app.use(express.json());
app.use(compression());
app.use(express.urlencoded({extended:true}));
//app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({extended: false}));

const corsOptions = {
    origin: "*",
    "Access-Control-Allow-Origin": "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
}

app.use(cors(corsOptions));

app.use('/authy', authyRouter);

http.createServer(app).listen(httpPORT, () => {
    console.log(`API running on port ${httpPORT}`);
});
