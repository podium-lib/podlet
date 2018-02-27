'use strict';

const schemas = require('@podium/schemas');
const utils = require('@podium/utils');
const path = require('path');
const joi = require('joi');

const _template = Symbol('_template');
const _version = Symbol('_version');
const _context = Symbol('_context');

const PodiumClient = class PodiumClient {
    constructor(options = {}) {

        const validatedName = joi.validate(options.name, schemas.manifest.name);
        if (validatedName.error) {
            throw new Error(
                `The value for "options.name", ${
                    options.name
                }, is not valid`
            );
        }

        const validatedVersion = joi.validate(options.version, schemas.manifest.version);
        if (validatedVersion.error) {
            throw new Error(
                `The value for "options.version", ${
                    options.version
                }, is not valid`
            );
        }

        Object.defineProperty(this, 'name', {
            value: validatedName.value
        });

        Object.defineProperty(this, 'version', {
            value: validatedVersion.value
        });

        Object.defineProperty(this, 'manifestRoute', {
            value: '/manifest.json',
            writable: true,
        });

        Object.defineProperty(this, 'contentRoute', {
            value: options.content || '/',
            writable: true,
        });

        Object.defineProperty(this, 'fallbackRoute', {
            value: '',
            writable: true,
        });

        Object.defineProperty(this, 'cssRoute', {
            value: '',
            writable: true,
        });

        Object.defineProperty(this, 'jsRoute', {
            value: '',
            writable: true,
        });

        Object.defineProperty(this, 'templateType', {
            value: 'njk',
            writable: true,
        });

        Object.defineProperty(this, 'chain', {
            value: []
        });

        this.chain.push(this[_context]());
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

    manifest(path = null) {
        if (!path) {
            return this.manifestRoute;
        }
        return this.manifestRoute = path;
    }

    content(path = null) {
        if (!path) {
            return this.contentRoute;
        }

        const validated = joi.validate(path, schemas.manifest.content);
        if (validated.error) {
            throw new Error(
                `The value for "path", ${
                    path
                }, is not valid`
            );
        }
        return this.contentRoute = validated.value;
    }

    fallback(path = null) {
        if (!path) {
            return this.fallbackRoute;
        }

        const validated = joi.validate(path, schemas.manifest.fallback);
        if (validated.error) {
            throw new Error(
                `The value for "path", ${
                    path
                }, is not valid`
            );
        }
        return this.fallbackRoute = validated.value;
    }

    css(path = null) {
        if (!path) {
            return this.cssRoute;
        }

        const validated = joi.validate(path, schemas.manifest.css);
        if (validated.error) {
            throw new Error(
                `The value for "path", ${
                    path
                }, is not valid`
            );
        }
        return this.cssRoute = validated.value;
    }

    js(path = null) {
        if (!path) {
            return this.jsRoute;
        }

        const validated = joi.validate(path, schemas.manifest.js);
        if (validated.error) {
            throw new Error(
                `The value for "path", ${
                    path
                }, is not valid`
            );
        }
        return this.jsRoute = validated.value;
    }

    toJSON() {
        return {
            name: this.name,
            version: this.version,
            content: this.contentRoute,
            fallback: this.fallbackRoute,
            assets: {
                js: this.jsRoute,
                css: this.cssRoute,
            }
        };
    }

    [_context]() {
        return (req, res, next) => {
            const context = utils.deserializeContext(req.headers);
            utils.setAtLocalsPodium(res, 'context', context);
            next();
        };
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
            res.locals.css = this.cssRoute;
            res.locals.js = this.jsRoute;

            if (req.get('user-agent').startsWith('@podium/podlet-client')) {
                res.locals.podium.template = `slim.${this.templateType}`;
                return next();
            }

            res.locals.podium.template = `full.${this.templateType}`;
            next();
        };
    }
}

module.exports = PodiumClient;
