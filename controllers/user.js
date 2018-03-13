const createToken = require('../token').create;
const unirest = require("unirest");
const cheerio = require("cheerio");
const fs = require("fs");
const config = require('../config');
const Usermodel = require('../model/user');

const verify_pp = (data) => {
    return new Promise((resolve, reject) => {
        var req = unirest("POST", "http://10.105.1.107/CSPRD/ZjuSSOAuth001.jsp");
        req.headers({
            "Postman-Token": "b5f9d7dd-ef66-9a31-9199-9350cbf2c05a",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;" +
                    "q=0.8",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like " +
                    "Gecko) Chrome/63.0.3239.132 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
            "Upgrade-Insecure-Requests": "1",
            "Origin": "http://10.105.1.107",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Host": "10.105.1.107"
        });
        req.form(data);
        req.end(function (res) {
            if (res.error) 
                reject(res.error);
            let cookie = res.headers["set-cookie"];
            // console.log(cookie);
            resolve(cookie);
        });
    })
}


const get_session_print = () => {
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

const verify_print = (session, data) => {
    return new Promise((resolve, reject) => {
        let req = unirest("POST", "http://print.intl.zju.edu.cn/Service.asmx");
        req.headers({"Postman-Token": "56b27564-5e75-61c3-3dea-4cfcd0072d87", "Cache-Control": "no-cache", "Content-Type": "text/xml"});
        req.send(`<?xml version=\"1.0\" encoding=\"utf-8\"?><soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:soapenc=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" ><soap:Body><Login xmlns=\"http://tempuri.org/\"><bstrSessionID>${session}</bstrSessionID><bstrUserName>${data.ZJUid}</bstrUserName><bstrPassword>${data.password}</bstrPassword></Login></soap:Body></soap:Envelope>`);
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            let $ = cheerio.load(res.body);
            if ($('LoginResult').text() === 'fail,') {
                resolve('wrong');
            } else {
                let username = $('LoginResult').text().split('%#')[7];
                resolve(username);
            }
        });
    })
}




const login = async(ctx, next) => {
    let ZJUid = ctx.request.body.fields.ZJUid;
    let password_bb = ctx.request.body.fields.password_bb;
    let password_lib = ctx.request.body.fields.password_lib;


    let data_pp = {
        "userid": ZJUid,
        "pwd": password_bb,
        "ptlangsel": "ENG",
        "Submit": "Login",
        "timezoneOffset": "0"
    }
    let verify1_cookie = await verify_pp(data_pp);
    if (verify1_cookie.length === 2) {
        ctx.response.body = {
            status: "fail",
            wrong: 1
        }
    } else {
        let data_print = {
                ZJUid: ZJUid,
                password: password_lib,
            };
        let session_print = await get_session_print();
        let result = await verify_print(session_print, data_print);
        if (result === 'wrong') {
            ctx.response.body = {
                status: "fail",
                wrong: 2
            }
        } else {
            //Success
            let token = createToken({ZJUid: ZJUid, password_bb: password_bb, password_lib: password_lib});
            ctx.response.body = {
                status: "success",
                username: result,
                token,
            };
            try {
                if (!(await Usermodel.finduserByZJUid(ZJUid)).length) {
                    await Usermodel.register(ZJUid);
                    // console.log('233');
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}

module.exports = [
    {
        method: 'post',
        path: '/login',
        controller: login
    }
]