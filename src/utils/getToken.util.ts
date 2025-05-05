import User from "../models/user";
import Security from '../models/cryptograf.js';

const sec: Security = new Security();

export default async function getTokenUtil(req: any, res: any) {
    const { key } = req.headers

    if (typeof key !== "string") {
        return res.status(400).json({sucess: false, message: "Unauthorized"});
    } 

    const keyHashed = sec.secHash(key);

    const user = await User.getUserByRegenerateToken(keyHashed);

    if (user.id === -1) {
        return res.status(403).json({sucess: false, message: "Unauthorized"});
    }

    const acessToken = user.getToken();

    return res.status(200).json({sucess: true, acessToken});
}