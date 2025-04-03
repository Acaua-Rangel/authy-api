import * as crypto from 'crypto';
import * as aesjs from 'aes-js';
import dotenv from 'dotenv';
dotenv.config({path:'../../.env'});

export default class Security {
    #secretKeyCached: string;
    #ivCached: string;
    #secretKey: Uint8Array;
    #iv: Uint8Array;

    constructor() {
        this.#secretKeyCached = process.env.SECRET_KEY;
        this.#ivCached = process.env.IV;
        console.log(this.#secretKeyCached);
        console.log(this.#ivCached);
        // Converte as chaves do formato HEX para bytes
        this.#secretKey = aesjs.utils.hex.toBytes(this.#secretKeyCached);
        this.#iv = aesjs.utils.hex.toBytes(this.#ivCached);
    }

    // Função para criptografar
    encrypt(text: string) {
        const textBytes = aesjs.utils.utf8.toBytes(text);
        const paddedBytes = aesjs.padding.pkcs7.pad(textBytes);
    
        const aesCbc = new aesjs.ModeOfOperation.cbc(this.#secretKey, this.#iv);
        const encryptedBytes = aesCbc.encrypt(paddedBytes);
    
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    }
    // Função para descriptografar
    decrypt(encryptedHex: string) {
        const encryptedBytes = aesjs.utils.hex.toBytes(encryptedHex);
    
        const aesCbc = new aesjs.ModeOfOperation.cbc(this.#secretKey, this.#iv);
        const decryptedBytes = aesCbc.decrypt(encryptedBytes);
    
        return aesjs.utils.utf8.fromBytes(aesjs.padding.pkcs7.strip(decryptedBytes));
    }

    // Função de criação de hash com sal, no formato SALT:HASH
    hashPassword(password: string) {
        const salt = crypto.randomBytes(16).toString("hex"); // 16 bytes (32 caracteres hex)
        const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    
        return `${salt}:${hash}`;
    }
    
    // Verificação de senha com base em hash com sal
    verifyPassword(password: string, storedHash: string) {
        const [salt, originalHash] = storedHash.split(":");
        const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
    
        return hash === originalHash;
    }
}