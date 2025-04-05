import dotenv from 'dotenv'
import express from 'express';
//import { exec } from 'child_process';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import authyRouter from './routes/authy.js';
import { authyMiddleware, AuthRequest } from './models/authyMiddleware.js';

const app = express();
dotenv.config({path:'.env'});

const httpPORT = process.env.PORT || 3000;

app.use(express.json());
app.use(compression());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended: false}));

const corsOptions = {
    origin: "*",
    "Access-Control-Allow-Origin": "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
}

async function status (req: any, res: any)  {
    res.status(200).end();
}

app.use(cors(corsOptions));

app.use('/authy', authyRouter);

app.get('/protegido', authyMiddleware, (req: AuthRequest, res) => {
    res.json({ message: 'Você está autenticado!', user: req.user });
});

app.use('/status', status);

http.createServer(app).listen(httpPORT, () => {
    console.log(`API running on port ${httpPORT}`);
});
