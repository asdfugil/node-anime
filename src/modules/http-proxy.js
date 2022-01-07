import express from 'express'
import proxy from 'express-http-proxy'
import { randomBytes } from 'crypto'

const USERAGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36";

export function createProxy() {
    const token = randomBytes(64).toString('hex');
    const app = express();
    let url;
    app.use((req,res,next) => {
        if (req.query.token !== token) return res.status(401).end();
        if (!req.query.url?.startsWith('http')) return res.status(400).end()
        url = req.query.url
        next()
    })
    app.get('/proxy', (req,res,next) => {
         proxy(req.query.url, {
             proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
                 proxyReqOpts.headers['Referer'] = 'http://example.com';
                 proxyReqOpts.headers['User-Agent'] = USERAGENT
                 return proxyReqOpts
             }
         })(req,res,next)
    });
    const server = app.listen(0,'127.0.0.1')
    return { server, token }
}
