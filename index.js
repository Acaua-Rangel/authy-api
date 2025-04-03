var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import dotenv from 'dotenv';
import express from 'express';
//import { exec } from 'child_process';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import authyRouter from './routes/authy.js';
const app = express();
dotenv.config({ path: '.env' });
const httpPORT = process.env.PORT || 3000;
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
const corsOptions = {
    origin: "*",
    "Access-Control-Allow-Origin": "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
};
function status(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(200).end();
    });
}
app.use(cors(corsOptions));
app.use('/authy', authyRouter);
app.use('/status', status);
http.createServer(app).listen(httpPORT, () => {
    console.log(`API running on port ${httpPORT}`);
});
