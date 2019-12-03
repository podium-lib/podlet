/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */

'use strict';

const express = require('express');
const Podlet = require('../../');

const app = express();

const podlet = new Podlet({
    pathname: '/',
    fallback: '/fallback',
    version: `2.0.0-${Date.now().toString()}`,
    logger: console,
    name: 'podletContent',
    development: true,
});

podlet.defaults({
    locale: 'nb-NO',
});

app.use(podlet.middleware());

app.get(podlet.content(), (req, res) => {
    const p = res.locals.podium;
    if (p.context.locale === 'nb-NO') {
        res.send(p.render('<h2>Hei verden</h2>'));
        return;
    }
    res.send(p.render('<h2>Hello world</h2>'));
});

app.get(podlet.fallback(), (req, res) => {
    const p = res.locals.podium;
    res.send(p.render('<h2>We are sorry but we can not display this!</h2>'));
});

app.get(podlet.manifest(), (req, res) => {
    res.json(podlet);
});

app.get('/public', (req, res) => {
    res.json({ say: 'Hello world' });
});

podlet.proxy({ target: '/public', name: 'localApi' });
podlet.proxy({ target: 'https://api.ipify.org', name: 'remoteApi' });

podlet.css({ value: '/assets/module.css' });
podlet.js({ value: '/assets/module.js' });

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
