import User from '../models/user.js';
import { QueryError } from 'mysql2';
import Security from '../models/cryptograf.js';

const sec: Security = new Security();

export default async function loginUtil (req: any, res: any) {
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
}