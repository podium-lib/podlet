/* eslint-disable no-underscore-dangle */

'use strict';

const { HttpIncoming } = require('@podium/utils');
const Metrics = require('@metrics/client');
const schemas = require('@podium/schemas');
const abslog = require('abslog');
const objobj = require('objobj');
const utils = require('@podium/utils');
const Proxy = require('@podium/proxy');
const merge = require('lodash.merge');
const joi = require('joi');
const template = require('./template');

const _sanitize = Symbol('_sanitize');

const PodiumPodlet = class PodiumPodlet {
    constructor({
        name = '',
        version = '',
        pathname = '',
        manifest = '/manifest.json',
        fallback = '',
        content = '/',
        logger = undefined,
        development = false,
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

        Object.defineProperty(this, 'development', {
            value: development,
        });

        Object.defineProperty(this, 'httpProxy', {
            enumerable: true,
            value: new Proxy(
                merge(
                    {
                        pathname: this._pathname,
                        logger: this.log,
                    },
                    {}
                )
            ),
        });

        Object.defineProperty(this, 'baseContext', {
            value: {
                debug: 'false',
                locale: 'en-US',
                deviceType: 'desktop',
                requestedBy: this.name,
                mountOrigin: '',
                mountPathname: this._pathname,
                publicPathname: this._pathname,
            },
            writable: false,
        });

        Object.defineProperty(this, 'defaultContext', {
            value: {},
            writable: true,
        });

        Object.defineProperty(this, 'metrics', {
            enumerable: true,
            value: new Metrics(),
        });

        Object.defineProperty(this, '_view', {
            value: template,
            writable: true,
        });


        this.metrics.on('error', error => {
            this.log.error('Error emitted by metric stream in @podium/podlet module', error);
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumPodlet';
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

    proxy({ target = null, name = null } = {}) {
        joi.attempt(
            target,
            schemas.manifest.uri,
            new Error(
                `Value on argument variable "target", "${target}", is not valid`
            )
        );

        joi.attempt(
            name,
            schemas.manifest.name,
            new Error(
                `Value on argument variable "name", "${name}", is not valid`
            )
        );

        if (Object.keys(this.proxyRoutes).length >= 4) {
            throw new Error(
                `One can not define more than 4 proxy targets for each podlet`
            );
        }

        this.proxyRoutes[name] = target;

        if (this.development) {
            this.httpProxy.register(this);
        }

        return target;
    }

    defaults(context = null) {
        if (context) {
            this.defaultContext = context;
        }
        return Object.assign({}, this.baseContext, this.defaultContext);
    }

    view(fn = null) {
        if (!utils.isFunction(fn)) {
            throw new Error(
                `Value on argument variable "template" must be a function`
            );
        }
        this._view = fn;
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
            },
            proxy: this.proxyRoutes,
        };
    }

    async process(incoming) {
        incoming.view = this._view;
        incoming.name = this.name;
        incoming.css = this.cssRoute;
        incoming.js = this.jsRoute;

        // Determine if request comes from layout server or not
        if (
            incoming.request.headers['user-agent'] &&
            incoming.request.headers['user-agent'].startsWith('@podium/client')
        ) {
            incoming.development = false;
        } else {
            incoming.development = this.development;
        }

        // Append development context and proxy
        if (incoming.development) {
            incoming.context = Object.assign(
                this.baseContext,
                { mountOrigin: incoming.url.origin },
                this.defaultContext
            );
            this.log.debug(
                `Appending a default context to inbound request "${JSON.stringify(
                    incoming.context
                )}"`
            );
        } else {
            incoming.context = utils.deserializeContext(incoming.request.headers);;
            this.log.debug(
                `Inbound request contains a context "${JSON.stringify(incoming.context)}"`
            );
        }

        return incoming;
    }

    middleware() {
        return (req, res, next) => {
            const incoming = new HttpIncoming(req, res);

            this.process(incoming)
                .then(async (incom) => {
                    if (incom.development) {
                        return this.httpProxy.process(incom);
                    }
                    return incom;
                })
                .then(result => {
                    if (result) {
                        // set "state" on res.locals.podium
                        objobj.set('locals.podium', result, res);

                        if(res.header) {
                            res.header('podlet-version', this.version);
                        }

                        res.podiumSend = fragment => {
                            res.send(res.locals.podium.render(fragment));
                        };

                        next();
                    }
                })
                .catch(error => {
                    next(error);
                });
        };
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
};

module.exports = PodiumPodlet;
