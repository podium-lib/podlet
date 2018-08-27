'use strict';

const express = require('express');
const Podlet = require('../../');

class Header {
    constructor(pathname) {
        const podlet = new Podlet({
            defaults: true,
            pathname: pathname,
            fallback: '/fallback',
            version: `2.0.0-${Date.now().toString()}`,
            logger: console,
            name: 'header',
        });

        this.app = express.Router(); // eslint-disable-line new-cap

        this.app.use(podlet.middleware());

        this.app.get(podlet.content(), (req, res) => {
            res.status(200).render('header.content.njk');
        });

        this.app.get(podlet.fallback(), (req, res) => {
            res.status(200).render('header.fallback.njk');
        });

        this.app.get(podlet.manifest(), (req, res) => {
            res.status(200).json(podlet);
        });

        this.app.use('/assets', express.static('assets'));
        podlet.css({ value: '/assets/header.css' });
    }
}

module.exports = Header;
