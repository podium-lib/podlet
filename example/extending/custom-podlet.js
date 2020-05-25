'use strict';

const PodiumPodlet = require("../..");

const CustomPodlet = class CustomPodlet extends PodiumPodlet {
    constructor(...args) {
        super(...args);

        Object.defineProperty(this, 'fallbackRoute', {
            value: '/backfall',
            writable: true,
        });
    }

    get [Symbol.toStringTag]() {
        return 'CustomPodlet';
    }
};

module.exports = CustomPodlet;
