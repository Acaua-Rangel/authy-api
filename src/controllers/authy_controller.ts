import Security from '../models/cryptograf.js';
import User from '../models/user.js';

const sec = new Security();

export default {
    login: async(req: any, res: any) => {
        const {login, password} = req.headers
        if (typeof login !== "string" || typeof password !== "string") {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        if (!login || !password) {
            return res.status(400).json({sucess: false, message: "Not authorized"});
        } 

        const user = await User.getUserByEmail(login);

        if (!user) {
            return res.status(400).json({sucess: false, message: "Unauthorized"});
        }

        const authorized = sec.verifyPassword(password, `${user.salt}:${user.passwordHashed}`)

        if (!authorized) {
            return res.status(500).json({sucess: false});
        }

        const token = await user.getRegenerateToken();
        
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

        let user: any = await User.getUserByEmail(login);

        if (user) {
            return res.status(403).json({sucess: false, message: "Unauthorized"});
        }

        const [salt, hash] = sec.hashPassword(password).split(":");

        user = await User.addUser(login, hash, salt);

        if (!user) {
            return res.status(500).json({sucess: false, message: "Internal Error"});
        } 

        const token = await user.getRegenerateToken();
        
        return res.status(200).json({sucess: true, token});

    }
}