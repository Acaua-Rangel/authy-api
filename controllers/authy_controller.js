const fs = require('fs');
const connection = require('../config/dbConn.js');
const crypto = require('crypto');
const aesjs = require('aes-js');

// Converte as chaves do formato HEX para bytes
const secretKey = aesjs.utils.hex.toBytes(process.env.SECRET_KEY);
const iv = aesjs.utils.hex.toBytes(process.env.IV);

class User {
    constructor(login, password) {
        this.login = login;
        this.password = password;
    }
}

// Função para criptografar
function encrypt(text) {
    const textBytes = aesjs.utils.utf8.toBytes(text);
    const paddedBytes = aesjs.padding.pkcs7.pad(textBytes);

    const aesCbc = new aesjs.ModeOfOperation.cbc(secretKey, iv);
    const encryptedBytes = aesCbc.encrypt(paddedBytes);

    return aesjs.utils.hex.fromBytes(encryptedBytes);
}

// Função para descriptografar
function decrypt(encryptedHex) {
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);

    const aesCbc = new aesjs.ModeOfOperation.cbc(secretKey, iv);
    const decryptedBytes = aesCbc.decrypt(encryptedBytes);

    return aesjs.utils.utf8.fromBytes(aesjs.padding.pkcs7.strip(decryptedBytes));
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex"); // 16 bytes (32 caracteres hex)
    const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");

    return `${salt}:${hash}`; // Retorna no formato SALT:HASH
}

function verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");

    return hash === originalHash;
}

async function verifyUser(key) {
    return new Promise(async(resolve, reject) => {
        connection.query("select * from users where login=? LIMIT 1", [key], async(err, rows, fields) => {
            if (err instanceof Error) {
                if (err.code=='ER_DUP_ENTRY') {
                    console.log(err);
                    reject(err);
                    return;

                } 

            }
            resolve(rows);
            return;
        })
    })
}

function addUser(login, hash, salt) {
    connection.query("INSERT INTO users (login, password, salt) VALUES (?, ?, ?)", [login, hash, salt], (err, results) => {
        console.log(results);
        if (err) {
            console.log(err);
            return true;
        } else {
            return false;
        }
    });
}

module.exports = {
    login: async(req, res) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        const loginEncrypted = encrypt(login);

        console.log(loginEncrypted);

        return res.status(200).json({sucess: true, login, password});
    },

    register: async(req, res) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        } 

        const loginEncrypted = encrypt(login);

        const user = await verifyUser(loginEncrypted);

        if (user && user[0]) {
            return res.status(403).json({sucess: false, message: "Unauthorized"});
        }

        const [salt, hash] = hashPassword(password).split(":");

        const sucessfuly = addUser(loginEncrypted, hash, salt);

        if (!sucessfuly) {
            return res.status(200).json({sucess: true, loginEncrypted, hash, salt});

        } 

        return res.status(500).json({sucess: true, message: "Internal Error"});

    }
}