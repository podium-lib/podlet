'use strict';

const express = require('express');
const Podlet = require('../../');

const podlet = new Podlet({
    version: `2.0.0-${Date.now().toString()}`,
    name: 'header',
});

const app = express.Router(); // eslint-disable-line new-cap

app.use(podlet.middleware());

app.get(podlet.content(), (req, res) => {
    res.status(200).render('header.content.njk');
});

app.get(podlet.fallback('/fallback'), (req, res) => {
    res.status(200).render('header.content.njk');
});

app.get(podlet.manifest(), (req, res) => {
    res.status(200).json(podlet);
});

app.get('/public', (req, res) => {
    res.status(200).json({
        status: 'OK',
    });
});

app.use('/assets', express.static('assets'));
podlet.css('http://localhost:7200/header/assets/header.css');

module.exports = app;
