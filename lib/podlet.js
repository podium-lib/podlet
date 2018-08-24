'use strict';

const originalUrl = require('original-url');
const { resolve } = require('path');
const URL = require('url').URL;
const Metrics = require('@podium/metrics');
const schemas = require('@podium/schemas');
const abslog = require('abslog');
const utils = require('@podium/utils');
const joi = require('joi');

const _sanitize = Symbol('_sanitize');
const _template = Symbol('_template');
const _version = Symbol('_version');
const _context = Symbol('_context');
const _default = Symbol('_default');

const PodiumPodlet = class PodiumPodlet {
    constructor({
        name = '',
        version = '',
        pathname = '',
        manifest = '/manifest.json',
        fallback = '',
        content = '/',
        logger = undefined,
        defaults = false,
    } = {}) {
        joi.attempt(
            name,
            schemas.manifest.name,
            new Error(
                `The value, "${name}", for the required argument "name" on the Podlet constructor is not defined or not valid.`
            )
        );

        joi.attempt(
            version,
            schemas.manifest.version,
            new Error(
                `The value, "${version}", for the required argument "version" on the Podlet constructor is not defined or not valid.`
            )
        );

        joi.attempt(
            pathname,
            schemas.manifest.uri,
            new Error(
                `The value, "${pathname}", for the required argument "pathname" on the Podlet constructor is not defined or not valid.`
            )
        );

        joi.attempt(
            manifest,
            schemas.manifest.uri,
            new Error(
                `The value, "${manifest}", for the optional argument "manifest" on the Podlet constructor is not valid.`
            )
        );

        joi.attempt(
            content,
            schemas.manifest.content,
            new Error(
                `The value, "${content}", for the optional argument "content" on the Podlet constructor is not valid.`
            )
        );

        joi.attempt(
            fallback,
            schemas.manifest.fallback,
            new Error(
                `The value, "${fallback}", for the optional argument "fallback" on the Podlet constructor is not valid.`
            )
        );

        Object.defineProperty(this, 'name', {
            value: name,
        });

        Object.defineProperty(this, 'version', {
            value: version,
        });

        Object.defineProperty(this, '_pathname', {
            value: this[_sanitize](pathname),
        });

        Object.defineProperty(this, 'manifestRoute', {
            value: this[_sanitize](manifest),
        });

        Object.defineProperty(this, 'contentRoute', {
            value: this[_sanitize](content),
        });

        Object.defineProperty(this, 'fallbackRoute', {
            value: this[_sanitize](fallback),
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

    middleware() {
        return this.chain;
    }

    views(type) {
        if (type) {
            this.templateType = type;
        }
        return resolve(__dirname, `../views/${this.templateType}/`);
    }

    pathname() {
        return this._pathname;
    }

    manifest({ prefix = false } = {}) {
        return this[_sanitize](this.manifestRoute, prefix);
    }

    content({ prefix = false } = {}) {
        return this[_sanitize](this.contentRoute, prefix);
    }

    fallback({ prefix = false } = {}) {
        return this[_sanitize](this.fallbackRoute, prefix);
    }

    css({ value = null, prefix = false } = {}) {
        if (!value) {
            return this[_sanitize](this.cssRoute, prefix);
        }

        if (this.cssRoute) {
            throw new Error('Value for "css" has already been set');
        }

        joi.attempt(
            value,
            schemas.manifest.css,
            new Error(
                `Value on argument variable "value", "${value}", is not valid`
            )
        );

        this.cssRoute = this[_sanitize](value);

        return this[_sanitize](this.cssRoute, prefix);
    }

    js({ value = null, prefix = false } = {}) {
        if (!value) {
            return this[_sanitize](this.jsRoute, prefix);
        }

        if (this.jsRoute) {
            throw new Error('Value for "js" has already been set');
        }

        joi.attempt(
            value,
            schemas.manifest.js,
            new Error(
                `Value on argument variable "value", "${value}", is not valid`
            )
        );

        this.jsRoute = this[_sanitize](value);

        return this[_sanitize](this.jsRoute, prefix);
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

    [_sanitize](uri, prefix = false) {
        const pathname = prefix ? this._pathname : '';
        if (uri) {
            return utils.uriIsRelative(uri)
                ? utils.pathnameBuilder(pathname, uri)
                : uri;
        }
        return uri;
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
                        mountPathname: this._pathname,
                        publicPathname: this._pathname,
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
