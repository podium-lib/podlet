import {
    HttpIncoming,
    pathnameBuilder,
    AssetCss,
    AssetJs,
} from '@podium/utils';
import * as schema from '@podium/schemas';
import Metrics from '@metrics/client';
import abslog from 'abslog';
// @ts-ignore
import objobj from 'objobj';
import * as utils from '@podium/utils';
import Proxy from '@podium/proxy';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore
import fs from 'node:fs';
import assert from 'node:assert';

const customElementRegex =
    /^(?!(annotation-xml|color-profile|font-face|font-face-src|font-face-uri|font-face-format|font-face-name|missing-glyph)$)[a-z][a-z0-9.-]*-[a-z0-9.-]*$/;

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const pkgJson = fs.readFileSync(
    join(currentDirectory, '../package.json'),
    'utf-8',
);
const pkg = JSON.parse(pkgJson);

const { template } = utils;

/**
 * @typedef {Object} PodletOptions
 * @property {string} name - (required) podlet name
 * @property {string} version - (required) podlet version
 * @property {string} pathname - (required) podlet pathname
 * @property {string} [manifest="/manifest.json"] - path where the podlet manifest file is served from (default '/manifest.json')
 * @property {string} [content="/"] - path where the podlet content HTML markup is served from (default '/')
 * @property {string} [fallback=""] - path where the podlet fallback HTML markup is served from (default '/fallback')
 * @property {boolean} [development=false] - a boolean flag that, when true, enables additional development setup (default false)
 * @property {boolean} [useShadowDOM=false] - a boolean flag that, when true, enables the use of ShadowDOM (default false)
 * @property {import("abslog").AbstractLoggerOptions} [logger] - a logger to use when provided. Can be the console object if console logging is desired but can also be any Log4j compatible logging object as well. Nothing is logged if no logger is provided. (default null)
 * @property {import("@podium/proxy").PodiumProxyOptions} [proxy] - options that can be provided to configure the @podium/proxy instance used by the podlet. See that module for details.
 *
 * @typedef {{ debug: 'true' | 'false', locale: string, deviceType: string, requestedBy: string, mountOrigin: string, mountPathname: string, publicPathname: string }} PodletContext
 * @typedef {{ as?: string | false | null, crossorigin?: string | null | boolean, disabled?: boolean | '' | null, hreflang?: string | false | null, title?: string | false | null, media?: string | false | null, rel?: string | false | null, type?: string | false | null, value: string | false | null, strategy?: "beforeInteractive" | "afterInteractive" | "lazy" | "shadow-dom", scope?: "content" | "fallback" | "all", [key: string]: any }} AssetCssLike
 * @typedef {{ value: string | null, crossorigin?: string | null | boolean, type?: string | null | false, integrity?: string | null | false, referrerpolicy?: string | null | false, nomodule?: boolean | null | '', async?: boolean | null | '', defer?: boolean | null | '', data?: {[key: string]: string} | Array<{ key: string; value: string }>, strategy?: "beforeInteractive" | "afterInteractive" | "lazy" | "shadow-dom", scope?: "content" | "fallback" | "all" | "shadow-dom", [key: string]: any }} AssetJsLike
 */

export default class PodiumPodlet {
    /**
     * Podium document template. A custom document template is set by using the .view() method in the podlet and layout modules.
     *
     * @see https://podium-lib.io/docs/api/document
     *
     * @example ```js
     * const podlet = new Podlet({ ... });
     * podlet.view(myDocumentTemplate);
     * ```
     */
    #view = template;

    /**
     * The name that the podlet identifies itself by. (set in the constructor) This is used internally for things like metrics but can also be used by a layout server.
     * This value must be in camelCase.
     *
     * @see https://podium-lib.io/docs/api/podlet/#name
     *
     * @example ```js
     * const podlet = new Podlet({ name: 'foo', ... });
     * podlet.name // foo
     * ```
     */
    name = '';

    /**
     * Pathname for where a podlet is mounted in an HTTP server.
     * It is important that this value matches where the entry point of a route is in an HTTP server since
     * this value is used to define where the manifest is for the podlet.
     * (set in the constructor)
     *
     * The podlet.pathname() method is used to access this property
     *
     * @see https://podium-lib.io/docs/api/podlet/#pathname
     */
    #pathname = '';

    /**
     * The current version of the podlet. (set in the constructor)
     * It is important that this value be updated when a new version of the podlet is deployed since the page (layout)
     * that the podlet is displayed in uses this value to know whether to refresh the podlet's manifest and fallback content or not.
     *
     * @see https://podium-lib.io/docs/api/podlet/#version
     *
     * @example ```js
     * const podlet = new Podlet({ version: '1.0.0', ... });
     * podlet.version // 1.0.0
     * ```
     */
    version = '';

    /**
     * The podlet development property (set in the constructor)
     * Used to make podlet development simple without the need to run a layout server locally
     * Do not run a podlet in development mode when deploying to production.
     *
     * @see https://podium-lib.io/docs/api/podlet/#development
     * @see https://podium-lib.io/docs/api/podlet/#development-mode
     *
     * @example ```js
     * const podlet = new Podlet({ development: true, ... });
     * podlet.development // true
     * ```
     */
    development = false;

    /**
     * A logger. The abstract logger "Abslog" is used to make it possible to provide different kinds of loggers.
     * The logger can be provided via the 'logger' constructor argument.
     *
     * @see https://www.npmjs.com/package/abslog
     *
     * @example ```js
     * const podlet = new Podlet({ logger: console, ... });
     * podlet.log.trace('trace log to the console')
     * podlet.log.debug('debug log to the console')
     * podlet.log.info('info log to the console')
     * podlet.log.warn('warn log to the console')
     * podlet.log.error('error log to the console')
     * podlet.log.fatal('fatal log to the console')
     * ```
     *
     * @type {import('abslog').ValidLogger}
     */
    log;

    /**
     * An instance of the `@podium/proxy` module
     * @see https://github.com/podium-lib/proxy
     */
    httpProxy;

    /**
     * The pathname for the manifest of the podlet. Defaults to "/manifest.json".
     * The value should be relative to the value set on the pathname argument.
     * In other words if a podlet is mounted into an HTTP server at /foo and the manifest is at /foo/component.json, pathname will be /foo and manifestRoute will be /component.json
     *
     * @see https://podium-lib.io/docs/api/podlet/#manifest
     *
     * @example ```js
     * const podlet = new Podlet({ manifest: '/manifest.json', ... });
     * podlet.manifestRoute // /manifest.json
     * ```
     */
    manifestRoute = '/manifest.json';

    /**
     * The pathname for the content route of the podlet. Defaults to "/".
     * The value should be relative to the value set on the pathname argument.
     * In other words if a podlet is mounted into an HTTP server at /foo and the content is at /foo/content, pathname will be /foo and contentRoute will be /content
     *
     * @see https://podium-lib.io/docs/api/podlet/#content
     *
     * @example ```js
     * const podlet = new Podlet({ content: '/foo', ... });
     * podlet.contentRoute // /foo
     * ```
     */
    contentRoute = '/';

    /**
     * The pathname for the fallback route of the podlet. Defaults to no fallback.
     * The value should be relative to the value set on the pathname argument.
     * In other words if a podlet is mounted into an HTTP server at /foo and the fallback is at /foo/fallback, pathname will be /foo and fallbackRoute will be /fallback
     *
     * @see https://podium-lib.io/docs/api/podlet/#fallback
     *
     * @example ```js
     * const podlet = new Podlet({ fallback: '/fallback', ... });
     * podlet.fallbackRoute // /fallback
     * ```
     */
    fallbackRoute = '';

    /**
     * An object that holds information about defined proxy routes. Proxy routes are defined using the podlet.proxy(...) method and up to 4 proxy routes
     * may be defined per podlet.
     *
     * @see https://podium-lib.io/docs/api/podlet#proxy-target-name-
     * @see https://podium-lib.io/docs/podlet/proxying
     *
     * @example ```js
     * const podlet = new Podlet({ ... });
     * podlet.proxy({ target: '/api', name: 'api' })
     * podlet.proxyRoutes // { api: '/api' }
     * ```
     *
     * @type {Record<string, string>}
     */
    proxyRoutes = {};

    /**
     * An object containing a set of Podium context values configured for podlet development.
     * This is necessary when the podlet is in development mode because requests do not come from a layout (which is what normally sends the context information)
     * These base context values can be overridden by providing a default context using the podlet.defaults() method
     * in which case the baseContext and the defaultContext will be merged together to provide the development context object.
     * This is not used at all when the podlet is not in development mode or when it is in development mode but the request to the podlet comes from a Podium layout.
     *
     * @see https://podium-lib.io/docs/podlet/context
     * @see https://podium-lib.io/docs/api/podlet#development-mode
     * @see https://podium-lib.io/docs/api/podlet#defaultscontext
     *
     * @example ```js
     * const podlet = new Podlet({ name: 'foo', pathname: '/bar', ... });
     * podlet.baseContext; // { debug: 'false', locale: 'en-US', deviceType: 'desktop', requestedBy: this.name, mountOrigin: '', mountPathname: '/bar', publicPathname: '/bar/podium-resource/foo' }
     * ```
     *
     * @type {PodletContext}
     */
    baseContext;

    /**
     * An object containing a set of Podium context values configured for podlet development.
     * This is necessary when the podlet is in development mode because requests do not come from a layout (which is what normally sends the context information)
     * These default context values override the `baseContext` values set by the package and can be set using the podlet.defaults() method
     * in which case the baseContext and the defaultContext will be merged together to provide the development context object.
     * This is not used at all when the podlet is not in development mode or when it is in development mode but the request to the podlet comes from a Podium layout.
     *
     * @see https://podium-lib.io/docs/podlet/context
     * @see https://podium-lib.io/docs/api/podlet#development-mode
     * @see https://podium-lib.io/docs/api/podlet#defaultscontext
     *
     * @example ```js
     * const podlet = new Podlet({ name: 'foo', pathname: '/bar', ... });
     * podlet.defaults({ debug: 'true', locale: 'nb' });
     * podlet.baseContext; // { debug: 'true', locale: 'nb', deviceType: 'desktop', requestedBy: this.name, mountOrigin: '', mountPathname: '/bar', publicPathname: '/bar/podium-resource/foo' }
     * ```
     *
     * @type {PodletContext}
     */
    defaultContext;

    /**
     * Property that holds the podlet's CSS asset references. Objects in the array are AssetCss instances. Asset references can be added using the podlet.css() method.
     *
     * @see https://podium-lib.io/docs/api/podlet/#cssoptionsoptions
     * @see https://podium-lib.io/docs/api/assets#assetcss
     * @see https://podium-lib.io/docs/api/assets
     *
     * @example ```js
     * const podlet = new Podlet({ ... });
     * podlet.css({ value: 'https://my.assets.com/styles.css' });
     * podlet.cssRoute // [ AssetCss{ value: 'https://my.assets.com/styles.css' } ]
     * ```
     *
     * @type {AssetCss[]}
     */
    cssRoute = [];

    /**
     * Property that holds the podlet's JS asset references. Objects in the array are AssetJs instances. Asset references can be added using the podlet.js() method.
     *
     * @see https://podium-lib.io/docs/api/podlet/#jsoptionsoptions
     * @see https://podium-lib.io/docs/api/assets#assetjs
     * @see https://podium-lib.io/docs/api/assets
     *
     * @example ```js
     * const podlet = new Podlet({ ... });
     * podlet.js({ value: 'https://my.assets.com/scripts.js' });
     * podlet.jsRoute // [ AssetJs{ value: 'https://my.assets.com/scripts.js' } ]
     * ```
     *
     * @type {AssetJs[]}
     */
    jsRoute = [];

    /**
     * Metrics client stream object that can be used to consume metrics out of a Podium podlet.
     * @see https://www.npmjs.com/package/@metrics/client for detailed documentation
     *
     * @example
     * ```js
     * const podlet = new Podlet(...);
     * podlet.metrics.pipe(...);
     * // or
     * podlet.metrics.on('data', chunk => { ... });
     * ```
     */
    metrics = new Metrics();

    /**
     * Boolean flag that, when true, enables the use of declarative ShadowDOM in the podlet.
     */
    #useShadowDOM = false;

    /**
     * Creates a new instance of a Podium podlet which can be used in conjunction with your framework of choice to build podlet server apps.
     * `name`, `version` and `pathname` constructor arguments are required. All other options are optional.
     *
     * * `name` - podlet name (**required**)
     * * `version` - podlet version (**required**)
     * * `pathname` - podlet pathname (**required**)
     * * `manifest` - path where the podlet manifest file is served from (**default** `'/manifest.json'`)
     * * `content` - path where the podlet content HTML markup is served from (**default** `'/'`)
     * * `fallback` - path where the podlet fallback HTML markup is served from (**default** `'/fallback'`)
     * * `development` - a boolean flag that, when true, enables additional development setup (**default** `false`)
     * * `useShadowDOM` - a boolean flag that, when true, enables the use of declarative ShadowDOM in the podlet (**default** `false`)
     * * `logger` - a logger to use when provided. Can be the console object if console logging is desired but can also be any Log4j compatible logging object as well. Nothing is logged if no logger is provided. (**default** `null`)
     * * `proxy` - options that can be provided to configure the @podium/proxy instance used by the podlet. See that module for details. (**default**: `{}`)
     *
     * @see https://podium-lib.io/docs/api/podlet/#constructor
     * @see https://podium-lib.io/docs/podlet/getting_started
     *
     * @param {PodletOptions} options
     *
     * @example
     * ```
     * const podlet = new Podlet({ name: 'foo', version: '1.0.0', pathname: '/' });
     * ```
     */
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
        useShadowDOM = false,
    }) {
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

        this.name = name;
        this.version = version;
        this.#pathname = this.#sanitize(pathname);
        this.manifestRoute = this.#sanitize(manifest);
        this.contentRoute = this.#sanitize(content);
        this.fallbackRoute = this.#sanitize(fallback);
        this.log = abslog(logger);
        this.development = development;
        this.httpProxy = new Proxy({
            pathname: this.#pathname,
            logger: this.log,
            ...proxy,
        });
        this.baseContext = {
            debug: 'false',
            locale: 'en-US',
            deviceType: 'desktop',
            requestedBy: this.name,
            mountOrigin: '',
            mountPathname: this.#pathname,
            publicPathname: pathnameBuilder(
                this.httpProxy.pathname,
                this.httpProxy.prefix,
                this.name,
            ),
        };
        this.#useShadowDOM = useShadowDOM;

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

            const podletGauge = this.metrics.gauge({
                name: 'podium_podlet_application_info',
                description: '@podium/podlet application info',
                labels: {
                    name: this.name,
                    version: this.version,
                    has_fallback: Boolean(fallback),
                },
            });

            podletGauge.set(1);
        });

        // @ts-ignore
        this.metrics.on('error', (error) => {
            this.log.error(
                'Error emitted by metric stream in @podium/podlet module',
                error,
            );
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumPodlet';
    }

    /**
     * Method that returns the pathname for where a podlet is mounted in an HTTP server.
     * It is important that this value matches where the entry point of a route is in an HTTP server since
     * this value is used to define where the manifest is for the podlet.
     * (set in the constructor)
     *
     * @see https://podium-lib.io/docs/api/podlet/#pathname
     *
     * @example
     * The method returns the value of `pathname` as defined in the podlet constructor
     * ```js
     * const podlet = new Podlet({ pathname: '/foo', ... });
     * podlet.pathname() // /foo
     * ```
     *
     * @example
     * This method is typically used when defining routes to ensure the pathname is prepended to any routes
     * ```js
     * const podlet = new Podlet({ pathname: '/foo', content: '/bar', ... });
     * app.get(podlet.pathname() + '/bar', (req, res) => res.podiumSend(...));
     * ```
     */
    pathname() {
        return this.#pathname;
    }

    /**
     * Method that returns the pathname for where a podlet's manifest route is to be mounted.
     * By default the podlet's pathname value is prepended to the manifest value.
     *
     * @example
     * Prefix is true by default which will prepend the pathname (/foo) in this example
     * ```js
     * const podlet = new Podlet({ pathname: '/foo', manifest: '/manifest.json', ... });
     * podlet.manifest() // /foo/manifest.json
     * podlet.manifest({ prefix: false }) // /manifest.json
     * ```
     *
     * @example
     * This method is typically used when defining the manifest route
     * ```js
     * const podlet = new Podlet({ ... });
     * app.get(podlet.manifest(), (req, res) => res.send(podlet));
     * ```
     *
     * @param {{ prefix?: boolean }} [options]
     * @returns {string}
     */
    manifest({ prefix = true } = {}) {
        return this.#sanitize(this.manifestRoute, prefix);
    }

    /**
     * Method that returns the pathname for where a podlet's content route is to be mounted.
     * By default the podlet's pathname value is prepended to the content value.
     *
     * @example
     * Prefix is true by default which will prepend the pathname (/foo) in this example
     * ```js
     * const podlet = new Podlet({ pathname: '/foo', content: '/', ... });
     * podlet.content() // /foo
     * podlet.content({ prefix: false }) // /
     * ```
     *
     * @example
     * This method is typically used when defining the content route
     * ```js
     * const podlet = new Podlet({ ... });
     * app.get(podlet.content(), (req, res) => res.podiumSend(...));
     * ```
     *
     * @param {{ prefix?: boolean }} [options]
     * @returns {string}
     */
    content({ prefix = true } = {}) {
        return this.#sanitize(this.contentRoute, prefix);
    }

    /**
     * Method that returns the pathname for where a podlet's fallback route is to be mounted.
     * By default the podlet's pathname value is prepended to the fallback value.
     *
     * @example
     * Prefix is true by default which will prepend the pathname (/foo) in this example
     * ```js
     * const podlet = new Podlet({ pathname: '/foo', fallback: '/fallback', ... });
     * podlet.fallback() // /foo/fallback
     * podlet.fallback({ prefix: false }) // /fallback
     * ```
     *
     * @example
     * This method is typically used when defining the fallback route
     * ```js
     * const podlet = new Podlet({ ... });
     * app.get(podlet.fallback(), (req, res) => res.podiumSend(...));
     * ```
     *
     * @param {{ prefix?: boolean }} [options]
     * @returns {string}
     */
    fallback({ prefix = true } = {}) {
        return this.#sanitize(this.fallbackRoute, prefix);
    }

    /**
     * Takes an AssetCss instance or an object with equivalent properties, converts it to an AssetCss instance if necessary and adds it to the
     * cssRoute array.
     * @param { AssetCss | AssetCssLike } options
     * @returns {AssetCss}
     */
    #cssAsset(options) {
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
        return new AssetCss(args);
    }

    /**
     * Method used to set CSS asset references for a podlet. Accepts an AssetCss object, a plain JS object with the same properties as an AssetCss object or
     * an array containing AssetCss or plain JS objects. Asset references set in this way can be accessed via `podlet.cssRoute` and
     * will be added to the podlet manifest file for sending to the layout
     *
     * @see https://podium-lib.io/docs/api/podlet/#cssoptionsoptions
     * @see https://podium-lib.io/docs/api/assets#assetcss
     * @see https://podium-lib.io/docs/api/assets
     *
     * @example ```js
     * const podlet = new Podlet({ ... });
     * podlet.css(new AssetCss{ value: 'https://my.assets.com/styles.css' });
     * podlet.css({ value: 'https://my.assets.com/styles.css' });
     * podlet.css([new AssetCss{ value: 'https://my.assets.com/styles.css' }, { value: 'https://my.assets.com/styles.css' }]);
     * ```
     *
     * @param { AssetCss | AssetCss[] | AssetCssLike | AssetCssLike[] } options
     * @returns {void}
     */
    css(options) {
        if (Array.isArray(options)) {
            for (const opts of options) {
                this.cssRoute.push(this.#cssAsset(opts));
            }
            return;
        }
        this.cssRoute.push(this.#cssAsset(options));
    }

    /**
     * Takes an AssetJs instance or an object with equivalent properties, converts it to an AssetJs instance if necessary and returns it.
     * @param { AssetJs | AssetJsLike } options
     * @returns {AssetJs}
     */
    #jsAsset(options) {
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

        if (args.data) {
            // validate that key value objects provided are compliant
            if (Array.isArray(args.data)) {
                for (const data of args.data) {
                    if (!data.key || !data.value) {
                        throw new TypeError(
                            `JS Asset data object "${JSON.stringify(data)}" must contain both a 'key' and a 'value' attribute.`,
                        );
                    }
                }
            }
            // Convert data attribute object structure to array of key value objects
            else if (typeof args.data === 'object') {
                const data = [];
                Object.keys(args.data).forEach((key) => {
                    data.push({
                        value: args.data[key],
                        key,
                    });
                });
                args.data = data;
            }
        }

        return new AssetJs(args);
    }

    /**
     * Method used to set JS asset references for a podlet. Accepts an AssetJs object, a plain JS object with the same properties as an AssetJs object or
     * an array containing AssetJs or plain JS objects. Asset references set in this way can be accessed via `podlet.jsRoute` and
     * will be added to the podlet manifest file for sending to the layout
     *
     * @see https://podium-lib.io/docs/api/podlet/#jsoptionsoptions
     * @see https://podium-lib.io/docs/api/assets#assetjs
     * @see https://podium-lib.io/docs/api/assets
     *
     * @example ```js
     * const podlet = new Podlet({ ... });
     * podlet.js(new AssetJs{ value: 'https://my.assets.com/scripts.js' });
     * podlet.js({ value: 'https://my.assets.com/scripts.js' });
     * podlet.js([new AssetJs{ value: 'https://my.assets.com/scripts.js' }, { value: 'https://my.assets.com/scripts.js' }]);
     * ```
     *
     * @param {AssetJs | AssetJs[] | AssetJsLike | AssetJsLike[] } [options]
     * @returns {void}
     */
    js(options) {
        if (Array.isArray(options)) {
            for (const opts of options) {
                this.jsRoute.push(this.#jsAsset(opts));
            }
            return;
        }
        this.jsRoute.push(this.#jsAsset(options));
    }

    /**
     * Method for defining proxy targets to be mounted in a layout server.
     * Accepts an object with `target` and `name` keys where target is the relative or absolute path to proxy requests to and name is an identifier
     * to distinguish it from other proxy endpoints. It's common to define a target of "/api" and a name of just "api". The method returns the target so that
     * it's possible to both define the proxy and the route at the same time.
     *
     * For a detailed overview of how proxying works, please see the proxying guide for further details.
     *
     * @see https://podium-lib.io/docs/podlet/proxying
     * @see https://podium-lib.io/docs/api/podlet#proxy-target-name-
     *
     * @example
     * ```js
     * podlet.proxy({ name: 'api', target: '/api' }); // returns /api
     * ```
     *
     * @example
     * Define the proxy and route at the same time
     * ```js
     * // proxy mounted at /api in the app
     * app.get(podlet.proxy({ name: 'api', target: '/api' }), (req, res) => res.sendStatus(200));
     * ```
     *
     * @param {{ target: string; name: string }} options
     * @returns {string}
     */
    proxy({ target, name }) {
        if (schema.uri(target).error)
            throw new Error(
                `Value on argument variable "target", "${target}", is not valid`,
            );

        if (schema.name(name).error)
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
            // @ts-ignore
            this.httpProxy.register(this.name, this.toJSON());
        }

        return target;
    }

    /**
     * Method to alter the default context set when in development mode.
     * In a production setup, this is not necessary since the context values are sent to the podlet from the layout.
     * By default, the context will contain the following context values, all of which can be overridden.
     *
     * * `debug:` 'false',
     * * `locale:` 'en-EN',
     * * `deviceType:` 'desktop',
     * * `requestedBy:` '<podlet name>',
     * * `mountOrigin:` 'http://localhost:port',
     * * `mountPathname:` '/<podlet pathname>',
     * * `publicPathname:` '/:pathname/podium_resource/:manifestname',
     *
     * @see https://podium-lib.io/docs/api/podlet#defaultscontext
     *
     * @example
     * Example of overriding deviceType
     * ```js
     * const podlet = new Podlet({ ... });
     * podlet.defaults({ deviceType: 'mobile' });
     * ```
     *
     * @param {any} context
     * @returns {any}
     */
    defaults(context = null) {
        if (context) {
            this.defaultContext = context;
        }
        return { ...this.baseContext, ...this.defaultContext };
    }

    /**
     * Method to set a Podium document template to be used when the podlet is in development mode.
     * Must be used in conjunction with with the `.podiumSend()` method or the `podlet.render()` in the content/fallback route to have any effect.
     * Has no effect when the podlet is not in development mode or if a request to the podlet comes from a Podium layout.
     *
     * @see https://podium-lib.io/docs/api/document
     *
     * @example
     * A document template can be provided using the podlet.view method
     * ```js
     * const podlet = new Podlet({ ... });
     * podlet.view(myDocumentTemplate);
     * ```
     *
     * @example
     * You need to call podiumSend or podlet.render to make use of the template you provided with podlet.view
     * ```js
     * app.get(podlet.content(), (req, res) => {
     *  res.podiumSend(`...podlet markup here...`);
     *  // or
     *  podlet.render(res.locals.podium, `...podlet markup here...`)
     * });
     * ```
     *
     * @template {{ [key: string]: unknown }} T
     * @param {( incoming: HttpIncoming<T>, fragment: string, ...args: unknown[]) => string} fn
     * @returns {void}
     */
    view(fn) {
        // @ts-ignore
        if (!utils.isFunction(fn)) {
            throw new Error(
                `Value on argument variable "template" must be a function`,
            );
        }
        this.#view = fn;
    }

    /**
     * Method for serialising the podlet instance into a plain JS object. Called automatically when stringifying the podlet with JSON.stringify(podlet).
     * Doing so will result in a correct Podium manifest file string and so is suitable for usage in a manifest route hook.
     *
     * @see https://podium-lib.io/docs/podlet/getting_started#step-7-create-a-manifest-route
     *
     * @example
     * ```js
     * app.get(podlet.manifest(), (req, res) => res.send(JSON.stringify(podlet)));
     * ```
     *
     * @example
     * In frameworks that automatically serialise JS objects, such as Express, you can omit JSON.stringify
     * ```js
     * app.get(podlet.manifest(), (req, res) => res.send(podlet));
     * ```
     */
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

    /**
     * Method to render the document template. Will, by default, render the document template provided by Podium unless a custom document template is set using the .view method.
     * In most HTTP frameworks this method can be ignored in favour of res.podiumSend().
     * If present, res.podiumSend() has the advantage that it's not necessary to pass in an HttpIncoming object as the first argument.
     *
     * @see https://podium-lib.io/docs/api/podlet#renderhttpincoming-fragment-args
     *
     * @example
     * ```js
     * app.get(podlet.content(), (req, res) => {
     *     const incoming = res.locals.podium;
     *     const document = podlet.render(incoming, '<div>content to render</div>');
     *     res.send(document);
     * });
     * ```
     *
     * @template {{ [key: string]: unknown }} T
     * @param {HttpIncoming<T>} incoming - Instance of Podium HttpIncoming object
     * @param {string} data - the podlet content as an HTML markup string
     * @param  {...any} args - additional args depending on the template and what values it accepts
     * @returns {string}
     */
    render(incoming, data, ...args) {
        const markup = this.#useShadowDOM ? this.wrapWithShadowDOM(data) : data;
        if (!incoming.development) {
            return markup;
        }
        return this.#view(incoming, markup, ...args);
    }

    /**
     * Function that takes in the podlet content,wraps it in declarative shadow DOM and returns it.
     * @param {string} data - the podlet content to wrap in declarative shadow DOM as an HTML markup string
     *
     * @example
     * ```js
     * const content = podlet.wrapWithShadowDOM('<div>content to render</div>');
     * ```
     */
    wrapWithShadowDOM(data) {
        assert.ok(
            customElementRegex.test(this.name),
            `When using the constructor argument "useShadowDOM" or the method podlet.wrapWithShadowDOM, podlet.name must conform to custom element naming conventions. The name "${this.name}" does not comply. See https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define#valid_custom_element_names for more information.`,
        );

        const styles = this.cssRoute
            .filter((css) => css.strategy === 'shadow-dom')
            .map((css) => css.toHTML());

        const scripts = this.jsRoute
            .filter((js) => js.strategy === 'shadow-dom')
            .map((js) => js.toHTML());

        // Wrap the markup in DSD.
        return `
          <${this.name}>
            <template shadowrootmode="open">
              ${styles.join('\n')}
              ${data}
              ${scripts.join('\n')}
            </template>
          </${this.name}>
          <script>(()=>{function e(d){HTMLTemplateElement.prototype.hasOwnProperty("shadowRootMode")||d.querySelectorAll("template[shadowrootmode]").forEach(o=>{let
          n=o.getAttribute("shadowrootmode"),s=o.hasAttribute("shadowrootdelegatesfocus"),t=o.parentNode.attachShadow({mode:n,delegatesFocus:s});t.appendChild(o.content),o.remove(),e(t)})}var
          r;(r=document.currentScript)!=null&&r.previousElementSibling&&e(document.currentScript.previousElementSibling);})();
          </script>
        `;
    }

    /**
     * Method for processing an incoming HTTP request. This method is intended to be used to implement support for multiple HTTP frameworks and in most cases will not need to be used directly by podlet developers when creating podlet servers.
     *
     * What it does:
     * * Handles detection of development mode and sets the appropriate defaults
     * * Runs context deserializing on the incoming request and sets a context object at HttpIncoming.context.
     * * Returns an HttpIncoming object.
     *
     * @see https://podium-lib.io/docs/api/podlet#processhttpincoming
     *
     * @param {HttpIncoming} incoming
     * @param {{ proxy?: boolean }} [options]
     * @returns {Promise<HttpIncoming>}
     */
    async process(incoming, { proxy = true } = {}) {
        incoming.name = this.name;
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
            // @ts-ignore
            incoming.context = utils.deserializeContext(
                incoming.request.headers,
            );
            this.log.debug(
                `Inbound request contains a context "${JSON.stringify(
                    incoming.context,
                )}"`,
            );
        }

        // Determine if the request should be proxied and do if so
        if (incoming.development && proxy) {
            // @ts-ignore
            await this.httpProxy.process(incoming);
        }

        return incoming;
    }

    /**
     * A Connect/Express compatible middleware function which takes care of the multiple operations needed for a podlet to operate correctly. This function is more or less a wrapper for the .process() method.
     * Returns an array of middleware that will create an HttpIncoming object and store it at res.locals.podium.
     *
     * **Important:** *This middleware must be mounted before defining any routes.*
     *
     * @see https://podium-lib.io/docs/api/podlet#middleware
     *
     * @example
     * ```js
     * const app = express();
     * app.use(podlet.middleware());
     * ```
     *
     * @returns {(req: any, res: any, next: function) => Promise<void>}
     */
    middleware() {
        return async (req, res, next) => {
            const incoming = new HttpIncoming(req, res, res.locals);
            // @ts-ignore
            incoming.url = new URL(
                req.originalUrl,
                `${req.protocol}://${req.get('host')}`,
            );

            try {
                await this.process(incoming);
                // if this is a proxy request then no further work should be done.
                if (incoming.proxy) return;

                const js = incoming.js.map(
                    // @ts-ignore
                    (asset) => asset.toHeader() + '; asset-type=script',
                );

                const css = incoming.css.map(
                    // @ts-ignore
                    (asset) => asset.toHeader() + '; asset-type=style',
                );

                res.header('Link', [...js, ...css].join(', '));

                // set "incoming" on res.locals.podium
                objobj.set('locals.podium', incoming, res);

                res.header('podlet-version', this.version);
                if (
                    req.path == this.contentRoute ||
                    req.path == this.fallbackRoute
                ) {
                    res.header('content-type', 'text/html');
                }

                res.sendHeaders = () => {
                    res.write('');
                    return res;
                };

                res.podiumSend = (data, ...args) => {
                    res.write(this.render(incoming, data, ...args));
                    res.end();
                };

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Sanitizes a uri and returns the resulting uri.
     * If prefix is true (default false) and the uri is relative, the podlet pathname will be prepended to the uri
     * @param {string} uri
     * @param {boolean} prefix
     * @returns {string}
     */
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

    /**
     * Determines the current scope, "content", "fallback" or "all" using url matching.
     * Scopes are used with asset objects that include a "scope" property
     *
     * @param {HttpIncoming} incoming
     * @returns {'fallback' | 'content' | 'all'}
     */
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
