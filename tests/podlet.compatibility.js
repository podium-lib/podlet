'use strict';

const { test } = require('tap');
const Podlet = require("..");

const DEFAULT_OPTIONS = { name: 'foo', version: 'v1.0.0', pathname: '/' };

// NB; these tests are here only to test compatibility between
// V3 and V4 manifest changes. Can be removed when V3 manifest
// support is removed.

test('.js() - set legal value on "value" argument - should return set value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.js({ value: '/foo/bar' });
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result.toString(), '/foo/bar');
    t.equal(parsed.assets.js, '/foo/bar');
    t.equal(parsed.js[0].value, '/foo/bar');
    t.end();
});

test('.js() - set "prefix" argument to "true" - should prefix value returned by method, but not in manifest', (t) => {
    const options = { ...DEFAULT_OPTIONS, pathname: '/xyz' };
    const podlet = new Podlet(options);

    const result = podlet.js({ value: '/foo/bar', prefix: true });
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result.toString(), '/xyz/foo/bar');
    t.equal(parsed.assets.js, '/foo/bar');
    t.equal(parsed.js[0].value, '/foo/bar');
    t.end();
});

test('.css() - set legal value on "value" argument - should return set value', (t) => {
    const podlet = new Podlet(DEFAULT_OPTIONS);

    const result = podlet.css({ value: '/foo/bar' });
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result.toString(), '/foo/bar');
    t.equal(parsed.assets.css, '/foo/bar');
    t.equal(parsed.css[0].value, '/foo/bar');
    t.end();
});

test('.css() - set "prefix" argument to "true" - should prefix value returned by method, but not in manifest', (t) => {
    const options = { ...DEFAULT_OPTIONS, pathname: '/xyz' };
    const podlet = new Podlet(options);

    const result = podlet.css({ value: '/foo/bar', prefix: true });
    const parsed = JSON.parse(JSON.stringify(podlet));

    t.equal(result.toString(), '/xyz/foo/bar');
    t.equal(parsed.assets.css, '/foo/bar');
    t.equal(parsed.css[0].value, '/foo/bar');
    t.end();
});
