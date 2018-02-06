'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');

const PORT = 8000;
const VERSION = `2.0.0-${Date.now().toString()}`;

const podlet = new Podlet({
    version: VERSION,
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
    res.status(200).render('content.njk', {
        body: res.podium.template
    });
});

app.get('/fallback', (req, res, next) => {
    res.status(200).render('fallback.njk', {
        body: res.podium.template
    });
});

app.use('/assets', express.static('public'));

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
