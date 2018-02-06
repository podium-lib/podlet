'use strict';

const Context = require('@podium/context');
const schemas = require('@podium/schemas');
const express = require('express');
const path = require('path');
const Joi = require('joi');

const _template = Symbol('_template');
const _manifest = Symbol('_manifest');
const _version = Symbol('_version');

const PodiumClient = class PodiumClient {
    constructor(options = {}) {

        Object.defineProperty(this, 'name', {
            value: options.name
        });

        Object.defineProperty(this, 'version', {
            value: options.version
        });

        Object.defineProperty(this, 'templateType', {
            value: 'njk',
            writable: true,
        });

        Object.defineProperty(this, 'css', {
            value: options.css || '/assets/module.css',
        });

        Object.defineProperty(this, 'js', {
            value: options.js || '/assets/module.js',
        });

        Object.defineProperty(this, 'content', {
            value: options.content || '/',
        });

        Object.defineProperty(this, 'fallback', {
            value: options.content || '/fallback',
        });

        Object.defineProperty(this, 'chain', {
            value: []
        });

        Object.defineProperty(this, 'app', {
            value: express.Router(),
        });
        this.app.get('/manifest.json', this[_manifest]());

        this.chain.push(Context.deserialize());
        this.chain.push(this[_version]());
        this.chain.push(this[_template]());
    }

    get [Symbol.toStringTag]() {
        return 'PodiumPodlet';
    }

    middleware () {
        return this.chain;
    }

    router() {
        return this.app;
    }

    views (type) {
        if (type) {
            this.templateType = type;
        }
        return path.resolve(__dirname, `../views/${this.templateType}/`);
    }

    [_manifest]() {
        return (req, res, next) => {
            const manifest = Joi.validate({
                name: this.name,
                version: this.version,
                content: this.content,
                fallback: this.fallback,
                assets: {
                    js: this.js,
                    css: this.css,
                }
            }, schemas.manifest.schema);

            if (manifest.error) {
                next(manifest.error);
                return;
            }

            res.status(200).json(manifest.value);
        }
    }

    [_version]() {
        return (req, res, next) => {
            res.setHeader('podlet-version', this.version);
            next();
        };
    }

    [_template]() {
        return (req, res, next) => {
            res.locals.name = this.name;
            res.locals.css = this.css;
            res.locals.js = this.js;

            if (req.get('user-agent').startsWith('@podium/podlet-client')) {
                res.podium.template = `slim.${this.templateType}`;
                return next();
            }

            res.podium.template = `full.${this.templateType}`;;
            next();
        };
    }
}

module.exports = PodiumClient;
