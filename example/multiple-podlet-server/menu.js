'use strict';

const nunjucks = require('nunjucks');
const express = require('express');
const Podlet = require('../../');

const podlet = new Podlet({
    version: `2.0.0-${Date.now().toString()}`,
    name: 'header',
});

const app = express.Router();

app.use(podlet.middleware());

app.get(podlet.content(), (req, res, next) => {
    res.status(200).render('menu.content.njk');
});

app.get(podlet.fallback('/fallback'), (req, res, next) => {
    res.status(200).render('menu.content.njk');
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
podlet.css('http://localhost:7200/menu/assets/menu.css');

module.exports = app;
