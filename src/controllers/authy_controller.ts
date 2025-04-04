import { QueryError } from 'mysql2';
import Security from '../models/cryptograf.js';
import User from '../models/user.js';

const sec: Security = new Security();

export default {
    login: async(req: any, res: any) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        const user: boolean | User = await User.getUserByEmail(login);

        if (!user) {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        }

        const authorized: boolean = sec.verifyPassword(password, `${user.salt}:${user.passwordHashed}`)

        if (!authorized) {
            return res.status(500).json({sucess: false});
        }

        const token: string | QueryError = await user.getRegenerateToken();

        if (typeof token !== "string") {
            return res.status(500).json({sucess: false});
        }
        
        return res.status(200).json({sucess: true, token});

    },

    register: async(req: any, res: any) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        } 

        let user: User | false = await User.getUserByEmail(login);

        if (user) {
            return res.status(403).json({sucess: false, message: "Unauthorized"});
        }

        const [salt, hash] = sec.hashPassword(password).split(":");

        let ur: User = await User.addUser(login, hash, salt);

        if (!ur) {
            return res.status(500).json({sucess: false, message: "Internal Error"});
        } 

        const token = await ur.getRegenerateToken();

        if (!token) {
            return res.status(500).json({sucess: false, message: "Internal Error"});
        }
        
        return res.status(200).json({sucess: true, token});

    }
}