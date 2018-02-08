'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');

const podlet = new Podlet({
    version: `2.0.0-${Date.now().toString()}`,
    name: 'my-app',
});

const app = express();

nunjucks.configure(
    ['./views', podlet.views('njk')],
    { autoescape: true, express: app }
);

app.use(podlet.middleware());

app.get(podlet.content(), (req, res, next) => {
    res.status(200).render('content.njk');
});

app.get(podlet.fallback('/fallback'), (req, res, next) => {
    res.status(200).render('fallback.njk');
});

app.get(podlet.manifest(), (req, res, next) => {
    res.status(200).json(podlet);
});

app.use('/assets', express.static('public'));
podlet.css('/assets/module.css');
podlet.js('/assets/module.js');

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
