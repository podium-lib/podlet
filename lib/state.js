'use strict';

const originalUrl = require('original-url');
const { URL } = require('url');

const noop = (str) => str;

const PodiumState = class PodiumState {
    constructor(request = {}, response = {}) {
        Object.defineProperty(this, 'request', {
            set() {
                throw new Error('Cannot set read-only property.');
            },
            get() {
                return request;
            }
        });

        Object.defineProperty(this, 'response', {
            set() {
                throw new Error('Cannot set read-only property.');
            },
            get() {
                return response;
            }
        });

        const url = originalUrl(request);
        Object.defineProperty(this, 'url', {
            value: url.full ? new URL(url.full) : {},
        });

        let view = noop;
        Object.defineProperty(this, 'view', {
            set(value) {
                view = value;
            },
            get() {
                return view;
            }
        });

        Object.defineProperty(this, 'context', {
            enumerable: true,
            writable: true,
            value: {},
        });

        Object.defineProperty(this, 'development', {
            enumerable: true,
            writable: true,
            value: false,
        });

        Object.defineProperty(this, 'name', {
            enumerable: true,
            writable: true,
            value: '',
        });

        Object.defineProperty(this, 'css', {
            enumerable: true,
            writable: true,
            value: '',
        });

        Object.defineProperty(this, 'js', {
            enumerable: true,
            writable: true,
            value: '',
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumState';
    }

    render(fragment) {
        if (this.development) {
            return this.view(fragment, this);
        }
        return fragment;
    }
};

module.exports = PodiumState;
