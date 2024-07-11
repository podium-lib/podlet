'use strict';

const express = require('express');
const Podlet = require('../..');

class Header {
    constructor(pathname) {
        const podlet = new Podlet({
            pathname,
            fallback: '/fallback',
            version: `2.0.0-${Date.now().toString()}`,
            logger: console,
            name: 'header',
            development: true,
        });

        this.app = express.Router();

        this.app.use(podlet.middleware());

        this.app.get(podlet.content(), (req, res) => {
            res.podiumSend(`<header><h1>Header</h1></header>`);
        });

        this.app.get(podlet.fallback(), (req, res) => {
            res.podiumSend(`<header><h1>Fallback Header</h1></header>`);
        });

        this.app.get(podlet.manifest(), (req, res) => {
            res.status(200).json(podlet);
        });

        this.app.use('/assets', express.static('assets'));
        podlet.css({ value: '/assets/header.css' });
    }

    router() {
        return this.app;
    }
}

module.exports = Header;
