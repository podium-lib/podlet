'use strict';

const originalUrl = require('original-url');
const { resolve } = require('path');
const URL = require('url').URL;
const Metrics = require('@podium/metrics');
const schemas = require('@podium/schemas');
const abslog = require('abslog');
const utils = require('@podium/utils');
const joi = require('joi');

const _template = Symbol('_template');
const _version = Symbol('_version');
const _context = Symbol('_context');
const _default = Symbol('_default');
const _padFragment = Symbol('_padFragment');

const PodiumPodlet = class PodiumPodlet {
    constructor({
        name = '',
        version = '',
        pathname = '',
        logger = undefined,
        defaults = false,
    } = {}) {
        Object.defineProperty(this, 'name', {
            value: joi.attempt(
                name,
                schemas.manifest.name,
                new Error(
                    `The value, "${name}", for the required argument "name" on the Podlet constructor is not defined or not valid.`
                )
            ),
        });

        Object.defineProperty(this, 'version', {
            value: joi.attempt(
                version,
                schemas.manifest.version,
                new Error(
                    `The value, "${version}", for the required argument "version" on the Podlet constructor is not defined or not valid.`
                )
            ),
        });

        Object.defineProperty(this, 'pathname', {
            value: this[_padFragment](
                joi.attempt(
                    pathname,
                    schemas.manifest.uri,
                    new Error(
                        `The value, "${pathname}", for the required argument "pathname" on the Podlet constructor is not defined or not valid.`
                    )
                )
            ),
        });

        Object.defineProperty(this, 'log', {
            value: abslog(logger),
        });

        Object.defineProperty(this, 'useDefaults', {
            value: defaults,
        });

        Object.defineProperty(this, 'defaultContext', {
            value: {},
            writable: true,
        });

        Object.defineProperty(this, 'manifestRoute', {
            value: `${this.pathname}manifest.json`,
            writable: true,
        });

        Object.defineProperty(this, 'contentRoute', {
            value: this.pathname,
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

        Object.defineProperty(this, 'proxyRoutes', {
            value: {},
        });

        Object.defineProperty(this, 'templateType', {
            value: 'njk',
            writable: true,
        });

        Object.defineProperty(this, 'metrics', {
            enumerable: true,
            value: new Metrics(),
        });

        Object.defineProperty(this, 'chain', {
            value: [],
        });

        this.chain.push(this[_default]());
        this.chain.push(this[_context]());
        this.chain.push(this[_version]());
        this.chain.push(this[_template]());
    }

    get [Symbol.toStringTag]() {
        return 'PodiumPodlet';
    }

    [_padFragment](fragment) {
        if (!fragment.startsWith('/')) {
            fragment = `/${fragment}`;
        }

        if (!fragment.endsWith('/')) {
            fragment = `${fragment}/`;
        }

        return fragment;
    }

    middleware() {
        return this.chain;
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
            throw new Error(`The value for "path", "${path}", is not valid`);
        }
        return (this.contentRoute = validated.value);
    }

    fallback(path = null) {
        if (!path) {
            return this.fallbackRoute;
        }

        const validated = joi.validate(path, schemas.manifest.fallback);
        if (validated.error) {
            throw new Error(`The value for "path", "${path}", is not valid`);
        }
        return (this.fallbackRoute = validated.value);
    }

    css(path = null) {
        if (!path) {
            return this.cssRoute;
        }

        const validated = joi.validate(path, schemas.manifest.css);
        if (validated.error) {
            throw new Error(`The value for "path", "${path}", is not valid`);
        }
        return (this.cssRoute = validated.value);
    }

    js(path = null) {
        if (!path) {
            return this.jsRoute;
        }

        const validated = joi.validate(path, schemas.manifest.js);
        if (validated.error) {
            throw new Error(`The value for "path", "${path}", is not valid`);
        }
        return (this.jsRoute = validated.value);
    }

    proxy(target = null, name = null) {
        const validatedTarget = joi.validate(target, schemas.manifest.uri);
        if (validatedTarget.error) {
            throw validatedTarget.error;
        }

        const validatedName = joi.validate(name, schemas.manifest.name);
        if (validatedName.error) {
            throw validatedName.error;
        }

        if (Object.keys(this.proxyRoutes).length >= 4) {
            throw new Error(
                `One can not define more than 4 proxy targets for each podlet`
            );
        }

        this.proxyRoutes[validatedName.value] = validatedTarget.value;

        return validatedTarget.value;
    }

    defaults(context = null) {
        if (!context) {
            return this.defaultContext;
        }

        return (this.defaultContext = context);
    }

    toJSON() {
        const obj = {
            name: this.name,
            version: this.version,
            content: this.contentRoute,
            fallback: this.fallbackRoute,
            assets: {
                js: this.jsRoute,
                css: this.cssRoute,
            },
            proxy: this.proxyRoutes,
        };

        this.log.debug(
            `Podlet instance serialized (toJSON) as "${JSON.stringify(obj)}"`
        );

        return obj;
    }

    [_default]() {
        return (req, res, next) => {
            if (this.useDefaults) {
                const url = originalUrl(req);
                const parsed = new URL(url.full);

                const context = Object.assign(
                    {
                        debug: 'false',
                        locale: 'en-EN',
                        deviceType: 'desktop',
                        requestedBy: this.name,
                        mountOrigin: parsed.origin,
                        mountPathname: this.pathname,
                        publicPathname: this.pathname,
                    },
                    this.defaultContext
                );

                utils.setAtLocalsPodium(res, 'context', context);

                this.log.debug(
                    `Appending a default context to inbound request "${JSON.stringify(
                        context
                    )}"`
                );
            }

            next();
        };
    }

    [_context]() {
        return (req, res, next) => {
            let context = utils.deserializeContext(req.headers);

            this.log.debug(
                `Inbound request contains a context "${JSON.stringify(
                    context
                )}"`
            );

            if (this.useDefaults) {
                const defaults = utils.getFromLocalsPodium(res, 'context');
                context = Object.assign(defaults, context);

                this.log.debug(
                    `Merged default context with context on inbound request "${JSON.stringify(
                        context
                    )}"`
                );
            }

            utils.setAtLocalsPodium(res, 'context', context);
            next();
        };
    }

    [_version]() {
        return (req, res, next) => {
            this.log.debug(`Header "podlet-version" set to "${this.version}"`);
            res.setHeader('podlet-version', this.version);
            next();
        };
    }

    [_template]() {
        return (req, res, next) => {
            res.locals.name = this.name;
            res.locals.css = this.cssRoute;
            res.locals.js = this.jsRoute;

            if (
                req.get('user-agent') &&
                req.get('user-agent').startsWith('@podium/client')
            ) {
                this.log.debug(
                    `Incoming request made by @podium/client, setting res.locals.podium.template to "slim.${
                        this.templateType
                    }"`
                );
                res.locals.podium.template = `slim.${this.templateType}`;
                return next();
            }

            this.log.debug(
                `Incoming non podium request, setting res.locals.podium.template to "full.${
                    this.templateType
                }"`
            );
            res.locals.podium.template = `full.${this.templateType}`;
            next();
        };
    }
};

module.exports = PodiumPodlet;
