/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import {
    HttpIncoming,
    // @ts-ignore
    pathnameBuilder,
    AssetCss,
    AssetJs,
} from '@podium/utils';
// @ts-ignore
import * as schema from '@podium/schemas';
import Metrics from '@metrics/client';
// @ts-ignore
import abslog from 'abslog';
// @ts-ignore
import objobj from 'objobj';
import * as utils from '@podium/utils';
import Proxy from '@podium/proxy';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const pkgJson = fs.readFileSync(
    join(currentDirectory, '../package.json'),
    'utf-8',
);
const pkg = JSON.parse(pkgJson);

// @ts-ignore
const { template } = utils;

export default class PodiumPodlet {
    #name = '';
    #version = '';
    #pathname = '';
    #development = false;
    #log;
    #view = template;
    #httpProxy;
    #manifestRoute = '/manifest.json';
    #contentRoute = '/';
    #fallbackRoute = '';
    #proxyRoutes = {};
    #baseContext;
    #defaultContext = {};

    cssRoute = [];
    jsRoute = [];
    metrics = new Metrics();

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
        if (schema.name(name).error)
            throw new Error(
                `The value, "${name}", for the required argument "name" on the Podlet constructor is not defined or not valid.`,
            );

        if (schema.version(version).error)
            throw new Error(
                `The value, "${version}", for the required argument "version" on the Podlet constructor is not defined or not valid.`,
            );

        if (schema.uri(pathname).error)
            throw new Error(
                `The value, "${pathname}", for the required argument "pathname" on the Podlet constructor is not defined or not valid.`,
            );

        if (schema.uri(manifest).error)
            throw new Error(
                `The value, "${manifest}", for the optional argument "manifest" on the Podlet constructor is not valid.`,
            );

        if (schema.content(content).error)
            throw new Error(
                `The value, "${content}", for the optional argument "content" on the Podlet constructor is not valid.`,
            );

        if (schema.fallback(fallback).error)
            throw new Error(
                `The value, "${fallback}", for the optional argument "fallback" on the Podlet constructor is not valid.`,
            );

        this.#name = name;
        this.#version = version;
        this.#pathname = this.#sanitize(pathname);
        this.#manifestRoute = this.#sanitize(manifest);
        this.#contentRoute = this.#sanitize(content);
        this.#fallbackRoute = this.#sanitize(fallback);
        this.#log = abslog(logger);
        this.#development = development;
        this.#httpProxy = new Proxy({
            pathname: this.#pathname,
            logger: this.#log,
            ...proxy,
        });
        this.#baseContext = {
            debug: 'false',
            locale: 'en-US',
            deviceType: 'desktop',
            requestedBy: this.#name,
            mountOrigin: '',
            mountPathname: this.#pathname,
            publicPathname: pathnameBuilder(
                this.#httpProxy.pathname,
                this.#httpProxy.prefix,
                this.#name,
            ),
        };

        // Skip a tick to ensure the metric stream has been consumed
        setImmediate(() => {
            const moduleVersion = pkg.version;
            const segments = moduleVersion
                .split('.')
                .map((value) => parseInt(value, 10));

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

        this.metrics.on('error', (error) => {
            this.#log.error(
                'Error emitted by metric stream in @podium/podlet module',
                error,
            );
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumPodlet';
    }

    pathname() {
        return this.#pathname;
    }

    manifest({ prefix = true } = {}) {
        return this.#sanitize(this.#manifestRoute, prefix);
    }

    content({ prefix = true } = {}) {
        return this.#sanitize(this.#contentRoute, prefix);
    }

    fallback({ prefix = true } = {}) {
        return this.#sanitize(this.#fallbackRoute, prefix);
    }

    #addCssAsset(options = {}) {
        const clonedOptions = JSON.parse(JSON.stringify(options));
        clonedOptions.value = this.#sanitize(
            clonedOptions.value,
            clonedOptions.prefix,
        );
        const args = {
            prefix: true,
            ...clonedOptions,
            pathname: this.#pathname,
        };
        this.cssRoute.push(new AssetCss(args));
    }

    css(options = {}) {
        if (Array.isArray(options)) {
            for (const opts of options) {
                this.#addCssAsset(opts);
            }
            return;
        }
        this.#addCssAsset(options);
    }

    #addJsAsset(options = {}) {
        const clonedOptions = JSON.parse(JSON.stringify(options));
        clonedOptions.value = this.#sanitize(
            clonedOptions.value,
            clonedOptions.prefix,
        );

        const args = {
            prefix: true,
            ...clonedOptions,
            pathname: this.#pathname,
        };

        // Convert data attribute object structure to array of key value objects
        if (typeof args.data === 'object' && args.data !== null) {
            const data = [];
            Object.keys(args.data).forEach((key) => {
                data.push({
                    value: args.data[key],
                    key,
                });
            });
            args.data = data;
        }

        this.jsRoute.push(new AssetJs(args));
    }

    js(options = {}) {
        if (Array.isArray(options)) {
            for (const opts of options) {
                this.#addJsAsset(opts);
            }
            return;
        }
        this.#addJsAsset(options);
    }

    proxy({ target = null, name = null } = {}) {
        if (schema.uri(target).error)
            throw new Error(
                `Value on argument variable "target", "${target}", is not valid`,
            );

        if (schema.name(name).error)
            throw new Error(
                `Value on argument variable "name", "${name}", is not valid`,
            );

        if (Object.keys(this.#proxyRoutes).length >= 4) {
            throw new Error(
                `One can not define more than 4 proxy targets for each podlet`,
            );
        }

        this.#proxyRoutes[name] = target;

        if (this.#development) {
            // @ts-ignore
            this.#httpProxy.register(this.toJSON());
        }

        return target;
    }

    defaults(context = null) {
        if (context) {
            this.#defaultContext = context;
        }
        return { ...this.#baseContext, ...this.#defaultContext };
    }

    view(fn = null) {
        // @ts-ignore
        if (!utils.isFunction(fn)) {
            throw new Error(
                `Value on argument variable "template" must be a function`,
            );
        }
        this.#view = fn;
    }

    toJSON() {
        return {
            name: this.#name,
            version: this.#version,
            content: this.#contentRoute,
            fallback: this.#fallbackRoute,
            css: this.cssRoute,
            js: this.jsRoute,
            proxy: this.#proxyRoutes,
        };
    }

    render(incoming, data, ...args) {
        if (!incoming.development) {
            return data;
        }
        return this.#view(incoming, data, ...args);
    }

    async process(incoming, { proxy = true } = {}) {
        incoming.name = this.#name;
        incoming.css = this.cssRoute.filter(
            ({ scope = 'all' }) =>
                scope === this.#currentScope(incoming) || scope === 'all',
        );
        incoming.js = this.jsRoute.filter(
            ({ scope = 'all' }) =>
                scope === this.#currentScope(incoming) || scope === 'all',
        );

        // Determine if request comes from layout server or not
        if (
            incoming.request.headers['user-agent'] &&
            incoming.request.headers['user-agent'].startsWith('@podium/client')
        ) {
            incoming.development = false;
        } else {
            incoming.development = this.#development;
        }

        // Append development context
        if (incoming.development) {
            incoming.context = Object.assign(
                this.#baseContext,
                { mountOrigin: incoming.url.origin },
                this.#defaultContext,
            );
            this.#log.debug(
                `Appending a default context to inbound request "${JSON.stringify(
                    incoming.context,
                )}"`,
            );
        } else {
            // @ts-ignore
            incoming.context = utils.deserializeContext(
                incoming.request.headers,
            );
            this.#log.debug(
                `Inbound request contains a context "${JSON.stringify(
                    incoming.context,
                )}"`,
            );
        }

        // Determin if the request should be proxied and do if so
        if (incoming.development && proxy) {
            await this.#httpProxy.process(incoming);
        }

        return incoming;
    }

    middleware() {
        return async (req, res, next) => {
            const incoming = new HttpIncoming(req, res);
            // @ts-ignore
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
                    res.header('podlet-version', this.#version);
                }

                res.podiumSend = (data, ...args) =>
                    res.send(this.render(incoming, data, ...args));

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    #sanitize(uri, prefix = false) {
        const pathname = prefix ? this.#pathname : '';
        if (uri) {
            // @ts-ignore
            return utils.uriIsRelative(uri)
                ? // @ts-ignore
                  utils.pathnameBuilder(pathname, uri)
                : uri;
        }
        return uri;
    }

    #currentScope(incoming) {
        const fallback = this.fallback({ prefix: true });
        const content = this.content({ prefix: true });
        const { pathname } = incoming.url;

        // only check fallback if defined
        // match fallback first since fallback is a more accurate match since
        // fallback cannot take dynamic path segments and we can use exact matching
        if (!!fallback && pathname === fallback) return 'fallback';

        // fallback didn't match so check content
        // we have to use startsWith since content may contain dynamic path segments
        if (pathname.startsWith(content)) return 'content';

        return 'all';
    }
}
