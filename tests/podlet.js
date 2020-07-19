/* eslint-disable no-unused-expressions */
/* eslint-disable max-classes-per-file */

'use strict';

const { destinationObjectStream } = require('@podium/test-utils');
const { template, HttpIncoming, AssetJs, AssetCss } = require('@podium/utils');
const Metrics = require('@metrics/client');
const { test } = require('tap');
const express = require('express');
const http = require('http');
const url = require('url');

const Podlet = require("..");
const VERSION = require('../package.json').version;

const SIMPLE_REQ = {
    headers: {},
};

const SIMPLE_RES = {
    locals: {},
};

/**
 * Fake server utility
 * Spinns up a http server and attaches a Podlets instanse .middleware()
 * The .get() does a proper http request to the http server and returns
 * a JSON with the http headers sent by the server and the res.locals
 * object set by the Podlet instanse .middleware()
 */

class FakeHttpServer {
    constructor({ podlet, process } = {}, onRequest) {
        this.app = http.createServer(async (req, res) => {
            const incoming = new HttpIncoming(req, res);
            const reslt = await podlet.process(incoming, process);
            onRequest
                ? onRequest(reslt)
                : result => {
                      result.response.status(200).json(result);
                  };
        });
        this.server = undefined;
        this.address = '';
    }

    listen() {
        return new Promise(resolve => {
            this.server = this.app.listen(0, 'localhost', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;
                resolve(this.address);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.server.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    get(options = {}) {
        return new Promise((resolve, reject) => {
            let opts = {};
            if (options.pathname) {
                opts = url.parse(`${this.address}${options.pathname}`);
            } else {
                opts = url.parse(this.address);
            }

            http.get(opts, res => {
                const chunks = [];
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve({
                        headers: res.headers,
                        response: options.raw
                            ? chunks.join('')
                            : JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', error => {
                reject(error);
            });
        });
    }
}

class FakeExpressServer {
    constructor(podlet, onRequest) {
        this.app = express();
        this.app.use(podlet.middleware());
        this.app.use(
            onRequest ||
                ((req, res) => {
                    res.status(200).json(res.locals);
                }),
        );
        this.server = undefined;
        this.address = '';
    }

    listen() {
        return new Promise(resolve => {
            this.server = this.app.listen(0, 'localhost', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;
                resolve(this.address);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.server.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    get(options = {}) {
        return new Promise((resolve, reject) => {
            const opts = url.parse(this.address);
            Object.assign(opts, options);

            http.get(opts, res => {
                const chunks = [];
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve({
                        headers: res.headers,
                        response: opts.raw
                            ? chunks.join('')
                            : JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', error => {
                reject(error);
            });
        });
    }
}

const DEFAULT_OPTIONS = { name: 'foo', version: 'v1.0.0', pathname: '/' };

// #############################################
// Constructor
// #############################################

test('Podlet() - instantiate new podlet object - should create an object', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    // expect(podlet).toBeInstanceOf(Podlet);
    t.true(podlet instanceof Podlet);
    t.end();
});

test('Podlet() - object tag - should be PodiumPodlet', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.equal(Object.prototype.toString.call(podlet), '[object PodiumPodlet]');
    t.end();
});

test('Podlet() - no value given to "name" argument - should throw', (t) => {
    t.throws(() => {
        const podlet = new Podlet({ version: 'v1.0.0', pathname: '/' }); // eslint-disable-line no-unused-vars
    }, 'The value, "", for the required argument "name" on the Podlet constructor is not defined or not valid.');
    t.end();
});

test('Podlet() - invalid value given to "name" argument - should throw', (t) => {
    t.throws(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = {
            name: 'foo bar',
            version: 'v1.0.0',
            pathname: '/',
        };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }, 'The value, "foo bar", for the required argument "name" on the Podlet constructor is not defined or not valid.');
    t.end();
});

test('Podlet() - no value given to "version" argument - should throw', (t) => {
    t.throws(() => {
        const podlet = new Podlet({ name: 'foo', pathname: '/' }); // eslint-disable-line no-unused-vars
    }, 'The value, "", for the required argument "version" on the Podlet constructor is not defined or not valid.');
    t.end();
});

test('Podlet() - invalid value given to "version" argument - should throw', (t) => {
    t.throws(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = {
            name: 'foo',
            version: true,
            pathname: '/',
        };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }, 'The value, "true", for the required argument "version" on the Podlet constructor is not defined or not valid.');
    t.end();
});

test('Podlet() - no value given to "pathname" argument - should throw', (t) => {
    t.throws(() => {
        const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' }); // eslint-disable-line no-unused-vars
    }, 'The value, "", for the required argument "pathname" on the Podlet constructor is not defined or not valid.');
    t.end();
});

test('Podlet() - invalid value given to "pathname" argument - should throw', (t) => {
    t.throws(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = {
            name: 'foo',
            version: 'v1.0.0',
            pathname: 'æ / ø',
        };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }, 'The value, "æ / ø", for the required argument "pathname" on the Podlet constructor is not defined or not valid.');
    t.end();
});

test('Podlet() - invalid value given to "manifest" argument - should throw', (t) => {
    t.throws(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = { manifest: 'æ / ø', ...DEFAULT_OPTIONS };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }, 'The value, "æ / ø", for the optional argument "manifest" on the Podlet constructor is not valid.');
    t.end();
});

test('Podlet() - invalid value given to "content" argument - should throw', (t) => {
    t.throws(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = { content: 'æ / ø', ...DEFAULT_OPTIONS };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }, 'The value, "æ / ø", for the optional argument "content" on the Podlet constructor is not valid.');
    t.end();
});

test('Podlet() - invalid value given to "fallback" argument - should throw', (t) => {
    t.throws(() => {
        // Yeah; silly formatting, but only way to please ESLint
        const options = { fallback: 'æ / ø', ...DEFAULT_OPTIONS };
        const podlet = new Podlet(options); // eslint-disable-line no-unused-vars
    }, 'The value, "æ / ø", for the optional argument "fallback" on the Podlet constructor is not valid.');
    t.end()
});

test('Podlet() - serialize default values - should set "name" to same as on constructor', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.equal(result.name, 'foo');
    t.end()
});

test('Podlet() - serialize default values - should set "version" to same as on constructor', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.equal(result.version, 'v1.0.0');
    t.end()
});

test('Podlet() - serialize default values - should set "content" to "/"', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.equal(result.content, '/');
    t.end()
});

test('Podlet() - serialize default values - should set "fallback" to empty String', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.equal(result.fallback, '');
    t.end()
});

test('Podlet() - serialize default values - should set ".js" to empty Array', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.same(result.js, []);
    t.end()
});

test('Podlet() - serialize default values - should set ".css" to empty Array', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.same(result.css, []);
    t.end()
});

test('Podlet() - serialize default values - should set "proxy" to empty Object', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = JSON.parse(JSON.stringify(podlet));
    t.same(result.proxy, {});
    t.end()
});

test('Podlet() - should collect metric with version info', t => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const dest = destinationObjectStream(arr => {
        t.equal(arr[0].name, 'podium_podlet_version_info');

        t.equal(arr[0].labels[0].name, 'version');
        t.equal(arr[0].labels[0].value, VERSION);

        t.equal(arr[0].labels[1].name, 'major');
        t.type(arr[0].labels[1].value, 'number');

        t.equal(arr[0].labels[2].name, 'minor');
        t.type(arr[0].labels[2].value, 'number');

        t.equal(arr[0].labels[3].name, 'patch');
        t.type(arr[0].labels[3].value, 'number');
        t.end()
    });

    podlet.metrics.pipe(dest);

    setImmediate(() => {
        dest.end();
    });
});

// #############################################
// .pathname()
// #############################################

test('.pathname() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.pathname();
    t.equal(result, '/');
    t.end()
});

test('.pathname() - constructor has "pathname" set - should return set value', (t) => {
    const options = { ...DEFAULT_OPTIONS, pathname: '/foo' };
    const podlet = new Podlet(options);
    const result = podlet.pathname();
    t.equal(result, '/foo');
    t.end()
});

// #############################################
// .manifest()
// #############################################

test('.manifest() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.manifest();
    t.equal(result, '/manifest.json');
    t.end()
});

test('.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is default - should return "manifest" value', (t) => {
    const options = {
        ...DEFAULT_OPTIONS,
        pathname: '/foo',
        manifest: '/component.json',
    };
    const podlet = new Podlet(options);

    const result = podlet.manifest();
    t.equal(result, '/component.json');
    t.end()
});

test('.manifest() - constructor has "pathname" and "manifest" set - "prefix" argument is set "true" - should return "manifest" prefixed with "pathname"', (t) => {
    const options = {
        ...DEFAULT_OPTIONS,
        pathname: '/foo',
        manifest: '/component.json',
    };
    const podlet = new Podlet(options);

    const result = podlet.manifest({ prefix: true });
    t.equal(result, '/foo/component.json');
    t.end()
});

// #############################################
// .content()
// #############################################

test('.content() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, '/');
    t.equal(parsed.content, '/');
    t.end()
});

test('.content() - constructor has "pathname" and "content" set - "prefix" argument is default - should return "content" value', (t) => {
    const options = {
        ...DEFAULT_OPTIONS,
        pathname: '/foo',
        content: '/bar/foo.html',
    };
    const podlet = new Podlet(options);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, '/bar/foo.html');
    t.equal(parsed.content, '/bar/foo.html');
    t.end()
});

test('.content() - constructor has "pathname" and "content" set - "prefix" argument is set "true" - should return "content" prefixed with "pathname"', (t) => {
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
    t.end()
});

test('.content() - constructor has "content" set with absolute URI - should return absolute URI', (t) => {
    const options = {
        ...DEFAULT_OPTIONS,
        content: 'http://somewhere.remote.com',
    };
    const podlet = new Podlet(options);

    const result = podlet.content();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, 'http://somewhere.remote.com');
    t.equal(parsed.content, 'http://somewhere.remote.com');
    t.end()
});

// #############################################
// .fallback()
// #############################################

test('.fallback() - call method - should return default value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, '');
    t.equal(parsed.fallback, '');
    t.end()
});

test('.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is default - should return "fallback" value', (t) => {
    const options = {
        ...DEFAULT_OPTIONS,
        pathname: '/foo',
        fallback: '/bar/foo.html',
    };
    const podlet = new Podlet(options);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, '/bar/foo.html');
    t.equal(parsed.fallback, '/bar/foo.html');
    t.end()
});

test('.fallback() - constructor has "pathname" and "fallback" set - "prefix" argument is set "true" - should return "fallback" prefixed with "pathname"', (t) => {
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
    t.end()
});

test('.fallback() - constructor has "fallback" set with absolute URI - should return absolute URI', (t) => {
    const options = {
        ...DEFAULT_OPTIONS,
        fallback: 'http://somewhere.remote.com',
    };
    const podlet = new Podlet(options);

    const result = podlet.fallback();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result, 'http://somewhere.remote.com');
    t.equal(parsed.fallback, 'http://somewhere.remote.com');
    t.end()
});

// #############################################
// .css()
// #############################################

test('.css() - call method with no arguments - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.css();
    }, 'Value for argument variable "value", "undefined", is not valid');
    t.end()
});

test('.css() - set legal absolute value on "value" argument - should set "css" to set value when serializing Object', (t) => {
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
    t.end()
});

test('.css() - call method twice - should set value twice', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/foo/bar' });
    podlet.css({ value: '/bar/foo' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.css, [
        { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
        { rel: 'stylesheet', type: 'text/css', value: '/bar/foo' },
    ]);
    t.end()
});

test('.css() - should accept additional keys', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/foo/bar', fake: 'prop' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.css, [
        { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
    ]);
    t.end()
});

test('.css() - "options" argument as an array - should accept an array of values', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css([{ value: '/foo/bar' }, { value: '/bar/foo' }]);

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.css, [
        { rel: 'stylesheet', type: 'text/css', value: '/foo/bar' },
        { rel: 'stylesheet', type: 'text/css', value: '/bar/foo' },
    ]);
    t.end()
});

test('.css() - "options" argument as an array - call method twice - should set all values', (t) => {
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
    t.end()
});

test('.css() - "options" argument as an array - should NOT set additional keys', (t) => {
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
    t.end()
});

// #############################################
// .js()
// #############################################

test('.js() - call method with no arguments - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.js();
    }, 'Value for argument variable "value", "undefined", is not valid');
    t.end()
});

test('.js() - set legal absolute value on "value" argument - should set "js" to set value when serializing Object', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: 'http://somewhere.remote.com' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [
        { type: 'default', value: 'http://somewhere.remote.com' },
    ]);
    t.end()
});

test('.js() - call method twice - should set value twice', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar' });
    podlet.js({ value: '/bar/foo' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [
        { type: 'default', value: '/foo/bar' },
        { type: 'default', value: '/bar/foo' },
    ]);
    t.end()
});

test('.js() - should NOT accept additional keys', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar', fake: 'prop' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [{ type: 'default', value: '/foo/bar' }]);
    t.end()
});

test('.js() - "type" argument is set to "module" - should set "type" to "module"', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/foo/bar' });
    podlet.js({ value: '/bar/foo', type: 'module' });

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [
        { type: 'default', value: '/foo/bar' },
        { type: 'module', value: '/bar/foo' },
    ]);
    t.end()
});

test('.js() - "options" argument as an array - should accept an array of values', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js([{ value: '/foo/bar' }, { value: '/bar/foo', type: 'module' }]);

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [
        { type: 'default', value: '/foo/bar' },
        { type: 'module', value: '/bar/foo' },
    ]);
    t.end()
});

test('.js() - "options" argument as an array - call method twice - should set all values', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js([{ value: '/foo/bar' }, { value: '/bar/foo', type: 'module' }]);
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
    t.end()
});

test('.js() - "options" argument as an array - should NOT set additional keys', (t) => {
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
    t.end()
});

test('.js() - data attribute object - should convert to array of key / value objects', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js([
        { 
            value: '/foo/bar',
            data: {
                bar: 'a',
                foo: 'b'
            } 
        }
    ]);

    const result = JSON.parse(JSON.stringify(podlet));

    t.same(result.js, [{ 
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
            }
        ] 
    }]);
    t.end()
});

// #############################################
// .process()
// #############################################

test('.process() - call method with HttpIncoming - should return HttpIncoming', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const incoming = new HttpIncoming(SIMPLE_REQ, SIMPLE_RES);
    const result = await podlet.process(incoming);
    t.same(result, incoming);
});

test('.process() - .process(HttpIncoming, { proxy: true }) - request to proxy path - should do proxying', async (t) => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });
    const process = { proxy: true };

    // Proxy path is now: /podium-resource/foo/bar
    podlet.proxy({ target: '/bar', name: 'bar' });

    const server = new FakeHttpServer({ podlet, process }, incoming => {
        if (incoming.url.pathname === '/podium-resource/foo/bar') {
            t.true(incoming.proxy);
            if (incoming.proxy) return;
        }

        incoming.response.statusCode = 200;
        incoming.response.end('OK');
    });

    await server.listen();
    await server.get({ raw: true, pathname: '/podium-resource/foo/bar' });
    await server.close();
});

test('.process() - .process(HttpIncoming, { proxy: false }) - request to proxy path - should not do proxying', async (t) => {
    const podlet = new Podlet({
        name: 'foo',
        version: 'v1.0.0',
        pathname: '/',
        development: true,
    });
    const process = { proxy: false };

    // Proxy path is now: /podium-resource/foo/bar
    podlet.proxy({ target: '/bar', name: 'bar' });

    const server = new FakeHttpServer({ podlet, process }, incoming => {
        if (incoming.url.pathname === '/podium-resource/foo/bar') {
            t.false(incoming.proxy);
            if (incoming.proxy) return;
        }

        incoming.response.statusCode = 200;
        incoming.response.end('OK');
    });

    await server.listen();
    await server.get({ raw: true, pathname: '/podium-resource/foo/bar' });
    await server.close();
});

// #############################################
// .middleware()
// #############################################

test('.middleware() - call method - should append podlet name on "res.locals.podium.name"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.equal(result.response.podium.name, DEFAULT_OPTIONS.name);

    await server.close();
});

test('.middleware() - .css() is NOT set with a value - should append empty Array to "res.locals.podium.css"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.same(result.response.podium.css, []);

    await server.close();
});

test('.middleware() - .css() is set with a value - should append value to "res.locals.podium.css"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.css({ value: '/style.css' });

    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    const parsed = JSON.parse(JSON.stringify(podlet));
    t.same(result.response.podium.css, parsed.css);

    await server.close();
});

test('.middleware() - .js() is NOT set with a value - should append empty Array to "res.locals.podium.js"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.same(result.response.podium.js, []);

    await server.close();
});

test('.middleware() - .js() is set with a value - should append value to "res.locals.podium.js"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    podlet.js({ value: '/script.js' });

    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.same(result.response.podium.js, parsed.js);

    await server.close();
});

test('.js() - passing an instance of AssetsJs - should return set value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    podlet.js(new AssetJs({ value: '/foo/bar', type: 'module' }));
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(parsed.js[0].value, '/foo/bar');
    t.end()
});

test('.css() - passing an instance of AssetsCss - should return set value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    podlet.css(new AssetCss({ value: '/foo/bar', type: 'text/css' }));
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(parsed.css[0].value, '/foo/bar');
    t.end()
});

test('.middleware() - contructor argument "development" is NOT set and "user-agent" on request is NOT set to "@podium/client" - should append "false" value on "res.locals.podium.decorate"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.false(result.response.podium.development);

    await server.close();
});

test('.middleware() - contructor argument "development" is set to "true" and "user-agent" on request is set to "@podium/client" - should append "false" value on "res.locals.podium.decorate"', async (t) => {
    const options = { ...DEFAULT_OPTIONS, development: true };
    const podlet = new Podlet(options);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get({
        headers: {
            'user-agent': '@podium/client',
        },
    });
    t.false(result.response.podium.development);

    await server.close();
});

test('.middleware() - contructor argument "development" is set to "true" and "user-agent" on request is NOT set to "@podium/client" - should append "true" value on "res.locals.podium.decorate"', async (t) => {
    const options = { ...DEFAULT_OPTIONS, development: true };
    const podlet = new Podlet(options);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.true(result.response.podium.development);

    await server.close();
});

test('.middleware() - valid "version" value is set on constructor - should append "podlet-version" http header with the given version value', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.equal(result.headers['podlet-version'], 'v1.0.0');

    await server.close();
});

// #############################################
// .res.podiumSend()
// #############################################

test('res.podiumSend() - .podiumSend() method - should be a function on http.response', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet, (req, res) => {
        t.type(res.podiumSend, 'function');
        res.json({});
    });

    await server.listen();
    await server.get();
    await server.close();
});

test('res.podiumSend() - contructor argument "development" is NOT set to "true" - should NOT append default wireframe document', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet, (req, res) => {
        res.podiumSend('<h1>OK!</h1>');
    });

    await server.listen();
    const result = await server.get({ raw: true });

    t.equal(result.response, '<h1>OK!</h1>');
    await server.close();
});

test('res.podiumSend() - contructor argument "development" is set to "true" - should append default wireframe document', async (t) => {
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
});

// #############################################
// .defaults()
// #############################################

test('.defaults() - call method with no arguments - should return default value', (t) => {
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
    t.end()
});

test('.defaults() - set value on "context" argument - should return set value', (t) => {
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
    t.end()
});

test('.defaults() - call method with "context" argument, then call it a second time with no argument - should return first set value on second call', (t) => {
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
    t.end()
});

test('.defaults() - constructor argument "development" is not set - should not append a default context to "res.locals"', async (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const server = new FakeExpressServer(podlet);
    await server.listen();

    const result = await server.get();
    t.same(result.response.podium.context, {});

    await server.close();
});

test('.defaults() - constructor argument "development" is to "true" - should append a default context to "res.locals"', async (t) => {
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
    t.equal(result.response.podium.context.publicPathname, '/podium-resource/foo');

    await server.close();
});

test('.defaults() - set "context" argument where a key overrides one existing context value - should override default context value but keep rest untouched', async (t) => {
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
    t.equal(result.response.podium.context.publicPathname, '/podium-resource/foo');

    await server.close();
});

test('.defaults() - set "context" argument where a key is not a default context value - should append key and value to default context', async (t) => {
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
    t.equal(result.response.podium.context.publicPathname, '/podium-resource/foo');

    await server.close();
});

// #############################################
// .proxy()
// #############################################

test('.proxy() - no arguments - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.proxy();
    }, 'Value on argument variable "target", "null", is not valid');
    t.end()
});

test('.proxy() - set a non valid "target" argument value - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.proxy({ target: 'æøå æåø', name: 'foo' });
    }, 'Value on argument variable "target", "æøå æåø", is not valid');
    t.end()
});

test('.proxy() - set a non valid "name" argument value - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.proxy({ target: '/foo', name: 'æøå æåø' });
    }, 'Value on argument variable "name", "æøå æåø", is not valid');
    t.end()
});

test('.proxy() - set more than 4 proxy entries - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.proxy({ target: '/foo1', name: 'foo1' });
        podlet.proxy({ target: '/foo2', name: 'foo2' });
        podlet.proxy({ target: '/foo3', name: 'foo3' });
        podlet.proxy({ target: '/foo4', name: 'foo4' });
        podlet.proxy({ target: '/foo5', name: 'foo5' });
    }, 'One can not define more than 4 proxy targets for each podlet');
    t.end()
});

test('.proxy() - set valid "name" and "target" - should return target', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    const result = podlet.proxy({ target: '/foo', name: 'foo' });
    t.equal(result, '/foo');
    t.end()
});

// #############################################
// .view()
// #############################################

test('.view() - set a non valid argument value - should throw', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.throws(() => {
        podlet.view('test');
    }, 'Value on argument variable "template" must be a function');
    t.end()
});

test('.view() - append a custom wireframe document - should render development output with custom wireframe document', async (t) => {
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
});

// #############################################
// .metrics()
// #############################################

test('.metrics - assigned object to property - should be instance of @metrics/client', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.true(podlet.metrics instanceof Metrics);
    t.end()
});

test('.metrics - assigned object to property - should have object tag with "Metrics" as name', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);
    t.equal(Object.prototype.toString.call(podlet.metrics), '[object MetricsClient]');
    t.end()
});
