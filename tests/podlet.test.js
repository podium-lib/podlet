import { destinationObjectStream } from '@podium/test-utils';
import { template, HttpIncoming, AssetJs, AssetCss } from '@podium/utils';
import stringify from 'json-stringify-safe';
import { join, dirname } from 'path';
import Metrics from '@metrics/client';
import tap from 'tap';
import express from 'express';
import http from 'http';
import url from 'url';
import fs from 'fs';
import { request } from 'undici';

import Podlet from '../lib/podlet.js';

const currentDirectory = dirname(url.fileURLToPath(import.meta.url));

const pkgJson = fs.readFileSync(
    join(currentDirectory, '../package.json'),
    'utf-8',
);
const pkg = JSON.parse(pkgJson);
const VERSION = pkg.version;

const SIMPLE_REQ = {
    headers: {},
};

const SIMPLE_RES = {
    locals: {},
    writeEarlyHints: () => {},
};

/**
 * Fake server utility
 * Spinns up a http server and attaches a Podlets instanse .middleware()
 * The .get() does a proper http request to the http server and returns
 * a JSON with the http headers sent by the server and the res.locals
 * object set by the Podlet instanse .middleware()
 */

class FakeHttpServer {
    /**
     * @param {{ podlet: Podlet, process?: { proxy: boolean } }} options
     * @param {(incoming: import('@podium/utils').HttpIncoming) => void} [onRequest]
     */
    constructor({ podlet, process }, onRequest) {
        this.app = http.createServer(async (req, res) => {
            const incoming = new HttpIncoming(req, res);
            const reslt = await podlet.process(incoming, process);
            onRequest
                ? onRequest(reslt)
                : (result) => {
                      result.response.status(200).json(result);
                  };
        });
        this.server = undefined;
        this.address = '';
    }

    listen() {
        return new Promise((resolve) => {
            this.server = this.app.listen(0, '0.0.0.0', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;
                resolve(this.address);
            });
        });
    }

    close() {
        return /** @type {Promise<void>} */ (
            new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            })
        );
    }

    get(options = {}) {
        const url = new URL(`${this.address}${options.pathname}`);
        return {
            async result() {
                const { statusCode, headers, body } = await request(url);
                return { statusCode, headers, body };
            },
        };
    }
}

class FakeExpressServer {
    /**
     * @param {Podlet} podlet
     * @param {(incoming: import('@podium/utils').HttpIncoming) => void} [onRequest]
     * @param {{ path: string; handler: import('express').Handler } | import('express').Handler} [onContentRoute]
     * @param {import('express').Handler} [onFallbackRoute]
     */
    constructor(podlet, onRequest, onContentRoute, onFallbackRoute) {
        this.app = express();
        this.app.use(podlet.middleware());
        if (onContentRoute) {
            if (typeof onContentRoute === 'function') {
                this.app.get(podlet.content({ prefix: true }), onContentRoute);
            } else {
                this.app.get(onContentRoute.path, onContentRoute.handler);
            }
        }
        if (onFallbackRoute)
            this.app.get(podlet.fallback({ prefix: true }), onFallbackRoute);
        this.app.use(
            onRequest ||
                ((req, res) => {
                    res.status(200).send(stringify(res.locals));
                }),
        );
        this.server = undefined;
        this.address = '';
    }

    listen() {
        return new Promise((resolve) => {
            this.server = this.app.listen(0, '0.0.0.0', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;
                resolve(this.address);
            });
        });
    }

    close() {
        return /** @type {Promise<void>} */ (
            new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            })
        );
    }

    get(options = {}) {
        return new Promise((resolve, reject) => {
            const opts = url.parse(this.address);
            Object.assign(opts, options);

            http.get(opts, (res) => {
                const chunks = [];
                options?.onHeaders && options.onHeaders(res.headers);
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve({
                        headers: res.headers,
                        // @ts-ignore
                        response: opts.raw
                            ? chunks.join('')
                            : JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
}

const DEFAULT_OPTIONS = { name: 'foo', version: 'v1.0.0', pathname: '/' };

// #############################################
// Constructor
// #############################################

tap.test(
    'Podlet() - instantiate new podlet object - should create an object',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        // expect(podlet).toBeInstanceOf(Podlet);
        t.ok(podlet instanceof Podlet);
        t.end();
    },
);

tap.test('Podlet() - object tag - should be PodiumPodlet', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.equal(Object.prototype.toString.call(podlet), '[object PodiumPodlet]');
    t.end();
});

tap.test('Podlet() - no value given to "name" argument - should throw', (t) => {
    t.throws(() => {
        // @ts-expect-error Testing bad input
        const podlet = new Podlet({ version: 'v1.0.0', pathname: '/' }); // eslint-disable-line no-unused-vars
    }, 'The value, "", for the required argument "name" on the Podlet constructor is not defined or not valid.');
    t.end();
});

tap.test(
    'Podlet() - invalid value given to "name" argument - should throw',
    (t) => {
        t.throws(() => {
            const options = {
                name: 'foo bar',
                version: 'v1.0.0',
                pathname: '/',
            };
            const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
        }, 'The value, "foo bar", for the required argument "name" on the Podlet constructor is not defined or not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - no value given to "version" argument - should throw',
    (t) => {
        t.throws(() => {
            // @ts-expect-error Testing bad input
            const podlet = new Podlet({ name: 'foo', pathname: '/' }); // eslint-disable-line no-unused-vars
        }, 'The value, "", for the required argument "version" on the Podlet constructor is not defined or not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - invalid value given to "version" argument - should throw',
    (t) => {
        t.throws(() => {
            const options = {
                name: 'foo',
                version: true,
                pathname: '/',
            };
            // @ts-expect-error Testing bad input
            const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
        }, 'The value, "true", for the required argument "version" on the Podlet constructor is not defined or not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - no value given to "pathname" argument - should throw',
    (t) => {
        t.throws(() => {
            // @ts-expect-error Testing bad input
            const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' }); // eslint-disable-line no-unused-vars
        }, 'The value, "", for the required argument "pathname" on the Podlet constructor is not defined or not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - invalid value given to "pathname" argument - should throw',
    (t) => {
        t.throws(() => {
            const options = {
                name: 'foo',
                version: 'v1.0.0',
                pathname: 'æ / ø',
            };
            const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
        }, 'The value, "æ / ø", for the required argument "pathname" on the Podlet constructor is not defined or not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - invalid value given to "manifest" argument - should throw',
    (t) => {
        t.throws(() => {
            const options = { manifest: 'æ / ø', ...DEFAULT_OPTIONS };
            const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
        }, 'The value, "æ / ø", for the optional argument "manifest" on the Podlet constructor is not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - invalid value given to "content" argument - should throw',
    (t) => {
        t.throws(() => {
            const options = { content: 'æ / ø', ...DEFAULT_OPTIONS };
            const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
        }, 'The value, "æ / ø", for the optional argument "content" on the Podlet constructor is not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - invalid value given to "fallback" argument - should throw',
    (t) => {
        t.throws(() => {
            const options = { fallback: 'æ / ø', ...DEFAULT_OPTIONS };
            const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
        }, 'The value, "æ / ø", for the optional argument "fallback" on the Podlet constructor is not valid.');
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set "name" to same as on constructor',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.equal(result.name, 'foo');
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set "version" to same as on constructor',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.equal(result.version, 'v1.0.0');
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set "content" to "/"',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.equal(result.content, '/');
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set "fallback" to empty String',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.equal(result.fallback, '');
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set ".js" to empty Array',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.same(result.js, []);
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set ".css" to empty Array',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.same(result.css, []);
        t.end();
    },
);

tap.test(
    'Podlet() - serialize default values - should set "proxy" to empty Object',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = JSON.parse(JSON.stringify(podlet));
        t.same(result.proxy, {});
        t.end();
    },
);

tap.test('Podlet() - should collect metric with version info', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const dest = destinationObjectStream((arr) => {
        t.equal(arr[0].name, 'podium_podlet_version_info');

        t.equal(arr[0].labels[0].name, 'version');
        t.equal(arr[0].labels[0].value, VERSION);

        t.equal(arr[0].labels[1].name, 'major');
        t.type(arr[0].labels[1].value, 'number');

        t.equal(arr[0].labels[2].name, 'minor');
        t.type(arr[0].labels[2].value, 'number');

        t.equal(arr[0].labels[3].name, 'patch');
        t.type(arr[0].labels[3].value, 'number');
        t.end();
    });

    podlet.metrics.pipe(dest);

    setImmediate(() => {
        dest.end();
    });
});

// #############################################
// .pathname()
// #############################################

tap.test('.pathname() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.pathname();
    t.equal(result, '/');
    t.end();
});

tap.test(
    '.pathname() - constructor has "pathname" set - should return set value',
    (t) => {
        const options = { ...DEFAULT_OPTIONS, pathname: '/foo' };
        const podlet = new Podlet(options);
        const result = podlet.pathname();
        t.equal(result, '/foo');
        t.end();
    },
);

// #############################################
// .manifest()
// #############################################

tap.test('.manifest() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.manifest();
    t.equal(result, '/manifest.json');
    t.end();
});

tap.test(
    '.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is default - should return "manifest" value',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            manifest: '/component.json',
        };
        const podlet = new Podlet(options);

        const result = podlet.manifest();
        t.equal(result, '/foo/component.json');
        t.end();
    },
);

tap.test(
    '.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is set "true" - should return "manifest" prefixed with "pathname"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            manifest: '/component.json',
        };
        const podlet = new Podlet(options);

        const result = podlet.manifest({ prefix: true });
        t.equal(result, '/foo/component.json');
        t.end();
    },
);

tap.test(
    '.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is set "false" - should return "manifest" without "pathname" prefix',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            manifest: '/component.json',
        };
        const podlet = new Podlet(options);

        const result = podlet.manifest({ prefix: false });
        t.equal(result, '/component.json');
        t.end();
    },
);

// #############################################
// .content()
// #############################################

tap.test('.content() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, '/');
    t.equal(parsed.content, '/');
    t.end();
});

tap.test(
    '.content() - constructor has "pathname" and "content" set - "prefix" argument is default - should return "content" value prefixed with "pathname"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            content: '/bar/foo.html',
        };
        const podlet = new Podlet(options);

        const result = podlet.content();
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, '/foo/bar/foo.html');
        t.equal(parsed.content, '/bar/foo.html');
        t.end();
    },
);

tap.test(
    '.content() - constructor has "pathname" and "content" set - "prefix" argument is set "true" - should return "content" prefixed with "pathname"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            content: '/bar/foo.html',
        };
        const podlet = new Podlet(options);

        const result = podlet.content({ prefix: true });
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, '/foo/bar/foo.html');
        t.equal(parsed.content, '/bar/foo.html');
        t.end();
    },
);

tap.test(
    '.content() - constructor has "pathname" and "content" set - "prefix" argument is set "false" - should return "content"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            content: '/bar/foo.html',
        };
        const podlet = new Podlet(options);

        const result = podlet.content({ prefix: false });
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, '/bar/foo.html');
        t.equal(parsed.content, '/bar/foo.html');
        t.end();
    },
);

tap.test(
    '.content() - constructor has "content" set with absolute URI - should return absolute URI',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            content: 'http://somewhere.remote.com',
        };
        const podlet = new Podlet(options);

        const result = podlet.content();
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, 'http://somewhere.remote.com');
        t.equal(parsed.content, 'http://somewhere.remote.com');
        t.end();
    },
);

// #############################################
// .fallback()
// #############################################

tap.test('.fallback() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, '');
    t.equal(parsed.fallback, '');
    t.end();
});

tap.test(
    '.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is default - should return "fallback" value prefixed with "pathname"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            fallback: '/bar/foo.html',
        };
        const podlet = new Podlet(options);

        const result = podlet.fallback();
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, '/foo/bar/foo.html');
        t.equal(parsed.fallback, '/bar/foo.html');
        t.end();
    },
);

tap.test(
    '.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is set "true" - should return "fallback" prefixed with "pathname"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            fallback: '/bar/foo.html',
        };
        const podlet = new Podlet(options);

        const result = podlet.fallback({ prefix: true });
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, '/foo/bar/foo.html');
        t.equal(parsed.fallback, '/bar/foo.html');
        t.end();
    },
);

tap.test(
    '.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is set "false" - should return "fallback"',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            pathname: '/foo',
            fallback: '/bar/foo.html',
        };
        const podlet = new Podlet(options);

        const result = podlet.fallback({ prefix: false });
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, '/bar/foo.html');
        t.equal(parsed.fallback, '/bar/foo.html');
        t.end();
    },
);

tap.test(
    '.fallback() - constructor has "fallback" set with absolute URI - should return absolute URI',
    (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            fallback: 'http://somewhere.remote.com',
        };
        const podlet = new Podlet(options);

        const result = podlet.fallback();
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(result, 'http://somewhere.remote.com');
        t.equal(parsed.fallback, 'http://somewhere.remote.com');
        t.end();
    },
);

// #############################################
// .css()
// #############################################

tap.test('.css() - call method with no arguments - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        // @ts-expect-error Testing bad input
        podlet.css();
    }, 'Value for argument variable "value", "undefined", is not valid');
    t.end();
});

tap.test(
    '.css() - set legal absolute value on "value" argument - should set "css" to set value when serializing Object',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.css({ value: 'http://somewhere.remote.com' });
        const result = JSON.parse(JSON.stringify(podlet));
        t.same(result.css, [
            {
                rel: 'stylesheet',
                type: 'text/css',
                value: 'http://somewhere.remote.com',
            },
        ]);
        t.end();
    },
);

tap.test(
    '.css() - set legal relative value on "value" argument and "pathname" defined - should set "css" to set value with prefix prepended',
    (t) => {
        const podlet = new Podlet({ ...DEFAULT_OPTIONS, pathname: '/foo' });
        podlet.css({ value: '/styles.css' });

        const result = JSON.parse(JSON.stringify(podlet));
        t.same(result.css, [
            {
                rel: 'stylesheet',
                type: 'text/css',
                value: '/styles.css',
            },
        ]);
        t.equal(podlet.cssRoute[0].value, '/foo/styles.css');
        t.end();
    },
);

tap.test('.css() - call method twice - should set value twice', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/foo/bar' });
    podlet.css({ value: '/bar/foo' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.css, [
        { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
        { rel: 'stylesheet', type: 'text/css', value: '/bar/foo' },
    ]);
    t.end();
});

tap.test('.css() - should accept additional keys', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/foo/bar', fake: 'prop' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.css, [
        { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
    ]);
    t.end();
});

tap.test(
    '.css() - "options" argument as an array - should accept an array of values',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.css([{ value: '/foo/bar' }, { value: '/bar/foo' }]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.css, [
            { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
            { rel: 'stylesheet', type: 'text/css', value: '/bar/foo' },
        ]);
        t.end();
    },
);

tap.test(
    '.css() - "options" argument as an array - call method twice - should set all values',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.css([{ value: '/foo/bar' }, { value: '/bar/foo' }]);
        podlet.css([{ value: '/foo/bar/baz' }, { value: '/bar/foo/baz' }]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.css, [
            { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
            { rel: 'stylesheet', type: 'text/css', value: '/bar/foo' },
            { rel: 'stylesheet', type: 'text/css', value: '/foo/bar/baz' },
            { rel: 'stylesheet', type: 'text/css', value: '/bar/foo/baz' },
        ]);
        t.end();
    },
);

tap.test(
    '.css() - "options" argument as an array - should NOT set additional keys',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.css([
            { value: '/foo/bar', fake: 'prop' },
            { value: '/bar/foo', prop: 'fake' },
        ]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.css, [
            { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
            { rel: 'stylesheet', type: 'text/css', value: '/bar/foo' },
        ]);
        t.end();
    },
);

// #############################################
// .js()
// #############################################

tap.test('.js() - call method with no arguments - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.js();
    }, 'Value for argument variable "value", "undefined", is not valid');
    t.end();
});

tap.test(
    '.js() - set legal absolute value on "value" argument - should set "js" to set value when serializing Object',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js({ value: 'http://somewhere.remote.com' });

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.js, [
            { type: 'default', value: 'http://somewhere.remote.com' },
        ]);
        t.end();
    },
);

tap.test('.js() - call method twice - should set value twice', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar' });
    podlet.js({ value: '/bar/foo' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [
        { type: 'default', value: '/foo/bar' },
        { type: 'default', value: '/bar/foo' },
    ]);
    t.end();
});

tap.test('.js() - should NOT accept additional keys', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar', fake: 'prop' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [{ type: 'default', value: '/foo/bar' }]);
    t.end();
});

tap.test(
    '.js() - "type" argument is set to "module" - should set "type" to "module"',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js({ value: '/foo/bar' });
        podlet.js({ value: '/bar/foo', type: 'module' });

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.js, [
            { type: 'default', value: '/foo/bar' },
            { type: 'module', value: '/bar/foo' },
        ]);
        t.end();
    },
);

tap.test(
    '.js() - "options" argument as an array - should accept an array of values',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js([
            { value: '/foo/bar' },
            { value: '/bar/foo', type: 'module' },
        ]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.js, [
            { type: 'default', value: '/foo/bar' },
            { type: 'module', value: '/bar/foo' },
        ]);
        t.end();
    },
);

tap.test(
    '.js() - "options" argument as an array - call method twice - should set all values',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js([
            { value: '/foo/bar' },
            { value: '/bar/foo', type: 'module' },
        ]);
        podlet.js([
            { value: '/foo/bar/baz' },
            { value: '/bar/foo/baz', type: 'module' },
        ]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.js, [
            { type: 'default', value: '/foo/bar' },
            { type: 'module', value: '/bar/foo' },
            { type: 'default', value: '/foo/bar/baz' },
            { type: 'module', value: '/bar/foo/baz' },
        ]);
        t.end();
    },
);

tap.test(
    '.js() - "options" argument as an array - should NOT set additional keys',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js([
            { value: '/foo/bar', fake: 'prop' },
            { value: '/bar/foo', type: 'module', prop: 'fake' },
        ]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.js, [
            { type: 'default', value: '/foo/bar' },
            { type: 'module', value: '/bar/foo' },
        ]);
        t.end();
    },
);

tap.test(
    '.js() - data attribute object - should convert to array of key / value objects',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js([
            {
                value: '/foo/bar',
                data: {
                    bar: 'a',
                    foo: 'b',
                },
            },
        ]);

        const result = JSON.parse(JSON.stringify(podlet));

        t.same(result.js, [
            {
                type: 'default',
                value: '/foo/bar',
                data: [
                    {
                        key: 'bar',
                        value: 'a',
                    },
                    {
                        key: 'foo',
                        value: 'b',
                    },
                ],
            },
        ]);
        t.end();
    },
);

// #############################################
// .process()
// #############################################

tap.test(
    '.process() - call method with HttpIncoming - should return HttpIncoming',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const incoming = new HttpIncoming(SIMPLE_REQ, SIMPLE_RES);
        const result = await podlet.process(incoming);
        t.same(result, incoming);
    },
);

tap.test(
    '.process() - .process(HttpIncoming, { proxy: true }) - request to proxy path - should do proxying',
    async (t) => {
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });
        const process = { proxy: true };

        // Proxy path is now: /podium-resource/foo/bar
        podlet.proxy({ target: '/bar', name: 'bar' });

        const server = new FakeHttpServer({ podlet, process }, (incoming) => {
            if (incoming.url.pathname === '/podium-resource/foo/bar') {
                t.ok(incoming.proxy);
                if (incoming.proxy) return;
            }

            incoming.response.statusCode = 200;
            incoming.response.end('OK');
        });

        await server.listen();
        const res = server.get({ pathname: '/podium-resource/foo/bar' });
        await res.result();
        await server.close();
    },
);

tap.test(
    '.process() - .process(HttpIncoming, { proxy: false }) - request to proxy path - should not do proxying',
    async (t) => {
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });
        const process = { proxy: false };

        // Proxy path is now: /podium-resource/foo/bar
        podlet.proxy({ target: '/bar', name: 'bar' });

        const server = new FakeHttpServer({ podlet, process }, (incoming) => {
            if (incoming.url.pathname === '/podium-resource/foo/bar') {
                t.notOk(incoming.proxy);
                if (incoming.proxy) return;
            }

            incoming.response.statusCode = 200;
            incoming.response.end('OK');
        });

        await server.listen();
        const res = server.get({ pathname: '/podium-resource/foo/bar' });
        await res.result();
        await server.close();
    },
);

// #############################################
// .middleware()
// #############################################

tap.test(
    '.middleware() - call method - should append podlet name on "res.locals.podium.name"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.equal(result.response.podium.name, DEFAULT_OPTIONS.name);

        await server.close();
    },
);

tap.test(
    '.middleware() - .css() is NOT set with a value - should append empty Array to "res.locals.podium.css"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.same(result.response.podium.css, []);

        await server.close();
    },
);

tap.test(
    '.middleware() - .css() is set with a value - should append value to "res.locals.podium.css"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.css({ value: '/style.css' });

        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        const parsed = JSON.parse(JSON.stringify(podlet));
        t.same(result.response.podium.css, parsed.css);

        await server.close();
    },
);

tap.test(
    '.middleware() - .js() is NOT set with a value - should append empty Array to "res.locals.podium.js"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.same(result.response.podium.js, []);

        await server.close();
    },
);

tap.test(
    '.middleware() - .js() is set with a value - should append value to "res.locals.podium.js"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.js({ value: '/script.js' });

        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.same(result.response.podium.js, parsed.js);

        await server.close();
    },
);

tap.test(
    '.js() - passing an instance of AssetsJs - should return set value',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);

        podlet.js(new AssetJs({ value: '/foo/bar', type: 'module' }));
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(parsed.js[0].value, '/foo/bar');
        t.end();
    },
);

tap.test(
    '.css() - passing an instance of AssetsCss - should return set value',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);

        podlet.css(new AssetCss({ value: '/foo/bar', type: 'text/css' }));
        const parsed = JSON.parse(JSON.stringify(podlet));

        t.equal(parsed.css[0].value, '/foo/bar');
        t.end();
    },
);

tap.test(
    '.middleware() - contructor argument "development" is NOT set and "user-agent" on request is NOT set to "@podium/client" - should append "false" value on "res.locals.podium.decorate"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.notOk(result.response.podium.development);

        await server.close();
    },
);

tap.test(
    '.middleware() - contructor argument "development" is set to "true" and "user-agent" on request is set to "@podium/client" - should append "false" value on "res.locals.podium.decorate"',
    async (t) => {
        const options = { ...DEFAULT_OPTIONS, development: true };
        const podlet = new Podlet(options);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get({
            headers: {
                'user-agent': '@podium/client',
            },
        });
        t.notOk(result.response.podium.development);

        await server.close();
    },
);

tap.test(
    '.middleware() - contructor argument "development" is set to "true" and "user-agent" on request is NOT set to "@podium/client" - should append "true" value on "res.locals.podium.decorate"',
    async (t) => {
        const options = { ...DEFAULT_OPTIONS, development: true };
        const podlet = new Podlet(options);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.ok(result.response.podium.development);

        await server.close();
    },
);

tap.test(
    '.middleware() - valid "version" value is set on constructor - should append "podlet-version" http header with the given version value',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.equal(result.headers['podlet-version'], 'v1.0.0');

        await server.close();
    },
);

// #############################################
// .res.podiumSend()
// #############################################

tap.test(
    'res.podiumSend() - .podiumSend() method - should be a function on http.response',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet, (req, res) => {
            t.type(res.podiumSend, 'function');
            res.json({});
        });

        await server.listen();
        await server.get();
        await server.close();
    },
);

tap.test(
    'res.podiumSend() - contructor argument "development" is NOT set to "true" - should NOT append default wireframe document',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        t.equal(result.response, '<h1>OK!</h1>');
        await server.close();
    },
);

tap.test(
    'res.podiumSend() - contructor argument "development" is set to "true" - should append default wireframe document',
    async (t) => {
        const options = { ...DEFAULT_OPTIONS, development: true };
        const podlet = new Podlet(options);
        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        const incoming = new HttpIncoming(SIMPLE_REQ, SIMPLE_RES);
        t.equal(result.response, template(incoming, '<h1>OK!</h1>'));

        await server.close();
    },
);

// #############################################
// .defaults()
// #############################################

tap.test(
    '.defaults() - call method with no arguments - should return default value',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = podlet.defaults();
        t.same(result, {
            debug: 'false',
            deviceType: 'desktop',
            locale: 'en-US',
            mountOrigin: '',
            mountPathname: '/',
            publicPathname: '/podium-resource/foo',
            requestedBy: 'foo',
        });
        t.end();
    },
);

tap.test(
    '.defaults() - set value on "context" argument - should return set value',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = podlet.defaults({ foo: 'bar' });
        t.same(result, {
            debug: 'false',
            deviceType: 'desktop',
            foo: 'bar',
            locale: 'en-US',
            mountOrigin: '',
            mountPathname: '/',
            publicPathname: '/podium-resource/foo',
            requestedBy: 'foo',
        });
        t.end();
    },
);

tap.test(
    '.defaults() - call method with "context" argument, then call it a second time with no argument - should return first set value on second call',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        podlet.defaults({ foo: 'bar' });
        const result = podlet.defaults();
        t.same(result, {
            debug: 'false',
            deviceType: 'desktop',
            foo: 'bar',
            locale: 'en-US',
            mountOrigin: '',
            mountPathname: '/',
            publicPathname: '/podium-resource/foo',
            requestedBy: 'foo',
        });
        t.end();
    },
);

tap.test(
    '.defaults() - constructor argument "development" is not set - should not append a default context to "res.locals"',
    async (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const server = new FakeExpressServer(podlet);
        await server.listen();

        const result = await server.get();
        t.same(result.response.podium.context, {});

        await server.close();
    },
);

tap.test(
    '.defaults() - constructor argument "development" is to "true" - should append a default context to "res.locals"',
    async (t) => {
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });
        const server = new FakeExpressServer(podlet);
        const address = await server.listen();
        const result = await server.get();

        t.equal(result.response.podium.context.debug, 'false');
        t.equal(result.response.podium.context.locale, 'en-US');
        t.equal(result.response.podium.context.deviceType, 'desktop');
        t.equal(result.response.podium.context.requestedBy, 'foo');
        t.equal(result.response.podium.context.mountOrigin, address);
        t.equal(result.response.podium.context.mountPathname, '/');
        t.equal(
            result.response.podium.context.publicPathname,
            '/podium-resource/foo',
        );

        await server.close();
    },
);

tap.test(
    '.defaults() - set "context" argument where a key overrides one existing context value - should override default context value but keep rest untouched',
    async (t) => {
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });
        podlet.defaults({
            locale: 'no-NO',
        });
        const server = new FakeExpressServer(podlet);
        const address = await server.listen();
        const result = await server.get();

        t.equal(result.response.podium.context.debug, 'false');
        t.equal(result.response.podium.context.locale, 'no-NO');
        t.equal(result.response.podium.context.deviceType, 'desktop');
        t.equal(result.response.podium.context.requestedBy, 'foo');
        t.equal(result.response.podium.context.mountOrigin, address);
        t.equal(result.response.podium.context.mountPathname, '/');
        t.equal(
            result.response.podium.context.publicPathname,
            '/podium-resource/foo',
        );

        await server.close();
    },
);

tap.test(
    '.defaults() - set "context" argument where a key is not a default context value - should append key and value to default context',
    async (t) => {
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });
        podlet.defaults({
            foo: 'bar',
        });
        const server = new FakeExpressServer(podlet);
        const address = await server.listen();
        const result = await server.get();

        t.equal(result.response.podium.context.foo, 'bar');
        t.equal(result.response.podium.context.debug, 'false');
        t.equal(result.response.podium.context.locale, 'en-US');
        t.equal(result.response.podium.context.deviceType, 'desktop');
        t.equal(result.response.podium.context.requestedBy, 'foo');
        t.equal(result.response.podium.context.mountOrigin, address);
        t.equal(result.response.podium.context.mountPathname, '/');
        t.equal(
            result.response.podium.context.publicPathname,
            '/podium-resource/foo',
        );

        await server.close();
    },
);

// #############################################
// .proxy()
// #############################################

tap.test('.proxy() - no arguments - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        // @ts-expect-error Testing bad input
        podlet.proxy();
    }, 'Value on argument variable "target", "null", is not valid');
    t.end();
});

tap.test(
    '.proxy() - set a non valid "target" argument value - should throw',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        t.throws(() => {
            podlet.proxy({ target: 'æøå æåø', name: 'foo' });
        }, 'Value on argument variable "target", "æøå æåø", is not valid');
        t.end();
    },
);

tap.test(
    '.proxy() - set a non valid "name" argument value - should throw',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        t.throws(() => {
            podlet.proxy({ target: '/foo', name: 'æøå æåø' });
        }, 'Value on argument variable "name", "æøå æåø", is not valid');
        t.end();
    },
);

tap.test('.proxy() - set more than 4 proxy entries - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.proxy({ target: '/foo1', name: 'foo1' });
        podlet.proxy({ target: '/foo2', name: 'foo2' });
        podlet.proxy({ target: '/foo3', name: 'foo3' });
        podlet.proxy({ target: '/foo4', name: 'foo4' });
        podlet.proxy({ target: '/foo5', name: 'foo5' });
    }, 'One can not define more than 4 proxy targets for each podlet');
    t.end();
});

tap.test(
    '.proxy() - set valid "name" and "target" - should return target',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        const result = podlet.proxy({ target: '/foo', name: 'foo' });
        t.equal(result, '/foo');
        t.end();
    },
);

// #############################################
// .view()
// #############################################

tap.test('.view() - set a non valid argument value - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        // @ts-expect-error Testing bad input
        podlet.view('test');
    }, 'Value on argument variable "template" must be a function');
    t.end();
});

tap.test(
    '.view() - append a custom wireframe document - should render development output with custom wireframe document',
    async (t) => {
        const options = { ...DEFAULT_OPTIONS, development: true };

        const podlet = new Podlet(options);
        podlet.view((incoming, data) => `<div>${data}</div>`);

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        t.equal(result.response, '<div><h1>OK!</h1></div>');
        await server.close();
    },
);

tap.test(
    '.view() - append a custom wireframe document - should render development output with custom wireframe document',
    async (t) => {
        const options = { ...DEFAULT_OPTIONS, development: true };

        const podlet = new Podlet(options);
        podlet.view(
            (incoming, data) =>
                `<div data-foo="${incoming.params.foo}">${data}</div>`,
        );

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.locals.foo = 'bar';
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        t.equal(result.response, '<div data-foo="bar"><h1>OK!</h1></div>');
        await server.close();
    },
);

// #############################################
// .metrics()
// #############################################

tap.test(
    '.metrics - assigned object to property - should be instance of @metrics/client',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        t.ok(podlet.metrics instanceof Metrics);
        t.end();
    },
);

tap.test(
    '.metrics - assigned object to property - should have object tag with "Metrics" as name',
    (t) => {
        const podlet = new Podlet(DEFAULT_OPTIONS);
        t.equal(
            Object.prototype.toString.call(podlet.metrics),
            '[object MetricsClient]',
        );
        t.end();
    },
);

// #############################################
// scope
// #############################################

tap.test('Asset scope filtering - pathname and content both "/"', async (t) => {
    t.plan(2);
    const podlet = new Podlet({
        name: 'test',
        version: '1.0.0',
        pathname: '/',
        content: '/',
    });
    podlet.js([
        new AssetJs({ value: '/foo', scope: 'content' }),
        new AssetJs({ value: '/bar', scope: 'fallback' }),
        new AssetJs({ value: '/baz', scope: 'all' }),
        new AssetJs({ value: '/foobar' }),
    ]);

    const server = new FakeExpressServer(podlet, async (req, res) => {
        t.equal(res.locals.podium.js.length, 3);
        t.equal(res.locals.podium.js[0].scope, 'content');
        res.send({ ok: true });
    });

    await server.listen();
    await server.get();
    await server.close();
    t.end();
});

tap.test(
    'Asset scope filtering - pathname "/" and fallback "/fallback"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/',
            fallback: '/fallback',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(
            podlet,
            null,
            null,
            async (req, res) => {
                t.equal(res.locals.podium.js.length, 3);
                t.equal(res.locals.podium.js[0].scope, 'fallback');
                res.send({ ok: true });
            },
        );

        await server.listen();
        await server.get({ path: '/fallback' });
        await server.close();
        t.end();
    },
);

tap.test(
    'Asset scope filtering - pathname "/" and content "/content"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/',
            content: '/content',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(podlet, null, async (req, res) => {
            t.equal(res.locals.podium.js.length, 3);
            t.equal(res.locals.podium.js[0].scope, 'content');
            res.send({ ok: true });
        });

        await server.listen();
        await server.get({ path: '/content' });
        await server.close();
        t.end();
    },
);

tap.test(
    'Asset scope filtering - pathname "/foo" and content "/"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/foo',
            content: '/',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(podlet, null, async (req, res) => {
            t.equal(res.locals.podium.js.length, 3);
            t.equal(res.locals.podium.js[0].scope, 'content');
            res.send({ ok: true });
        });

        await server.listen();
        await server.get({ path: '/foo' });
        await server.close();
        t.end();
    },
);

tap.test(
    'Asset scope filtering - pathname "/foo" and content "/bar"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/foo',
            content: '/content',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(podlet, null, async (req, res) => {
            t.equal(res.locals.podium.js.length, 3);
            t.equal(res.locals.podium.js[0].scope, 'content');
            res.send({ ok: true });
        });

        await server.listen();
        await server.get({ path: '/foo/content' });
        await server.close();
        t.end();
    },
);

tap.test(
    'Asset scope filtering - pathname "/foo" and fallback "/"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/foo',
            content: '/content',
            fallback: '/',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(podlet, null, async (req, res) => {
            t.equal(res.locals.podium.js.length, 3);
            t.equal(res.locals.podium.js[0].scope, 'content');
            res.send({ ok: true });
        });

        await server.listen();
        await server.get({ path: '/foo/content' });
        await server.close();
        t.end();
    },
);

tap.test('Asset scope filtering - fallback "/"', async (t) => {
    t.plan(2);
    const podlet = new Podlet({
        name: 'test',
        version: '1.0.0',
        pathname: '/',
        content: '/content',
        fallback: '/',
    });
    podlet.js([
        new AssetJs({ value: '/foo', scope: 'content' }),
        new AssetJs({ value: '/bar', scope: 'fallback' }),
        new AssetJs({ value: '/baz', scope: 'all' }),
        new AssetJs({ value: '/foobar' }),
    ]);

    const server = new FakeExpressServer(
        podlet,
        null,
        null,
        async (req, res) => {
            t.equal(res.locals.podium.js.length, 3);
            t.equal(res.locals.podium.js[0].scope, 'fallback');
            res.send({ ok: true });
        },
    );

    await server.listen();
    await server.get();
    await server.close();
    t.end();
});

tap.test(
    'Asset scope filtering - pathname "/foo" and fallback "/"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/foo',
            content: '/content',
            fallback: '/',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(
            podlet,
            null,
            null,
            async (req, res) => {
                t.equal(res.locals.podium.js.length, 3);
                t.equal(res.locals.podium.js[0].scope, 'fallback');
                res.send({ ok: true });
            },
        );

        await server.listen();
        await server.get({ path: '/foo' });
        await server.close();
        t.end();
    },
);

tap.test(
    'Asset scope filtering - pathname "/" and content with dynamic path "/:id"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/',
            content: '/',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(podlet, null, {
            path: '/:id',
            handler: async (req, res) => {
                t.equal(res.locals.podium.js.length, 3);
                t.equal(res.locals.podium.js[0].scope, 'content');
                res.send({ ok: true });
            },
        });

        await server.listen();
        await server.get({ path: '/1234' });
        await server.close();
        t.end();
    },
);

tap.test(
    'Asset scope filtering - pathname "/foo" and content with dynamic path "/:id"',
    async (t) => {
        t.plan(2);
        const podlet = new Podlet({
            name: 'test',
            version: '1.0.0',
            pathname: '/foo',
            content: '/',
        });
        podlet.js([
            new AssetJs({ value: '/foo', scope: 'content' }),
            new AssetJs({ value: '/bar', scope: 'fallback' }),
            new AssetJs({ value: '/baz', scope: 'all' }),
            new AssetJs({ value: '/foobar' }),
        ]);

        const server = new FakeExpressServer(podlet, null, {
            path: '/foo/:id',
            handler: async (req, res) => {
                t.equal(res.locals.podium.js.length, 3);
                t.equal(res.locals.podium.js[0].scope, 'content');
                res.send({ ok: true });
            },
        });

        await server.listen();
        await server.get({ path: '/foo/1234' });
        await server.close();
        t.end();
    },
);

// #############################################
// Asset sending using Link header
// #############################################

tap.test('assets - .js() - should send Link header', async (t) => {
    t.plan(1);
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });

    podlet.js({
        value: '/scripts.js',
        type: 'module',
        async: true,
        data: { foo: 'bar' },
    });

    const server = new FakeExpressServer(podlet, (req, res) => {
        res.podiumSend('<h1>OK!</h1>');
    });

    await server.listen();
    const result = await server.get({ raw: true });

    t.equal(
        result.headers.link,
        '</scripts.js>; async=true; type=module; data-foo=bar; asset-type=script',
    );
    await server.close();
});

tap.test('assets - .css() - should send assets respecting scope', async (t) => {
    t.plan(1);
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });

    podlet.css([
        { value: '/styles1.css', scope: 'content' },
        { value: '/styles2.css', scope: 'fallback' },
    ]);

    const server = new FakeExpressServer(podlet, (req, res) => {
        res.podiumSend('<h1>OK!</h1>');
    });

    await server.listen();
    const result = await server.get({ raw: true });
    t.equal(
        result.headers.link,
        '</styles1.css>; type=text/css; rel=stylesheet; scope=content; asset-type=style',
    );
    await server.close();
});

tap.test(
    'assets - .css() - should send assets using Link header respecting scope - fallback',
    async (t) => {
        t.plan(1);
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
            fallback: '/fallback',
        });

        podlet.css([
            { value: '/styles1.css', scope: 'content' },
            { value: '/styles2.css', scope: 'fallback' },
        ]);

        const server = new FakeExpressServer(
            podlet,
            undefined,
            undefined,
            (req, res) => {
                res.podiumSend('<h1>OK!</h1>');
            },
        );

        await server.listen();
        const result = await server.get({ path: '/fallback', raw: true });
        t.equal(
            result.headers.link,
            '</styles2.css>; type=text/css; rel=stylesheet; scope=fallback; asset-type=style',
        );
        await server.close();
    },
);

tap.test(
    'assets - .js() and .css() - should send assets using Link header',
    async (t) => {
        t.plan(1);
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });

        podlet.js({
            value: '/scripts.js',
            type: 'module',
            async: true,
            data: [{ key: 'foo', value: 'bar' }],
            scope: 'content',
        });
        podlet.css({ value: '/styles.css', scope: 'content' });

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });
        t.equal(
            result.headers.link,
            '</scripts.js>; async=true; type=module; data-foo=bar; scope=content; asset-type=script, </styles.css>; type=text/css; rel=stylesheet; scope=content; asset-type=style',
        );
        await server.close();
    },
);

tap.test(
    'assets - .js() and .css() - Link headers - should be sent before body',
    async (t) => {
        t.plan(4);
        const podlet = new Podlet({
            name: 'foo',
            version: 'v1.0.0',
            pathname: '/',
            development: true,
        });

        podlet.js({
            value: '/scripts.js',
            type: 'module',
            async: true,
            data: [{ key: 'foo', value: 'bar' }],
            scope: 'content',
        });
        podlet.css({ value: '/styles.css', scope: 'content' });

        const orderArray = [];

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.sendHeaders();
            setTimeout(() => {
                res.podiumSend('<h1>OK!</h1>');
            }, 1000);
        });

        await server.listen();
        let start = 0;
        const result = await server.get({
            raw: true,
            onHeaders(headers) {
                t.equal(
                    headers.link,
                    '</scripts.js>; async=true; type=module; data-foo=bar; scope=content; asset-type=script, </styles.css>; type=text/css; rel=stylesheet; scope=content; asset-type=style',
                );
                orderArray.push('assets');
                start = Date.now();
            },
        });
        const timeTaken = Date.now() - start;
        orderArray.push('body');
        t.match(result.response, /<h1>OK!<\/h1>/);
        t.same(orderArray, ['assets', 'body']);
        t.ok(timeTaken > 900);
        await server.close();
    },
);

// #############################################
// Wrap content using shadow DOM
// #############################################

tap.test(
    'useShadowDOM - use of useShadowDOM flag - should render content inside shadow DOM',
    async (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            name: 'my-podlet',
            useShadowDOM: true,
        };

        const podlet = new Podlet(options);

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        t.match(
            result.response.replaceAll(/\s+/g, ''),
            /<my-podlet><templateshadowrootmode="open"><h1>OK!<\/h1><\/template><\/my-podlet>/,
        );
        await server.close();
    },
);

tap.test(
    'useShadowDOM - css assets with shadow-dom strategy - should render link tags inside shadow DOM',
    async (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            name: 'my-podlet',
            useShadowDOM: true,
        };

        const podlet = new Podlet(options);
        podlet.css({ value: '/foo', strategy: 'shadow-dom' });

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        t.match(
            result.response.replaceAll(/\s+/g, ''),
            /<my-podlet><templateshadowrootmode="open"><linkhref="\/foo"type="text\/css"rel="stylesheet"><h1>OK!<\/h1><\/template><\/my-podlet>/,
        );
        await server.close();
    },
);

tap.test(
    'useShadowDOM - css assets with no strategy - should not render link tags inside shadow DOM',
    async (t) => {
        const options = {
            ...DEFAULT_OPTIONS,
            name: 'my-podlet',
            useShadowDOM: true,
        };

        const podlet = new Podlet(options);
        podlet.css({ value: '/foo' });

        const server = new FakeExpressServer(podlet, (req, res) => {
            res.podiumSend('<h1>OK!</h1>');
        });

        await server.listen();
        const result = await server.get({ raw: true });

        t.match(
            result.response.replaceAll(/\s+/g, ''),
            /<my-podlet><templateshadowrootmode="open"><h1>OK!<\/h1><\/template><\/my-podlet>/,
        );
        await server.close();
    },
);
