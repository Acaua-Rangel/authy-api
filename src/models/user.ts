import Security from "./cryptograf.js";
import connection from '../config/dbConn.js';
import * as crypto from 'crypto';

const sec = new Security();

export default class User {
    id: number;
    email: string;
    passwordHashed: string;
    salt: string;

    constructor(id: number, email: string, passwordHashed: string, salt: string) {
        this.id = id;
        this.email = email;
        this.passwordHashed = passwordHashed;
        this.salt = salt;
    }

    static async init(id: number) {
        const response = await User.getDataById(id);
        return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt)
    }

    static async getDataById(id: number): Promise<any> {
        return new Promise(async(resolve, reject) => {
            connection.query("select * from users where id=? LIMIT 1", [id], async(err: any, rows: any, fields: any) => {
                if (err) {
                    if ("code" in err && err.code === "ER_DUP_ENTRY") {
                      return reject(err);
                    }
                    return reject(err); // Rejeita qualquer outro erro também
                }
                resolve(rows);
                return;
            })
        })
    }

    static async getDataByEmail(key: string): Promise<any> {
        return new Promise(async(resolve, reject) => {
            connection.query("select * from users where login=? LIMIT 1", [key], async(err, rows, fields) => {
                if (err) {
                    if ("code" in err && err.code === "ER_DUP_ENTRY") {
                      return reject(err);
                    }
                    return reject(err); // Rejeita qualquer outro erro também
                }
                resolve(rows);
                return;
            })
        })
    }

    static async getUserByEmail(key: string) {
        const response = await User.getDataByEmail(sec.encrypt(key));
        if (response[0]) {
            return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt);
        }
        return false;
    }

    static async addUser(login: string, hash: string, salt: string) {
        return new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO users (login, password, salt) VALUES (?, ?, ?)", 
                [sec.encrypt(login), hash, salt], 
                (err: any, results: any) => {
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
                (err: any, results: any) => {
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