const fs = require('fs');
const connection = require('../config/dbConn.js');
const usersDir = '/etc/nginx/rtmp_users';
const crypto = require('crypto');
const aes = require('aes-js');

module.exports = {
    status: async(req, res) => {
        res.status(200).end();
    }
}