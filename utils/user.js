import Security from "./cryptograf.js";
import connection from '../config/dbConn.js';

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
        const response = await User.getUserById(id);
        return new User(response[0].id, sec.decrypt(response[0].login), response[0].password, response[0].salt)
    }

    static async getUserById(id) {
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

    static async verifyUser(key) {
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

    static async addUser(login, hash, salt) {
        return new Promise((resolve, reject) => {
            connection.query(
                "INSERT INTO users (login, password, salt) VALUES (?, ?, ?)", 
                [login, hash, salt], 
                (err, results) => {
                    if (err) {
                        console.error("Erro ao inserir usuário:", err);
                        reject(err);
                    } else {
                        resolve(new User(results.insertId, sec.decrypt(login), hash, salt));
                    }
                }
            );
        });
    }

    
}