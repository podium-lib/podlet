/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */

'use strict';

const {
    HttpIncoming,
    pathnameBuilder,
    AssetCss,
    AssetJs,
} = require('@podium/utils');
const { validate } = require('@podium/schemas');
const Metrics = require('@metrics/client');
const abslog = require('abslog');
const objobj = require('objobj');
const utils = require('@podium/utils');
const Proxy = require('@podium/proxy');
const pkg = require('../package.json');

const { template } = utils;

const _sanitize = Symbol('_sanitize');
const _addCssAsset = Symbol('_addCssAsset');
const _addJsAsset = Symbol('_addJsAsset');

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
        proxy = {},
    } = {}) {
        if (validate.name(name).error)
            throw new Error(
                `The value, "${name}", for the required argument "name" on the Podlet constructor is not defined or not valid.`,
            );

        if (validate.version(version).error)
            throw new Error(
                `The value, "${version}", for the required argument "version" on the Podlet constructor is not defined or not valid.`,
            );

        if (validate.uri(pathname).error)
            throw new Error(
                `The value, "${pathname}", for the required argument "pathname" on the Podlet constructor is not defined or not valid.`,
            );

        if (validate.uri(manifest).error)
            throw new Error(
                `The value, "${manifest}", for the optional argument "manifest" on the Podlet constructor is not valid.`,
            );

        if (validate.content(content).error)
            throw new Error(
                `The value, "${content}", for the optional argument "content" on the Podlet constructor is not valid.`,
            );

        if (validate.fallback(fallback).error)
            throw new Error(
                `The value, "${fallback}", for the optional argument "fallback" on the Podlet constructor is not valid.`,
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
            value: [],
        });

        Object.defineProperty(this, 'jsRoute', {
            value: [],
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
                ({ pathname: this._pathname,
                    logger: this.log, ...proxy}),
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
                publicPathname: pathnameBuilder(
                    this.httpProxy.pathname,
                    this.httpProxy.prefix,
                    this.name,
                ),
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

        // Skip a tick to ensure the metric stream has been consumed
        setImmediate(() => {
            const moduleVersion = pkg.version;
            const segments = moduleVersion.split('.').map(value => {
                return parseInt(value, 10);
            });

            const versionGauge = this.metrics.gauge({
                name: 'podium_podlet_version_info',
                description: '@podium/podlet version info',
                labels: {
                    version: moduleVersion,
                    major: segments[0],
                    minor: segments[1],
                    patch: segments[2],
                },
            });

            versionGauge.set(1);
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

    manifest({ prefix = true } = {}) {
        return this[_sanitize](this.manifestRoute, prefix);
    }

    content({ prefix = true } = {}) {
        return this[_sanitize](this.contentRoute, prefix);
    }

    fallback({ prefix = true } = {}) {
        return this[_sanitize](this.fallbackRoute, prefix);
    }

    [_addCssAsset](options = {}) {
        const clonedOptions = JSON.parse(JSON.stringify(options));
        clonedOptions.value = this[_sanitize](clonedOptions.value, clonedOptions.prefix)
        const args = { prefix: true, ...clonedOptions, pathname: this._pathname };
        this.cssRoute.push(new AssetCss(args));
    }

    css(options = {}) {
        if (Array.isArray(options)) {
            for (const opts of options) {
                this[_addCssAsset](opts);
            }
            return;
        }
        this[_addCssAsset](options);
    }

    [_addJsAsset](options = {}) {
        const clonedOptions = JSON.parse(JSON.stringify(options));
        clonedOptions.value = this[_sanitize](clonedOptions.value, clonedOptions.prefix)

        const args = { prefix: true, ...clonedOptions, pathname: this._pathname };

        // Convert data attribute object structure to array of key value objects
        if (typeof args.data === 'object' && args.data !== null) {
            const data = [];
            Object.keys(args.data).forEach((key) => {
                data.push({
                    value: args.data[key],
                    key,
                });
            })
            args.data = data;
        }

        this.jsRoute.push(new AssetJs(args));
    }

    js(options = {}) {
        if (Array.isArray(options)) {
            for (const opts of options) {
                this[_addJsAsset](opts);
            }
            return;
        }
        this[_addJsAsset](options);
    }

    proxy({ target = null, name = null } = {}) {
        if (validate.uri(target).error)
            throw new Error(
                `Value on argument variable "target", "${target}", is not valid`,
            );

        if (validate.name(name).error)
            throw new Error(
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
        return { ...this.baseContext, ...this.defaultContext };
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
            css: this.cssRoute,
            js: this.jsRoute,
            proxy: this.proxyRoutes,
        };
    }

    render(incoming, data, ...args) {
        if (!incoming.development) {
            return data;
        }
        return this._view(incoming, data, ...args);
    }

    async process(incoming, { proxy = true } = {}) {
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

        // Append development context
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

        // Determin if the request should be proxied and do if so
        if (incoming.development && proxy) {
            await this.httpProxy.process(incoming);
        }

        return incoming;
    }

    middleware() {
        return async (req, res, next) => {
            const incoming = new HttpIncoming(req, res);
            incoming.url = new URL(
                req.originalUrl,
                `${req.protocol}://${req.get('host')}`,
            );

            try {
                await this.process(incoming);
                // if this is a proxy request then no further work should be done.
                if (incoming.proxy) return;

                // set "incoming" on res.locals.podium
                objobj.set('locals.podium', incoming, res);

                if (res.header) {
                    res.header('podlet-version', this.version);
                }

                res.podiumSend = (data, ...args) =>
                    res.send(this.render(incoming, data, ...args));

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
