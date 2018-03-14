'use strict';

const schemas = require('@podium/schemas');
const utils = require('@podium/utils');
const { resolve } = require('path');
const joi = require('joi');
const abslog = require('abslog');

const _template = Symbol('_template');
const _version = Symbol('_version');
const _context = Symbol('_context');

const PodiumClient = class PodiumClient {
    constructor(options = {}) {
        const validatedName = joi.validate(options.name, schemas.manifest.name);
        if (validatedName.error) {
            throw new Error(
                `The value for "options.name", ${options.name}, is not valid`
            );
        }

        const validatedVersion = joi.validate(
            options.version,
            schemas.manifest.version
        );
        if (validatedVersion.error) {
            throw new Error(
                `The value for "options.version", ${
                    options.version
                }, is not valid`
            );
        }

        this.log = abslog(options.logger);

        Object.defineProperty(this, 'name', {
            value: validatedName.value,
        });

        Object.defineProperty(this, 'version', {
            value: validatedVersion.value,
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
            value: [],
        });

        this.chain.push(this[_context]());
        this.chain.push(this[_version]());
        this.chain.push(this[_template]());
    }

    get [Symbol.toStringTag]() {
        return 'PodiumPodlet';
    }

    middleware() {
        return this.chain;
    }

    router() {
        return this.app;
    }

    views(type) {
        if (type) {
            this.templateType = type;
        }
        return resolve(__dirname, `../views/${this.templateType}/`);
    }

    manifest(path = null) {
        if (!path) {
            return this.manifestRoute;
        }
        return (this.manifestRoute = path);
    }

    content(path = null) {
        if (!path) {
            return this.contentRoute;
        }

        const validated = joi.validate(path, schemas.manifest.content);
        if (validated.error) {
            throw new Error(`The value for "path", ${path}, is not valid`);
        }
        return (this.contentRoute = validated.value);
    }

    fallback(path = null) {
        if (!path) {
            return this.fallbackRoute;
        }

        const validated = joi.validate(path, schemas.manifest.fallback);
        if (validated.error) {
            throw new Error(`The value for "path", ${path}, is not valid`);
        }
        return (this.fallbackRoute = validated.value);
    }

    css(path = null) {
        if (!path) {
            return this.cssRoute;
        }

        const validated = joi.validate(path, schemas.manifest.css);
        if (validated.error) {
            throw new Error(`The value for "path", ${path}, is not valid`);
        }
        return (this.cssRoute = validated.value);
    }

    js(path = null) {
        if (!path) {
            return this.jsRoute;
        }

        const validated = joi.validate(path, schemas.manifest.js);
        if (validated.error) {
            throw new Error(`The value for "path", ${path}, is not valid`);
        }
        return (this.jsRoute = validated.value);
    }

    toJSON() {
        const json = {
            name: this.name,
            version: this.version,
            content: this.contentRoute,
            fallback: this.fallbackRoute,
            assets: {
                js: this.jsRoute,
                css: this.cssRoute,
            },
        };

        this.log.info(
            `Podlet instance serialized (toJSON) as "${JSON.stringify(json)}"`
        );

        return json;
    }

    [_context]() {
        return (req, res, next) => {
            const context = utils.deserializeContext(req.headers);
            this.log.info(
                `Podium context deserialized to "${JSON.stringify(context)}"`
            );
            utils.setAtLocalsPodium(res, 'context', context);
            next();
        };
    }

    [_version]() {
        return (req, res, next) => {
            this.log.info(`Header "podlet-version" set to "${this.version}"`);
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
                this.log.info(
                    `Incoming request made by @podium/podlet-client, setting res.locals.podium.template to "slim.${
                        this.templateType
                    }"`
                );
                res.locals.podium.template = `slim.${this.templateType}`;
                return next();
            }

            this.log.info(
                `Incoming non podium request, setting res.locals.podium.template to "full.${
                    this.templateType
                }"`
            );
            res.locals.podium.template = `full.${this.templateType}`;
            next();
        };
    }
};

module.exports = PodiumClient;
