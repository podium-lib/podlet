module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
            '@semantic-release/npm',
            {
                tarballDir: 'release',
            },
        ],
        [
            '@semantic-release/github',
            {
                assets: 'release/*.tgz',
            },
        ],
        '@semantic-release/git',
    ],
    preset: 'angular',
    branches: [
        { name: 'main' },
        { name: 'alpha', prerelease: true },
        { name: 'beta', prerelease: true },
        { name: 'next', prerelease: true },
    ],
};
