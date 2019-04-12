/* eslint-disable no-underscore-dangle */

'use strict';

const { HttpIncoming } = require('@podium/utils');
const { validate } = require('@podium/schemas');
const Metrics = require('@metrics/client');
const abslog = require('abslog');
const objobj = require('objobj');
const utils = require('@podium/utils');
const Proxy = require('@podium/proxy');

const { template } = utils;

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
        if (validate.name(name).error) throw new Error(
            `The value, "${name}", for the required argument "name" on the Podlet constructor is not defined or not valid.`
        );

        if (validate.version(version).error) throw new Error(
            `The value, "${version}", for the required argument "version" on the Podlet constructor is not defined or not valid.`
        );

        if (validate.uri(pathname).error) throw new Error(
            `The value, "${pathname}", for the required argument "pathname" on the Podlet constructor is not defined or not valid.`
        );

        if (validate.uri(manifest).error) throw new Error(
            `The value, "${manifest}", for the optional argument "manifest" on the Podlet constructor is not valid.`
        );

        if (validate.content(content).error) throw new Error(
            `The value, "${content}", for the optional argument "content" on the Podlet constructor is not valid.`
        );

        if (validate.fallback(fallback).error) throw new Error(
            `The value, "${fallback}", for the optional argument "fallback" on the Podlet constructor is not valid.`
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
            value: new Proxy({
                pathname: this._pathname,
                logger: this.log,
            }),
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
            this.log.error(
                'Error emitted by metric stream in @podium/podlet module',
                error,
            );
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

        if (validate.css(value).error) throw new Error(
            `Value on argument variable "value", "${value}", is not valid`,
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

        if (validate.js(value).error) throw new Error(
            `Value on argument variable "value", "${value}", is not valid`,
        );

        this.jsRoute = this[_sanitize](value);

        return this[_sanitize](this.jsRoute, prefix);
    }

    proxy({ target = null, name = null } = {}) {
        if (validate.uri(target).error) throw new Error(
            `Value on argument variable "target", "${target}", is not valid`,
        );

        if (validate.name(name).error) throw new Error(
            `Value on argument variable "name", "${name}", is not valid`,
        );

        if (Object.keys(this.proxyRoutes).length >= 4) {
            throw new Error(
                `One can not define more than 4 proxy targets for each podlet`,
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
                `Value on argument variable "template" must be a function`,
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

    process(incoming) {
        incoming.view = this._view;
        incoming.name = this.name;
        incoming.css = this.css();
        incoming.js = this.js();

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
                this.defaultContext,
            );
            this.log.debug(
                `Appending a default context to inbound request "${JSON.stringify(
                    incoming.context,
                )}"`,
            );
        } else {
            incoming.context = utils.deserializeContext(
                incoming.request.headers,
            );
            this.log.debug(
                `Inbound request contains a context "${JSON.stringify(
                    incoming.context,
                )}"`,
            );
        }

        return incoming;
    }

    render(incoming, data) {
        if (!this.development) {
            if (typeof data === 'string') return data;
            return data.body || '';
        }

        return incoming.render(data);
    }

    middleware() {
        return async (req, res, next) => {
            const incoming = new HttpIncoming(req, res);

            try {
                await this.process(incoming);

                if (incoming.development) {
                    await this.httpProxy.process(incoming);
                    if (incoming.proxy) return; // proxy is handling request, nothing more to do
                }

                // set "state" on res.locals.podium
                objobj.set('locals.podium', incoming, res);

                if (res.header) {
                    res.header('podlet-version', this.version);
                }

                res.podiumSend = data => res.send(this.render(incoming, data));

                next();
            } catch (error) {
                next(error);
            }
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
