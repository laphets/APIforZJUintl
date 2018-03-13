var unirest = require("unirest");
var fs = require('fs');

const exportcsv = async(ctx, next) => {
    var req = unirest("POST", "https://joinus.zjuqsc.com/apiNew/admin/get_admin_details");
    const Json2csvParser = require('json2csv').Parser;

    req.headers({"Postman-Token": "23059e80-2935-f8bc-e9d7-b6133e17c523", "Cache-Control": "no-cache", "Content-Type": "application/json", "x-content-fish": "NongfuDrinkSpring@recruit"});

    req.type("json");
    req.send({"form_url": "8A670D5F688F3A5F", "offset": 1000});

    req.end(function (res) {
        if (res.error) 
            throw new Error(res.error);
        
        // console.log(res.body);
        const fields = [
            'name',
            'stuid',
            'major',
            'grade',
            'gender',
            'mobile',
            'mail',
            'inclination_one',
            'inclination_two',
            'self_intro',
            'question_one',
            'qiestion_two',
            'create_time'
        ];
        const data = res.body.info;
        // console.log(data);
        const json2csvParser = new Json2csvParser({fields});
        const csv = json2csvParser.parse(data);
        ctx.body = csv;
        // console.log(csv);
    });

}

const test = async(ctx, next) => {
    console.log('233');
    ctx.response.body = '1232';
}

module.exports = [
    {
        method: 'get',
        path: '/export',
        controller: exportcsv
    }, {
        method: 'get',
        path: '/test',
        controller: test
    }
]