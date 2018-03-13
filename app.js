const Koa = require('koa');
const koaBody = require('koa-body');
const controller = require('./controller');
const config = require('./config');
const session = require('koa-session');
const cors = require('@koa/cors');
const sessionConfig = {
    key: 'laphets:sess',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false
};
let app = new Koa();
app.use(cors());
app.keys = ['laphetsisnowinqsc'];
app.use(session(sessionConfig, app));
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: config.uploadDir,
        keepExtensions: true
    }
}));
app.use(controller());
app.listen(3003);
console.log("The app is listening at 3003")