import connection from '../config/dbConn.js';
import Security from '../utils/cryptograf.js';
import User from '../utils/user.js';

const sec = new Security();

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

        const user = await User.verifyUser(loginEncrypted);

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

        const user = await User.verifyUser(loginEncrypted);

        if (user && user[0]) {
            return res.status(403).json({sucess: false, message: "Unauthorized"});
        }

        const [salt, hash] = sec.hashPassword(password).split(":");

        const sucessfuly = await User.addUser(loginEncrypted, hash, salt);

        if (!sucessfuly) {
            return res.status(500).json({sucess: false, message: "Internal Error"});
        } 
        
        return res.status(200).json({sucess: true, sucessfuly});

    }
}