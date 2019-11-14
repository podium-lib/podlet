/* eslint-disable max-classes-per-file */

'use strict';

function cssDeprecated() {
    if (!cssDeprecated.warned) {
        cssDeprecated.warned = true;
        process.emitWarning(
            'Return value from method css() is now deprecated and will be removed in a future version. Please do not rely on this value.',
            'DeprecationWarning',
        );
    }
}

function jsDeprecated() {
    if (!jsDeprecated.warned) {
        jsDeprecated.warned = true;
        process.emitWarning(
            'Return value from method js() is now deprecated and will be removed in a future version. Please do not rely on this value.',
            'DeprecationWarning',
        );
    }
}

const CssDeprecation = class CssDeprecation extends String {
    constructor(str) {
        super(str);
        this.v = str;
    }

    toString() {
        cssDeprecated();
        return this.v;
    }

    [Symbol.toPrimitive]() {
        cssDeprecated();
        return this.v;
    }
};

const JsDeprecation = class JsDeprecation extends String {
    constructor(str) {
        super(str);
        this.v = str;
    }

    toString() {
        jsDeprecated();
        return this.v;
    }

    [Symbol.toPrimitive]() {
        jsDeprecated();
        return this.v;
    }
};

module.exports.CssDeprecation = CssDeprecation;
module.exports.JsDeprecation = JsDeprecation;
