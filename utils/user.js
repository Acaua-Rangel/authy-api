import Security from "./cryptograf.js";
import connection from '../config/dbConn.js';
import crypto from 'crypto';

const sec = new Security();

export default class User {
    id;
    email;
    passwordHashed;
    salt;

    constructor(id, email, passwordHashed, salt) {
        this.id = id;
        this.email = email;
        this.passwordHashed = passwordHashed;
        this.salt = salt;
    }

    static async init(id) {
        const response = await User.getDataById(id);
        return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt)
    }

    static async getDataById(id) {
        return new Promise(async(resolve, reject) => {
            connection.query("select * from users where id=? LIMIT 1", [id], async(err, rows, fields) => {
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

    static async getDataByEmail(key) {
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

    static async getUserByEmail(key) {
        const response = await User.getDataByEmail(sec.encrypt(key));
        if (response[0]) {
            return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt);
        }
        return false;
    }

    static async addUser(login, hash, salt) {
        return new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO users (login, password, salt) VALUES (?, ?, ?)", 
                [sec.encrypt(login), hash, salt], 
                (err, results) => {
                    if (err) {
                        console.error("Erro ao inserir usuário:", err);
                        reject(err);
                    } else {
                        resolve(new User(results.insertId, login, hash, salt));
                    }
                }
            );
        });
    }

    async getRegenerateToken() {
        const token = crypto.randomBytes(512).toString("hex"); // 512 bytes (1024 caracteres hex)
        //return token;
        return new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO devices (userId, token) VALUES (?, ?)", 
                [this.id, token], 
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(token);
                    }
                }
            );
        });
    }
    
}

//console.log(await User.getUserByEmail("acauarangel17@gmail.com"));