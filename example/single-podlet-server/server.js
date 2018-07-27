'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');
const Proxy = require('@podium/proxy');

const app = express();

const podlet = new Podlet({
    version: `2.0.0-${Date.now().toString()}`,
    name: 'podletContent',
    logger: console,
    defaults: true,
});

podlet.defaults({
    locale: 'nb-NO'
});

const proxy = new Proxy({
    logger: console,
});

nunjucks.configure(['./views', podlet.views('njk')], {
    autoescape: true,
    express: app,
});

app.use(podlet.middleware());
app.use(proxy.middleware());

app.get(podlet.content(), (req, res, next) => {
    if (res.locals.podium.context.locale === 'nb-NO') {
        res.status(200).render('content.no.njk');
        return;
    }
    res.status(200).render('content.en.njk');
});

app.get(podlet.fallback('/fallback'), (req, res, next) => {
    res.status(200).render('fallback.njk');
});

app.get(podlet.manifest(), (req, res, next) => {
    res.status(200).json(podlet);
});

app.get(podlet.proxy('/public', 'localApi'), (req, res, next) => {
    if (res.locals.podium.context.locale === 'nb-NO') {
        res.status(200).json({ say: 'hei verden' });
        return;
    }
    res.status(200).json({ say: 'hello world' });
});

app.use('/assets', express.static('assets'));
podlet.css('http://localhost:7100/assets/module.css');
podlet.js('http://localhost:7100/assets/module.js');

podlet.proxy('https://api.ipify.org', 'remoteApi');

proxy.register(podlet);

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
