import Security from "./cryptograf.js";
import connection from '../config/dbConn.js';
import * as crypto from 'crypto';
import { QueryError, RowDataPacket } from "mysql2";

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

    static async init(id: number): Promise<User|false> {
        const response = await User.getDataById(id);
        if (response[0]) {
            return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt);
        }
        return false;
    }

    static async getDataById(id: number): Promise<RowDataPacket[]> {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM users WHERE id = ? LIMIT 1",
                [id],
                (err: QueryError | null, rows: RowDataPacket[]) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(rows);
                }
            );
        });
    }

    static async getDataByEmail(key: string): Promise<RowDataPacket[]> {
        return new Promise(async(resolve, reject) => {
            connection.query("select * from users where login=? LIMIT 1", [key], async(err: QueryError, rows: RowDataPacket[], fields) => {
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

    static async getUserByEmail(key: string): Promise<User|false> {
        const response = await User.getDataByEmail(sec.encrypt(key));
        if (response[0]) {
            return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt);
        }
        return false;
    }

    static async addUser(login: string, hash: string, salt: string): Promise<User> {
        return new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO users (login, password, salt) VALUES (?, ?, ?)", 
                [sec.encrypt(login), hash, salt], 
                (err: QueryError, results: any) => {
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

    async getRegenerateToken(): Promise<QueryError|string> {
        const token: string = crypto.randomBytes(512).toString("hex"); // 512 bytes (1024 caracteres hex)
        //return token;
        return new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO devices (userId, token) VALUES (?, ?)", 
                [this.id, token], 
                (err: QueryError, results: any) => {
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