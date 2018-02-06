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
    ['./views', podlet.views()],
    { autoescape: true, express: app }
);

app.use(podlet.middleware());
app.use(podlet.router());

app.get('/', (req, res, next) => {
    res.status(200).render('content.njk');
});

app.get('/fallback', (req, res, next) => {
    res.status(200).render('fallback.njk');
});

app.use('/assets', express.static('public'));

app.listen(7100, () => {
    console.log(`http://localhost:7100`);
});
