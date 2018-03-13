var unirest = require("unirest");
var superagent = require("superagent");
var cheerio = require("cheerio");

const get_cookie_pp = (data) => {
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

const get_schedule_pp = (cookie) => {
    return new Promise((resolve, reject) => {
        let browserMsg = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;" +
                    "q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Cache-Control": "max-age=0",
            "Connection": "keep-alive",
            "Host": "10.105.1.107",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like " +
                    "Gecko) Chrome/63.0.3239.132 Safari/537.36"
        };
        superagent
            .get(`http://10.105.1.107/psc/CSPRD/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_SCHD_W.GBL?&ICAGTarget=start`)
            .set(browserMsg)
            .set("Cookie", cookie)
            .end((err, response) => {
                if (err) {
                    reject(err);
                }
                let $ = cheerio.load(response.text)
                let course = [];
                // console.log($('#WEEKLY_SCHED_HTMLAREA').html());
                let Entities = require('html-entities').XmlEntities;
                entities = new Entities();
                $('table[id=WEEKLY_SCHED_HTMLAREA]')
                    .children('tbody')
                    .find('tr')
                    .nextAll()
                    .each(function (i, elem) {
                        if (i % 4 == 0) {
                            $(elem)
                                .find('td')
                                .nextAll()
                                .each(function (i1, elem1) {
                                    if ($(elem1).children().html()) {
                                        //  console.log($(elem1).children().html());
                                        let result = $(elem1)
                                            .children()
                                            .html()
                                            .split('<br>');
                                        course.push({
                                            id: result[0],
                                            name: entities.decode(result[1]),
                                            type: result[2],
                                            time: result[3],
                                            room: entities.decode(result[4]),
                                            instructor: entities.decode(result[6]),
                                            date: i1 + 1
                                        });
                                    }
                                });
                        }

                    });
                // console.log($('#WEEKLY_SCHED_HTMLAREA').text());
                // //resolve($('#WEEKLY_SCHED_HTMLAREA').html());
                resolve(course);
            });
    })
}

const get_cookie_bb = (data) => {
    return new Promise((resolve, reject) => {
        let req = unirest("POST", "https://c.zju.edu.cn/webapps/bb-sso-BBLEARN/authValidate/customLoginFromLogin");
        req.headers({
            "Postman-Token": "85626387-041f-828e-b13a-fd1d2c90a488",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://c.zju.edu.cn/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;" +
                    "q=0.8",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like " +
                    "Gecko) Chrome/63.0.3239.132 Safari/537.36",
            "Content-Type": "application/x-www-form-urlencoded",
            "Upgrade-Insecure-Requests": "1",
            "Origin": "https://c.zju.edu.cn",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Host": "c.zju.edu.cn"
        });
        req.form(data);
        req.end(function (res) {
            if (res.error) 
                reject(res.error);
            
            let cookie = res.headers["set-cookie"];
            resolve(cookie);
        });
    })
}

const get_grade_bb = (cookie) => {
    return new Promise((resolve, reject) => {
        let req = unirest("POST", "https://c.zju.edu.cn/webapps/streamViewer/streamViewer");

        req.headers({
            "Postman-Token": "dda8236f-38e1-3e9f-d13d-f79994d80590",
            "Cache-Control": "no-cache",
            "Cookie": cookie,
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Referer": "https://c.zju.edu.cn/webapps/streamViewer/streamViewer?cmd=view&streamName=mygra" +
                    "des&globalNavigation=false",
            "X-Requested-With": "XMLHttpRequest",
            "X-Prototype-Version": "1.7",
            "Accept": "text/javascript, text/html, application/xml, text/xml, */*",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like " +
                    "Gecko) Chrome/63.0.3239.132 Safari/537.36",
            "Origin": "https://c.zju.edu.cn",
            //"Content-Length": "69",
            "Connection": "keep-alive",
            "Host": "c.zju.edu.cn"
        });

        req.form({"cmd": "loadStream", "streamName": "mygrades", "providers": "{}", "forOverview": "false"});

        req.end(function (res) {
            if (res.error) 
                reject(res.error);
            try {
                let arr = JSON.parse(res.body);
                let courselist = arr.sv_extras.sx_filters[0].choices;
                // console.log(arr.sv_extras.sx_filters[0].choices); for (let x in
                // arr.sv_extras.sx_filters[0].choices) {
                // console.log(arr.sv_extras.sx_filters[0].choices[x]); }
                let result = [];
                for (let i in arr.sv_streamEntries) {
                    let grade = arr.sv_streamEntries[i].itemSpecificData.gradeDetails.grade;
                    if (grade !== '-') {
                        let course = courselist[arr.sv_streamEntries[i].se_courseId];
                        result.push({course, grade});
                        // console.log(`课程${course} 的成绩为 ${grade}(total)`);
                    }
                }
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    })
}

const getcourse = async(ctx, next) => {
    try {
        // console.log(ctx.request.body.fields.ZJUid);
        let data_pp = {
            "userid": ctx.state.token.ZJUid,
            "pwd": ctx.state.token.password_bb,
            "ptlangsel": "ENG",
            "Submit": "Login",
            "timezoneOffset": "0"
        }
        let cookie_pp = await get_cookie_pp(data_pp);
        let schedule = await get_schedule_pp(cookie_pp);
        ctx.response.body = schedule;
        ctx.response.type = 'application/json'
        //console.log(ctx.request.body.fields.ZJUid);
    } catch (err) {
        ctx.response.body = err;
    }
}

const fun = async(ctx, next) => {
    try {
        //console.log(ctx.request.body.ZJUid);
        let data_pp = {
            "userid": ctx.request.body.ZJUid,
            "pwd": ctx.request.body.password,
            "ptlangsel": "ENG",
            "Submit": "Login",
            "timezoneOffset": "0"
        }
        let cookie_pp = await get_cookie_pp(data_pp);
        let schedule = await get_schedule_pp(cookie_pp);
        ctx.response.body = `<table cellspacing="0" cellpadding="2" width="100%" class="PSLEVEL1GRIDNBO" id="WEEKLY_SCHED_HTMLAREA"> ${schedule} </table>`;

        let data_bb = {
            "login_uid_unicode": new Buffer(ctx.request.body.ZJUid).toString('base64'),
            "login_pwd_unicode": new Buffer(ctx.request.body.password).toString('base64')
        };

        let cookie_bb = await get_cookie_bb(data_bb);
        let grade = await get_grade_bb(cookie_bb);

        //console.log(grade);

        for (let i in grade) {
            ctx.response.body += `<br>课程${grade[i].course} 的成绩为 ${grade[i].grade}(total)`
        }
    } catch (err) {
        ctx.response.body = err;
    }
};

const render = async(ctx, next) => {
    ctx.response.body = `
        <h1>课表以及成绩查询</h1>
        <form action="/getSchedule" method="post">
            <p>ZJUintlID: <input name="ZJUid" value=""></p>
            <p>Password: <input name="password" type="password"></p>
            <p><input type="submit" value="Submit"></p>
        </form>
        <h1>图书馆借阅查询</h1>
        <form action="/library" method="post">
            <p>ZJUID: <input name="ZJUid" value=""></p>
            <p>Password(默认生日的那个): <input name="password" type="password"></p>
            <p><input type="submit" value="Submit"></p>
        </form>
        <h1>打印系统</h1>
        <form action="/test" method="post">
            <p>ZJUID: <input name="ZJUid" value=""></p>
            <p>Password(默认生日的那个): <input name="password" type="password"></p>
            <p><input type="file" name="file" multiple="multiple"></p>
            <p><input type="submit" value="Submit"></p>
        </form>
        `;
}

module.exports = [
    // {
    //     method: 'get',
    //     path: '/course',
    //     controller: getcourse,
    //     auth: true
    // },
    {
        method: 'post',
        path: '/getSchedule',
        controller: fun
    }, {
        method: 'get',
        path: '/get',
        controller: render
    }
];

// module.exports = {     'POST /course': getcourse,     'POST /getSchedule':
// fun,     'GET /get': render };