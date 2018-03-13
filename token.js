const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 

const key = require('./config').key;
const keybb = require('./config').keybb;
const keylib = require('./config').keylib;


const aesEncrypt = (data, keyen) => {
    const cipher = crypto.createCipher('aes-256-cfb', keyen);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

const aesDecrypt = (encrypted, keyde) => {
    const decipher = crypto.createDecipher('aes-256-cfb', keyde);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


const create = (data) => {
    data.password_bb = aesEncrypt(data.password_bb, keybb);
    data.password_lib = aesEncrypt(data.password_lib, keylib);
    const token = jwt.sign(data, key, {expiresIn: '10d'});
    return token;
}

const check = async(ctx, next) => {
    const authorization = ctx.get('Authorization');
    if (authorization === '') {
        ctx.throw(401, `no token detected in http header ' Authorization '`);
    }
    const token = authorization.split(' ')[1];
    let tokenContent;
    try {
        tokenContent = await jwt.verify(token, key);
        tokenContent.password_bb = aesDecrypt(tokenContent.password_bb, keybb);
        tokenContent.password_lib = aesDecrypt(tokenContent.password_lib, keylib);
        ctx.state.token = tokenContent;
        // console.log(tokenContent);
    } catch (error) {
        ctx.throw(401, `invaid token`);
    }
    await next();
}

module.exports = {
    create,
    check
}