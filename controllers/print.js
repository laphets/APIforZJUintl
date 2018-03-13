const unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const config = require('../config');

const get_session = () => {
    return new Promise((resolve, reject) => {
        let req = unirest("POST", "http://print.intl.zju.edu.cn/Service.asmx");
        req.headers({"Postman-Token": "062dbbf1-7abb-7e46-2eca-5f37b58d99ea", "Cache-Control": "no-cache", "Content-Type": "text/xml"});
        req.send("<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:soap=\"http://sch" +
                "emas.xmlsoap.org/soap/envelope/\" xmlns:soapenc=\"http://schemas.xmlsoap.org/soa" +
                "p/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=" +
                "\"http://www.w3.org/2001/XMLSchema\" ><soap:Body><InitSession xmlns=\"http://tem" +
                "puri.org/\"><bstrPCName></bstrPCName></InitSession></soap:Body></soap:Envelope>");
        req.end((res) => {
            if (res.error) {
                reject(res.err);
            }
            let $ = cheerio.load(res.body);
            let session = $('InitSessionResult')
                .html()
                .slice(3);
            // console.log(session);
            resolve(session);
        });
    })
}

const login = (session, data) => {
    return new Promise((resolve, reject) => {
        let req = unirest("POST", "http://print.intl.zju.edu.cn/Service.asmx");
        req.headers({"Postman-Token": "56b27564-5e75-61c3-3dea-4cfcd0072d87", "Cache-Control": "no-cache", "Content-Type": "text/xml"});
        req.send(`<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soapenc=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" ><soap:Body><Login xmlns=\"http://tempuri.org/\"><bstrSessionID>${session}</bstrSessionID><bstrUserName>${data.ZJUid}</bstrUserName><bstrPassword>${data.password}</bstrPassword></Login></soap:Body></soap:Envelope>`);
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            // console.log(res.body);
            resolve();
        });
    })
}

const upload = (session, data, option) => {
    return new Promise((resolve, reject) => {
        unirest
            .post(`http://print.intl.zju.edu.cn/upload.aspx?sid=${session}`)
            .headers({'Content-Type': 'multipart/form-data'})
            .field(option) // Form field
            .attach('file', data.path) // Attachment
            .end(function (response) {
                if (response.error) {
                    reject(response.error);
                }
                //console.log(response.body);
                resolve();
            });
    })
}

const clear = (path) => {
    fs.unlink(path, () => {});
}

const main = async(ctx, next) => {
    try {
        let data = {
            ZJUid: ctx.state.token.ZJUid,
            password: ctx.state.token.password_lib,
            path: ctx.request.body.files['file'].path
        };
        //console.log(ctx.request.body.files['file'].path);
        let option = {
            paperid: ctx.request.body.fields.paperid,
            color: ctx.request.body.fields.color,
            double: ctx.request.body.fields.double,
            copies: ctx.request.body.fields.copies
        };
        // console.log(data);
        let session = await get_session();
        await login(session, data);
        await upload(session, data, option);
        //console.log(233);
        ctx.response.body = {
            status: 'success'
        };
        ctx.response.type = 'application/json';
        clear(ctx.request.body.files['file'].path);
    } catch (error) {
        ctx.response.body = {
            status: 'fail'
        };
        ctx.response.type = 'application/json'
        clear(ctx.request.body.files['file'].path);
    }
}

module.exports = [
    {
        method: 'post',
        path: '/print',
        controller: main,
        auth: true
    }
]

// module.exports = {     {     method: 'post',     },     'POST /print': main }