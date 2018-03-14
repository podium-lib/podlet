'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');

const podlet = new Podlet({
    version: `2.0.0-${Date.now().toString()}`,
    name: 'podletContent',
});

const app = express();

nunjucks.configure(
    ['./views', podlet.views('njk')],
    { autoescape: true, express: app }
);

app.use(podlet.middleware());

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

app.get('/public', (req, res, next) => {
    res.status(200).json({
        status: 'OK'
    });
});

app.use('/assets', express.static('assets'));
podlet.css('http://localhost:7100/assets/module.css');
podlet.js('http://localhost:7100/assets/module.js');

podlet.proxy('/test', 'http://api.finn.no/');

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
