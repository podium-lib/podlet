'use strict';

const express = require('express');
const Podlet = require('../../');
const Proxy = require('@podium/proxy');

const app = express();

const podlet = new Podlet({
    pathname: '/',
    fallback: '/fallback',
    version: `2.0.0-${Date.now().toString()}`,
    logger: console,
    name: 'podletContent',
    dev: true,
});

podlet.defaults({
    locale: 'nb-NO',
});

const proxy = new Proxy({
    logger: console,
});

app.use(podlet.middleware());
app.use(proxy.middleware());

app.get(podlet.content(), (req, res) => {
    if (res.locals.podium.context.locale === 'nb-NO') {
        res.podiumSend('<h2>Hei verden</h2>');
        return;
    }
    res.podiumSend('<h2>Hello world</h2>');
});

app.get(podlet.fallback(), (req, res) => {
    res.podiumSend('<h2>We are sorry but we can not display this!</h2>');
});

app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

app.get(podlet.proxy('/public', 'localApi'), (req, res) => {
    if (res.locals.podium.context.locale === 'nb-NO') {
        res.json({ say: 'Hei verden' });
        return;
    }
    res.json({ say: 'Hello world' });
});

app.use('/assets', express.static('assets'));
podlet.css({ value: '/assets/module.css' });
podlet.js({ value: '/assets/module.js' });

podlet.proxy('https://api.ipify.org', 'remoteApi');

proxy.register(podlet);

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
