/* eslint-disable import/no-extraneous-dependencies */

'use strict';

const express = require('express');
const Podlet = require("../..");

class Menu {
    constructor(pathname) {
        const podlet = new Podlet({
            pathname,
            fallback: '/fallback',
            version: `2.0.0-${Date.now().toString()}`,
            logger: console,
            name: 'menu',
            development: true,
        });

        this.app = express.Router(); // eslint-disable-line new-cap

        this.app.use(podlet.middleware());

        this.app.get(podlet.content(), (req, res) => {
            const ctx = res.locals.podium.context;
            res.podiumSend(`<menu>
                <ul>
                    <li><a href="${ctx.mountOrigin}${ctx.mountPathname}/section_1/">Menu 1</a></li>
                    <li><a href="${ctx.mountOrigin}${ctx.mountPathname}/section_2/">Menu 2</a></li>
                    <li><a href="${ctx.mountOrigin}${ctx.mountPathname}/section_3/">Menu 3</a></li>
                    <li><a href="${ctx.mountOrigin}${ctx.mountPathname}/section_4/">Menu 4</a></li>
                    <li><a href="${ctx.mountOrigin}${ctx.mountPathname}/section_5/">Menu 5</a></li>
                    <li><a href="${ctx.mountOrigin}${ctx.mountPathname}/section_6/">Menu 6</a></li>
                </ul>
            </menu>`);
        });

        this.app.get(podlet.fallback(), (req, res) => {
            res.podiumSend(`<menu>
                <ul>
                    <li>Fallback Menu 1</li>
                    <li>Fallback Menu 2</li>
                    <li>Fallback Menu 3</li>
                    <li>Fallback Menu 4</li>
                    <li>Fallback Menu 5</li>
                    <li>Fallback Menu 6</li>
                    <li>Fallback Menu 7</li>
                </ul>
            </menu>`);
        });

        this.app.get(podlet.manifest(), (req, res) => {
            res.status(200).json(podlet);
        });

        this.app.use('/assets', express.static('assets'));
        podlet.css({ value: '/assets/menu.css' });
    }

    router() {
        return this.app;
    }
}

module.exports = Menu;
