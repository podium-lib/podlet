export default {
    input: 'lib/podlet.js',
    external: [
        '@podium/schemas',
        '@metrics/client',
        '@podium/utils',
        '@podium/proxy',
        '@podium/utils',
        'abslog',
        'objobj',
        'path',
        'url',
        'fs',
    ],
    output: [
        {
            exports: 'auto',
            format: 'cjs',
            dir: 'dist/',
            preserveModules: true,
        }
    ],
};
