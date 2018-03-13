var unirest = require("unirest");
var superagent = require("superagent");
var cheerio = require("cheerio");

const getlogin_url = () => {
    return new Promise((resolve, reject) => {
        let req = unirest("GET", "http://webpac.zju.edu.cn/F");
        req.headers({"Postman-Token": "7afff4aa-ee72-d339-2698-7d6acc8a920a", "Cache-Control": "no-cache"});
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            let $ = cheerio.load(res.body);
            let url = $('#header').find('a')[1].attribs.href;
            resolve(url);
        });
    })
}

const getpost_url = (login_url) => {
    return new Promise((resolve, reject) => {
        let req = unirest("GET", login_url);
        req.query({"func": "bor-info"});
        req.headers({"Postman-Token": "b4bce5f1-45c0-1827-7cc2-f36ec22d5add", "Cache-Control": "no-cache"});
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            let $ = cheerio.load(res.body);
            let post_url = $('form').attr('action');
            resolve(post_url);
        });
    })
}

const get_cookie = (post_url, data) => {
    return new Promise((resolve, reject) => {
        let req = unirest("POST", post_url);
        req.headers({"Postman-Token": "f61ba872-8f34-0ed7-f134-a41fef957b55", "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache"});
        req.form(data);
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            let $ = cheerio.load(res.body);
            let fun_content = $('script[language=Javascript]')[0].children[0].data;
            let cookie = fun_content.slice(fun_content.indexOf("ALEPH"), fun_content.indexOf(";") + 1);
            let personal_url = $('#header').find('a')[1].attribs.href;
            resolve({personal_url, cookie});
        });
    })
}

const getlend_url = (personal_url, cookie) => {
    return new Promise((resolve, reject) => {
        let req = unirest("GET", personal_url);
        req.query({"func": "bor-info"});
        req.headers({"Postman-Token": "db3ca068-2ad7-8cdd-4ebc-3d3db5834822", "Cache-Control": "no-cache", "Cookie": cookie});
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            let $ = cheerio.load(res.body);
            let href = $('td[class=td1]')
                .find('a')
                .attr('href') || '';
            let last = href.slice(href.indexOf("http"), href.indexOf(')') - 1);
            resolve(last);
        });
    })
}

const get_books = (lend_url, cookie) => {
    return new Promise((resolve, reject) => {
        var req = unirest("GET", lend_url);
        req.headers({"Postman-Token": "db3ca068-2ad7-8cdd-4ebc-3d3db5834822", "Cache-Control": "no-cache", "Cookie": cookie});
        req.end((res) => {
            if (res.error) {
                reject(res.error);
            }
            // let $ = cheerio.load(res.body); console.log(res.body); let books =
            // $('div[class=divwline]')     .prev()     .html(); // console.log(books);
            // resolve(books);
            let head = [];
            let trans = [
                'id',
                '',
                'author',
                'name',
                'publishyear',
                'returndate',
                'fine',
                'branch',
                'callnumber'
            ];
            let books = [];
            let $ = cheerio.load(res.body);
            $('div[class=divwline]')
                .prev()
                .children()
                .children()
                .each(function (i, elem) {
                    if ($(elem).is('script')) {
                        return;
                    }
                    if (i == 0) {
                        //first line
                        $(elem)
                            .children()
                            .each(function (i1, elem1) {
                                // console.log($(elem1).text());
                                let cur = $(elem1)
                                    .text()
                                    .replace(/[ ]/g, "")
                                    .replace(/[\n]/g, "");
                                if (cur) {
                                    head.push(cur);
                                }
                            });
                    } else {
                        let onebook = {};
                        $(elem)
                            .children()
                            .each(function (i1, elem1) {
                                let cur = $(elem1)
                                    .text()
                                    .replace(/[ ]/g, " ")
                                    .replace(/[\n]/g, " ").replace(/[/]/g, " ");
                                if (cur) {
                                    onebook[trans[i1]] = cur;
                                }
                            });
                        // console.log(onebook);
                        books.push(onebook);
                    }
                });
            //console.log(books);
            resolve(books);
        });
    })
}

const main = async (ctx, next) => {
    try {
        let data = {
            "func": "login-session",
            "login_source": "bor-info",
            "bor_id": ctx.state.token.ZJUid,
            "bor_verification": ctx.state.token.password_lib,
            "bor_library": "ZJU50"
        }
        let login_url = await getlogin_url();
        let post_url = await getpost_url(login_url);
        let {personal_url, cookie} = await get_cookie(post_url, data);
        let lend_url = await getlend_url(personal_url, cookie);
        let books = await get_books(lend_url, cookie);
        if (books.length == 0) {
            ctx.response.body = '在借书目为空';
        } else {
            ctx.response.body = books;
        }
    } catch (err) {
        ctx.response.body = err;
    }
}

module.exports = [
    {
        method: 'get',
        path: '/library',
        controller: main,
        auth: true
    }
];