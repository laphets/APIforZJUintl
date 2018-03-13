const fs = require('fs');
const checkToken = require('./token').check;

let addMapping = (router, mapping) => {
    for (let k in mapping) {
        let line = mapping[k];
        let auth = line.auth || false;
        if (auth) {
            //line.url line.path
            router.eval(line.method)(line.path, checkToken, line.controller);
        } else {
            router.eval(line.method)(line.path, line.controller);
        }
    }
}

let addControllers = (router, dir) => {
    let files = fs.readdirSync(__dirname + '/' + dir);
    let js_files = files.filter((f) => {
        return f.endsWith('.js');
    });
    for (let f of js_files) {
        console.log(`Process controller: ${f}`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    }
}

module.exports = (dir) => {
    let controller_dir = dir || 'controllers';
    let router = require('koa-router')();
    addControllers(router, controller_dir);
    return router.routes();
}