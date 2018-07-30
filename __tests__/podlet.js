'use strict';

const express = require('express');
const Podlet = require('../');
const http = require('http');

/**
 * Fake server utility
 * Spinns up a http server and attaches a Podlets instanse .middleware()
 * The .get() does a proper http request to the http server and returns
 * a JSON with the http headers sent by the server and the res.locals
 * object set by the Podlet instanse .middleware()
 */

class FakeServer {
    constructor(podlet) {
        this.app = express();
        this.app.use(podlet.middleware());
        this.app.use((req, res) => {
            res.status(200).json(res.locals);
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

    get() {
        return new Promise((resolve, reject) => {
            http.get(this.address, (res) => {
                const chunks = [];
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve({
                        headers: res.headers,
                        locals: JSON.parse(chunks.join('')),
                    });
                });
            }).on('error', (e) => {
                reject(error);
            });
        });
    }
}


/**
 * .defaults()
 */

test('.defaults() - call method with no arguments - should return default value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.defaults();
    expect(result).toEqual({});
});

test('.defaults() - set value on "context" argument - should return set value', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const result = podlet.defaults({ foo: 'bar' });
    expect(result).toEqual({ foo: 'bar' });
});

test('.defaults() - call method with "context" argument, then call it a second time with no argument - should return first set value on second call', () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    podlet.defaults({ foo: 'bar' });
    const result = podlet.defaults();
    expect(result).toEqual({ foo: 'bar' });
});

test('.defaults() - constructor argument "defaults" is not set - should not append a default context to "res.locals"', async () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0' });
    const server = new FakeServer(podlet);
    await server.listen();

    const result = await server.get();
    expect(result.locals.podium.context).toEqual({});

    await server.close();
});

test('.defaults() - constructor argument "defaults" is to "true" - should append a default context to "res.locals"', async () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0', defaults: true });
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.locals.podium.context.debug).toEqual("false");
    expect(result.locals.podium.context.locale).toEqual("en-EN");
    expect(result.locals.podium.context.deviceType).toEqual("desktop");
    expect(result.locals.podium.context.requestedBy).toEqual("foo");
    expect(result.locals.podium.context.mountOrigin).toEqual(address);
    expect(result.locals.podium.context.mountPathname).toEqual('/');
    expect(result.locals.podium.context.publicPathname).toEqual('/');

    await server.close();
});

test('.defaults() - set "context" argument where a key override one existing context value - should override default context value but keep rest untouched', async () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0', defaults: true });
    podlet.defaults({
        locale: "no-NO",
    })
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.locals.podium.context.debug).toEqual("false");
    expect(result.locals.podium.context.locale).toEqual("no-NO");
    expect(result.locals.podium.context.deviceType).toEqual("desktop");
    expect(result.locals.podium.context.requestedBy).toEqual("foo");
    expect(result.locals.podium.context.mountOrigin).toEqual(address);
    expect(result.locals.podium.context.mountPathname).toEqual('/');
    expect(result.locals.podium.context.publicPathname).toEqual('/');

    await server.close();
});

test('.defaults() - set "context" argument where a key is not a default context value - should append key and value to default context', async () => {
    const podlet = new Podlet({ name: 'foo', version: 'v1.0.0', defaults: true });
    podlet.defaults({
        foo: "bar",
    })
    const server = new FakeServer(podlet);
    const address = await server.listen();
    const result = await server.get();

    expect(result.locals.podium.context.foo).toEqual("bar");
    expect(result.locals.podium.context.debug).toEqual("false");
    expect(result.locals.podium.context.locale).toEqual("en-EN");
    expect(result.locals.podium.context.deviceType).toEqual("desktop");
    expect(result.locals.podium.context.requestedBy).toEqual("foo");
    expect(result.locals.podium.context.mountOrigin).toEqual(address);
    expect(result.locals.podium.context.mountPathname).toEqual('/');
    expect(result.locals.podium.context.publicPathname).toEqual('/');

    await server.close();
});
