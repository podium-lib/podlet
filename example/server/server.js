'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');

const PORT = 8000;

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
