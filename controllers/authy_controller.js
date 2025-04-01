import connection from '../config/dbConn.js';

import Security from '../utils/cryptograf.js';

const sec = new Security();

async function verifyUser(key) {
    return new Promise(async(resolve, reject) => {
        connection.query("select * from users where login=? LIMIT 1", [key], async(err, rows, fields) => {
            if (err instanceof Error) {
                if (err.code=='ER_DUP_ENTRY') {
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
        if (err) {
            console.log(err);
            return true;
        } else {
            return false;
        }
    });
}

export default {
    login: async(req, res) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        const loginEncrypted = sec.encrypt(login);

        const user = await verifyUser(loginEncrypted);

        console.log(user);

        if (!user[0]) {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        }

        const authorized = sec.verifyPassword(password, `${user[0].salt}:${user[0].password}`)

        if (authorized) {
            return res.status(200).json({sucess: true});
        }

        return res.status(500).json({sucess: false});

    },

    register: async(req, res) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        } 

        const loginEncrypted = sec.encrypt(login);

        const user = await verifyUser(loginEncrypted);

        if (user && user[0]) {
            return res.status(403).json({sucess: false, message: "Unauthorized"});
        }

        const [salt, hash] = sec.hashPassword(password).split(":");

        const sucessfuly = addUser(loginEncrypted, hash, salt);

        if (!sucessfuly) {
            return res.status(200).json({sucess: true, loginEncrypted, hash, salt});

        } 

        return res.status(500).json({sucess: true, message: "Internal Error"});

    }
}