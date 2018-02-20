'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const header = require('./header');
const footer = require('./footer');
const menu = require('./menu');
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

app.use('/header', header);
app.use('/menu', menu);
app.use('/footer', footer);

app.listen(7200, () => {
    console.log(`http://localhost:7200`);
});
