'use strict';

const express = require('express');
const Header = require('./header');
const Footer = require('./footer');
const Menu = require('./menu');

const app = express();

const header = new Header('/header');
const menu = new Menu('/menu');
const footer = new Footer('/footer');

app.use('/header', header.router());
app.use('/menu', menu.router());
app.use('/footer', footer.router());

app.listen(7200, () => {
    console.log(`http://localhost:7200`);
});
