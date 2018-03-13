const jwt = require('jsonwebtoken');
const crypto = require('crypto'); //加载crypto库

const aesEncrypt = (data, key) => {
    const cipher = crypto.createCipher('aes-256-cfb', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

const aesDecrypt = (encrypted, key) => {
    const decipher = crypto.createDecipher('aes-256-cfb', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const create = (ZJUid, password) => {
    const token = jwt.sign({
        ZJUid: ZJUid,
        password: aesEncrypt(password, 'laphetspass')
    }, 'laphets233', {expiresIn: '24h'});
    return token;
}

const check = async(token) => {
    try {
        tokenContent = await jwt.verify(token, 'laphets233');
        tokenContent.password = aesDecrypt(tokenContent.password, 'laphetspass');
        console.log(tokenContent);
    } catch (error) {
        ctx.throw(401, `invaid token`);
    }
}

console.log(check(create('3170111705', 'asdfghjkl')));