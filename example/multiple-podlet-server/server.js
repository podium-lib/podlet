'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Header = require('./header');
const Footer = require('./footer');
const Menu = require('./menu');
const Podlet = require('../../');

const podlet = new Podlet({
    pathname: '/',
    version: `2.0.0-${Date.now().toString()}`,
    name: 'podletContent',
});

const app = express();

nunjucks.configure(['./views', podlet.views('njk')], {
    autoescape: true,
    express: app,
});

const header = new Header('/header');
const menu = new Menu('/menu');
const footer = new Footer('/footer');

app.use('/header', header.app);
app.use('/menu', menu.app);
app.use('/footer', footer.app);

app.listen(7200, () => {
    console.log(`http://localhost:7200`);
});
