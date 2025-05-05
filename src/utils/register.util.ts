import User from "../models/user";
import Security from '../models/cryptograf.js';

const sec: Security = new Security();

export default async function registerUtil(req: any, res: any) {
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