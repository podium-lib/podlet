import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    prettierConfig,
    prettierPlugin,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
                global: true,
            },
        },
    },
    {
        ignores: ['coverage/*', 'dist/*'],
    },
];
