# [5.3.0](https://github.com/podium-lib/podlet/compare/v5.2.4...v5.3.0) (2025-06-24)


### Features

* add support for html tagged template literal ([#460](https://github.com/podium-lib/podlet/issues/460)) ([356244a](https://github.com/podium-lib/podlet/commit/356244a6d345f688037298830b05824487a12399))

## [5.2.4](https://github.com/podium-lib/podlet/compare/v5.2.3...v5.2.4) (2024-11-25)


### Bug Fixes

* don't set content-type text/html for manifest route ([#445](https://github.com/podium-lib/podlet/issues/445)) ([62e90b6](https://github.com/podium-lib/podlet/commit/62e90b6e37a903817191ee422d8d5dc56f975592))

## [5.2.3](https://github.com/podium-lib/podlet/compare/v5.2.2...v5.2.3) (2024-11-18)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([#444](https://github.com/podium-lib/podlet/issues/444)) ([309e1f5](https://github.com/podium-lib/podlet/commit/309e1f5c8bcf5fef7a6fe4c944ac1c312f2b8b7c))

## [5.2.2](https://github.com/podium-lib/podlet/compare/v5.2.1...v5.2.2) (2024-11-14)


### Bug Fixes

* set content-type header  ([#443](https://github.com/podium-lib/podlet/issues/443)) ([5af702a](https://github.com/podium-lib/podlet/commit/5af702a59e38eb700befce6c41e1065742df1ce3)), closes [#442](https://github.com/podium-lib/podlet/issues/442)

## [5.2.1](https://github.com/podium-lib/podlet/compare/v5.2.0...v5.2.1) (2024-11-11)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([#441](https://github.com/podium-lib/podlet/issues/441)) ([927e067](https://github.com/podium-lib/podlet/commit/927e067d4d0973b315f1387efae20cf5d720b167))

# [5.2.0](https://github.com/podium-lib/podlet/compare/v5.1.19...v5.2.0) (2024-11-06)


### Bug Fixes

* ensure both key/value and object conversion are supported for JS data attributes ([f243d60](https://github.com/podium-lib/podlet/commit/f243d607356166cd77c83eb72ef7ea84f4b95d80))
* force release 5.2.0-next.2 ([b2fc84c](https://github.com/podium-lib/podlet/commit/b2fc84cd6ced3716aa0964d76f55063db5c37fce))
* force release 5.2.0-next.2 ([84223e8](https://github.com/podium-lib/podlet/commit/84223e823125544eb40cbd50b2558bcb78ba9ce6))
* force release 5.2.0-next.2 ([4f5f19d](https://github.com/podium-lib/podlet/commit/4f5f19d9e486461b822dddf4bf278207927c63be))
* force release 5.2.0-next.2 ([a5a1953](https://github.com/podium-lib/podlet/commit/a5a19536aab17130e79f14b2a8d7e7f58e61d0f0))
* sharpen up shadow dom usage assertion ([a47c8bc](https://github.com/podium-lib/podlet/commit/a47c8bc7bb33bc6c685d882a7f922cd39914a874))
* tag asset type when sending hint headers ([56c8614](https://github.com/podium-lib/podlet/commit/56c86144207956c63c7ce1d1103efe4f8ff7d7bf))
* **types:** fix AssetJsLike type ([19494f5](https://github.com/podium-lib/podlet/commit/19494f51c338468c362668678654c119993795db))
* update @podium/schemas to 5.1.0 ([412f03b](https://github.com/podium-lib/podlet/commit/412f03b1dc8dfdc7e89be99825e7966127c9d990))
* update @podium/utils ([719c1e0](https://github.com/podium-lib/podlet/commit/719c1e0ae4e06144e084e8b95bd04d94313b116e))
* use more appropriate strategy instead of scope ([0674a81](https://github.com/podium-lib/podlet/commit/0674a812abe9c246f4c007e1869723dc7c0293a0))


### Features

* add DSD shadow DOM encapsulation support ([02c9a64](https://github.com/podium-lib/podlet/commit/02c9a64a6bb2f460c035416e43405ae380cb6d1c))
* automatically send assets with content/fallback requests as 103 early hints ([c4c8c88](https://github.com/podium-lib/podlet/commit/c4c8c889bc491b8a3c4a896220d1205164e6fde4))
* replace early hints with link header ([815ea97](https://github.com/podium-lib/podlet/commit/815ea97df599676a6a1dd56dd6aeef4f91b27c95))

# [5.2.0-next.10](https://github.com/podium-lib/podlet/compare/v5.2.0-next.9...v5.2.0-next.10) (2024-11-06)


### Bug Fixes

* **deps:** update dependency @podium/proxy to v5.0.29 ([0bbc78b](https://github.com/podium-lib/podlet/commit/0bbc78b07a7f3059cb8f659a23c75896c1081b2f))

## [5.1.19](https://github.com/podium-lib/podlet/compare/v5.1.18...v5.1.19) (2024-11-04)


### Bug Fixes

* **deps:** update dependency @podium/proxy to v5.0.29 ([0bbc78b](https://github.com/podium-lib/podlet/commit/0bbc78b07a7f3059cb8f659a23c75896c1081b2f))

## [5.1.18](https://github.com/podium-lib/podlet/compare/v5.1.17...v5.1.18) (2024-10-11)


### Bug Fixes

* include some app info as a default metric ([5c9fdcb](https://github.com/podium-lib/podlet/commit/5c9fdcb269f9b1867f8df127fcd412f150d3ca95))

## [5.1.17](https://github.com/podium-lib/podlet/compare/v5.1.16...v5.1.17) (2024-09-23)


### Bug Fixes

* type the known context values in an extendable way ([#427](https://github.com/podium-lib/podlet/issues/427)) ([f90ef57](https://github.com/podium-lib/podlet/commit/f90ef577cf6f0fdeabb08edb121a8a0107e77c4d))

## [5.1.16](https://github.com/podium-lib/podlet/compare/v5.1.15...v5.1.16) (2024-09-23)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([b8eddfd](https://github.com/podium-lib/podlet/commit/b8eddfd676810607adc56cdc71d2622e73b25e0e))

## [5.1.15](https://github.com/podium-lib/podlet/compare/v5.1.14...v5.1.15) (2024-09-16)


### Bug Fixes

* correct the JSDoc for fallback ([#423](https://github.com/podium-lib/podlet/issues/423)) ([7444897](https://github.com/podium-lib/podlet/commit/7444897b7cf45a9e2b9c310ce309f69f80fa91d1))

## [5.1.14](https://github.com/podium-lib/podlet/compare/v5.1.13...v5.1.14) (2024-09-16)


### Bug Fixes

* **deps:** update dependency @podium/proxy to v5.0.26 ([59699f0](https://github.com/podium-lib/podlet/commit/59699f029ee32ff4997c7e971bb543ee6a971251))

## [5.1.13](https://github.com/podium-lib/podlet/compare/v5.1.12...v5.1.13) (2024-09-09)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([81119fe](https://github.com/podium-lib/podlet/commit/81119feda716c226777751564ac9153c7c393096))

## [5.1.12](https://github.com/podium-lib/podlet/compare/v5.1.11...v5.1.12) (2024-08-19)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([c89041c](https://github.com/podium-lib/podlet/commit/c89041ce5588c6e2ac27ae95cc7b6e1fdae8fd94))

## [5.1.11](https://github.com/podium-lib/podlet/compare/v5.1.10...v5.1.11) (2024-08-05)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([801a95a](https://github.com/podium-lib/podlet/commit/801a95a1b3251d491e774a536f1c43b538c21a9b))

## [5.1.10](https://github.com/podium-lib/podlet/compare/v5.1.9...v5.1.10) (2024-07-17)


### Bug Fixes

* add podium context to locals type ([6827f8c](https://github.com/podium-lib/podlet/commit/6827f8ca545a08685cf702028faeb9ca6514b68a))

## [5.1.9](https://github.com/podium-lib/podlet/compare/v5.1.8...v5.1.9) (2024-07-15)


### Bug Fixes

* **deps:** update all dependencies (non-major) ([903f680](https://github.com/podium-lib/podlet/commit/903f68067c88779272a23be6354c071eb7c834ad))

## [5.1.8](https://github.com/podium-lib/podlet/compare/v5.1.7...v5.1.8) (2024-06-20)

### Bug Fixes

-   update @podium/proxy to address security issue ([12fc385](https://github.com/podium-lib/podlet/commit/12fc385714ca82735a5fa14bddd08bd491cd098a))

## [5.1.7](https://github.com/podium-lib/podlet/compare/v5.1.6...v5.1.7) (2024-06-10)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([51daf85](https://github.com/podium-lib/podlet/commit/51daf85df00b39dedd9decbed8e3e7b086d7fc11))

## [5.1.6](https://github.com/podium-lib/podlet/compare/v5.1.5...v5.1.6) (2024-05-27)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([e401e9d](https://github.com/podium-lib/podlet/commit/e401e9d5cab42ef0ba20c5a60974d203fc0d2883))

## [5.1.5](https://github.com/podium-lib/podlet/compare/v5.1.4...v5.1.5) (2024-05-14)

### Bug Fixes

-   add docs to podiumSend method ([6f087f2](https://github.com/podium-lib/podlet/commit/6f087f2b9a815d02b844719706499e22912073b2))
-   update dependency typings ([bf4bc75](https://github.com/podium-lib/podlet/commit/bf4bc7550e5364f133b84e01e1a562aed35fed06))

## [5.1.4](https://github.com/podium-lib/podlet/compare/v5.1.3...v5.1.4) (2024-05-13)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([8c9d9a0](https://github.com/podium-lib/podlet/commit/8c9d9a0c709f54edeef094914a7b51109bd7a4c7))

## [5.1.3](https://github.com/podium-lib/podlet/compare/v5.1.2...v5.1.3) (2024-05-06)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([4833c00](https://github.com/podium-lib/podlet/commit/4833c00bd3875356bc6b8893b1a4fe9f41a5645e))

## [5.1.2](https://github.com/podium-lib/podlet/compare/v5.1.1...v5.1.2) (2024-04-29)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([83d0eb3](https://github.com/podium-lib/podlet/commit/83d0eb39e6b8f03bfdb42cfe19a2d8f6f51edbef))

## [5.1.1](https://github.com/podium-lib/podlet/compare/v5.1.0...v5.1.1) (2024-04-15)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([292c3b5](https://github.com/podium-lib/podlet/commit/292c3b5be8950ea9ba14dd26941a83e30c8bf1c5))

# [5.1.0](https://github.com/podium-lib/podlet/compare/v5.0.7...v5.1.0) (2024-04-14)

### Bug Fixes

-   pass res.locals to HttpIncoming constructor ([f9b6336](https://github.com/podium-lib/podlet/commit/f9b63360921d2ca045ddd3379ece9d67edac63ef))

### Features

-   pass a new res.locals.params object to http-incoming ([b9ef277](https://github.com/podium-lib/podlet/commit/b9ef2778e4e5b68d93c2bc8d3825a0d14b3a5d0a))

## [5.0.7](https://github.com/podium-lib/podlet/compare/v5.0.6...v5.0.7) (2024-04-08)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v5.0.5 ([a3ca800](https://github.com/podium-lib/podlet/commit/a3ca800ba9265c69f1f665d23682d20d523fc28d))

## [5.0.6](https://github.com/podium-lib/podlet/compare/v5.0.5...v5.0.6) (2024-03-04)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v5.0.4 ([5fccdeb](https://github.com/podium-lib/podlet/commit/5fccdeb0332157480f68e93323b860b1306d90b5))

## [5.0.5](https://github.com/podium-lib/podlet/compare/v5.0.4...v5.0.5) (2024-02-05)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([c1e3289](https://github.com/podium-lib/podlet/commit/c1e32899ecc7b655aa3e826094a032039f9822cb))

## [5.0.4](https://github.com/podium-lib/podlet/compare/v5.0.3...v5.0.4) (2024-01-03)

### Bug Fixes

-   mark proxy as optional ([#367](https://github.com/podium-lib/podlet/issues/367)) ([8374810](https://github.com/podium-lib/podlet/commit/8374810ff88aadb5ed8a24b84836e8a82e0e0685))

## [5.0.3](https://github.com/podium-lib/podlet/compare/v5.0.2...v5.0.3) (2023-12-11)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v5.0.1 ([7bf9073](https://github.com/podium-lib/podlet/commit/7bf9073b83ad8fda275902c986d573ea00521039))

## [5.0.2](https://github.com/podium-lib/podlet/compare/v5.0.1...v5.0.2) (2023-12-08)

### Bug Fixes

-   Pass podlet name to proxy ([190eddd](https://github.com/podium-lib/podlet/commit/190eddd4c017c0da5d6c8206a015419d77ac395c))

## [5.0.1](https://github.com/podium-lib/podlet/compare/v5.0.0...v5.0.1) (2023-12-06)

### Bug Fixes

-   update types to match ESM export ([a25608a](https://github.com/podium-lib/podlet/commit/a25608a2c9ac0fec9c3c3271a5423bdb118b29f6))

# [5.0.0](https://github.com/podium-lib/podlet/compare/v4.5.0...v5.0.0) (2023-11-28)

### Bug Fixes

-   Use latest proxy ([42f622c](https://github.com/podium-lib/podlet/commit/42f622c64f86b49796cc34e0871371ae74088cf1))

### Features

-   add support for strategy and scope via @podium/schemas and @podium/utils update ([128eaa1](https://github.com/podium-lib/podlet/commit/128eaa1b3de35581d8fe537c63ebc001ce82c282))
-   Convert to ESM ([cedb222](https://github.com/podium-lib/podlet/commit/cedb222127c25469bf856942463ce02491d5ad08))
-   Drop node 10.x support ([1f9ca4f](https://github.com/podium-lib/podlet/commit/1f9ca4f97e8da9addac4e70813ba981e7742ec9e))
-   Remove deprecated return value on .js and .css methods ([4052c02](https://github.com/podium-lib/podlet/commit/4052c02750a0071487bfa1ffb76ccebcc55bf185))

### BREAKING CHANGES

-   Convert from CommonJS module to ESM
-   In version 4 of podium it became possible to set multiple assets to a podlet through its `.js()` and `.css()` methods. This did make it impossible to let these methods return a resonable value, but to keep a backwards compabillity with version 3 of Podium, the first item passed in was returned for compabillity. This removes this compaillity with version 3 of Podium.
-   Only support node 12 and 14.

# [5.0.0-next.8](https://github.com/podium-lib/podlet/compare/v5.0.0-next.7...v5.0.0-next.8) (2023-11-22)

### Bug Fixes

-   adding type information closes [#344](https://github.com/podium-lib/podlet/issues/344) ([28e6ed9](https://github.com/podium-lib/podlet/commit/28e6ed9508d9218046f925e85fd97d17479bf390))
-   CJS-shaped export in type definition ([fd96046](https://github.com/podium-lib/podlet/commit/fd96046ca16b89d02526453ff3cbf6d3ace694bd))
-   **deps:** update all dependencies (non-major) ([bf963ad](https://github.com/podium-lib/podlet/commit/bf963ad4f82ca1dabad6a960c2a836f075512385))
-   **deps:** update all dependencies (non-major) ([4475c67](https://github.com/podium-lib/podlet/commit/4475c67d637af2bcc7f843eed386614efc3d7c61))
-   **deps:** update all dependencies (non-major) ([0a47c72](https://github.com/podium-lib/podlet/commit/0a47c7289869c023235d32d301e83fd5de77f7f2))
-   **deps:** update all dependencies (non-major) ([08a5c70](https://github.com/podium-lib/podlet/commit/08a5c702797432b7668195d10c96def7bfc0c0bf))
-   **deps:** update all dependencies (non-major) ([0d14c8a](https://github.com/podium-lib/podlet/commit/0d14c8aae8a69ba80a32021fcd87f7f6e06b791f))
-   **deps:** update all dependencies (non-major) ([94707a5](https://github.com/podium-lib/podlet/commit/94707a5f92f72af94b23b77ac6b27b1dd379efcb))
-   **deps:** update all dependencies (non-major) ([6ab8c85](https://github.com/podium-lib/podlet/commit/6ab8c85ff5ef299049a21e0dc3882d1a8ae1a837))
-   **deps:** update all dependencies (non-major) ([bf8620d](https://github.com/podium-lib/podlet/commit/bf8620dc2693a5c25daa9ae26969b591848ec541))
-   **types:** Add pathname() method to Podium type ([779f8c3](https://github.com/podium-lib/podlet/commit/779f8c33dc92183acec90cd647865a83a99b558e))

### Features

-   filter assets by scope if scope is provided ([95129b3](https://github.com/podium-lib/podlet/commit/95129b3e2de5b955cc4b5a2aa5942ddc0af39e8e))

# [4.5.0](https://github.com/podium-lib/podlet/compare/v4.4.75...v4.5.0) (2023-11-22)

### Features

-   filter assets by scope if scope is provided ([95129b3](https://github.com/podium-lib/podlet/commit/95129b3e2de5b955cc4b5a2aa5942ddc0af39e8e))

## [4.4.75](https://github.com/podium-lib/podlet/compare/v4.4.74...v4.4.75) (2023-11-20)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([bf963ad](https://github.com/podium-lib/podlet/commit/bf963ad4f82ca1dabad6a960c2a836f075512385))

## [4.4.74](https://github.com/podium-lib/podlet/compare/v4.4.73...v4.4.74) (2023-10-23)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([4475c67](https://github.com/podium-lib/podlet/commit/4475c67d637af2bcc7f843eed386614efc3d7c61))

## [4.4.73](https://github.com/podium-lib/podlet/compare/v4.4.72...v4.4.73) (2023-10-09)

### Bug Fixes

-   CJS-shaped export in type definition ([fd96046](https://github.com/podium-lib/podlet/commit/fd96046ca16b89d02526453ff3cbf6d3ace694bd))

## [4.4.72](https://github.com/podium-lib/podlet/compare/v4.4.71...v4.4.72) (2023-09-25)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([0a47c72](https://github.com/podium-lib/podlet/commit/0a47c7289869c023235d32d301e83fd5de77f7f2))

## [4.4.71](https://github.com/podium-lib/podlet/compare/v4.4.70...v4.4.71) (2023-09-18)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([08a5c70](https://github.com/podium-lib/podlet/commit/08a5c702797432b7668195d10c96def7bfc0c0bf))

## [4.4.70](https://github.com/podium-lib/podlet/compare/v4.4.69...v4.4.70) (2023-09-13)

### Bug Fixes

-   adding type information closes [#344](https://github.com/podium-lib/podlet/issues/344) ([28e6ed9](https://github.com/podium-lib/podlet/commit/28e6ed9508d9218046f925e85fd97d17479bf390))

## [4.4.69](https://github.com/podium-lib/podlet/compare/v4.4.68...v4.4.69) (2023-01-09)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([0d14c8a](https://github.com/podium-lib/podlet/commit/0d14c8aae8a69ba80a32021fcd87f7f6e06b791f))

## [4.4.68](https://github.com/podium-lib/podlet/compare/v4.4.67...v4.4.68) (2022-12-12)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([94707a5](https://github.com/podium-lib/podlet/commit/94707a5f92f72af94b23b77ac6b27b1dd379efcb))

## [4.4.67](https://github.com/podium-lib/podlet/compare/v4.4.66...v4.4.67) (2022-11-21)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([6ab8c85](https://github.com/podium-lib/podlet/commit/6ab8c85ff5ef299049a21e0dc3882d1a8ae1a837))

## [4.4.66](https://github.com/podium-lib/podlet/compare/v4.4.65...v4.4.66) (2022-11-14)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([bf8620d](https://github.com/podium-lib/podlet/commit/bf8620dc2693a5c25daa9ae26969b591848ec541))

## [4.4.65](https://github.com/podium-lib/podlet/compare/v4.4.64...v4.4.65) (2022-09-02)

### Bug Fixes

-   **types:** Add pathname() method to Podium type ([779f8c3](https://github.com/podium-lib/podlet/commit/779f8c33dc92183acec90cd647865a83a99b558e))

# [5.0.0-next.7](https://github.com/podium-lib/podlet/compare/v5.0.0-next.6...v5.0.0-next.7) (2023-11-20)

### Features

-   add support for strategy and scope via @podium/schemas and @podium/utils update ([128eaa1](https://github.com/podium-lib/podlet/commit/128eaa1b3de35581d8fe537c63ebc001ce82c282))

# [5.0.0-next.6](https://github.com/podium-lib/podlet/compare/v5.0.0-next.5...v5.0.0-next.6) (2022-09-21)

### Bug Fixes

-   Use latest proxy ([42f622c](https://github.com/podium-lib/podlet/commit/42f622c64f86b49796cc34e0871371ae74088cf1))

# [5.0.0-next.5](https://github.com/podium-lib/podlet/compare/v5.0.0-next.4...v5.0.0-next.5) (2022-05-10)

### Bug Fixes

-   **deps:** update all dependencies ([37ed836](https://github.com/podium-lib/podlet/commit/37ed8364377d625097a11d31c4d28e7930d3d914))
-   **deps:** update all dependencies ([0e4abcb](https://github.com/podium-lib/podlet/commit/0e4abcb6a10236d9fd9b8acdcad08d462ede6d28))
-   **deps:** update all dependencies ([29e88ff](https://github.com/podium-lib/podlet/commit/29e88ff756f1eee69827847d15d35aedfa453d41))
-   **deps:** update all dependencies ([f102755](https://github.com/podium-lib/podlet/commit/f10275597920e6b7d5190e97cb5b550258cde240))
-   **deps:** update all dependencies ([938fe6c](https://github.com/podium-lib/podlet/commit/938fe6cb93e7cf582e4d83cfba8e0543578caa20))
-   **deps:** update all dependencies ([f248848](https://github.com/podium-lib/podlet/commit/f248848bea2081735953658dc3eadbb2a21c2ac9))
-   **deps:** update all dependencies ([42a93bf](https://github.com/podium-lib/podlet/commit/42a93bf95e2bc690641202277fe31bb59e04319a))
-   **deps:** update all dependencies ([e93d3bc](https://github.com/podium-lib/podlet/commit/e93d3bc84b9dbfa4f9959506deb6c6a8ed5d210f))
-   **deps:** update all dependencies ([8368aa0](https://github.com/podium-lib/podlet/commit/8368aa005431dd127cbb83ec1c8a8e808a6ce1d1))
-   **deps:** update all dependencies ([82a9a4a](https://github.com/podium-lib/podlet/commit/82a9a4a35c61853460661a9ba173667ac33440b4))
-   **deps:** update all dependencies ([83f4364](https://github.com/podium-lib/podlet/commit/83f43642321c7aa3b5d29a639a3dbfe45bcc7a77))
-   **deps:** update all dependencies ([88302c8](https://github.com/podium-lib/podlet/commit/88302c854869bec4a8db1fa53ac8395a2465ecc4))
-   **deps:** update all dependencies ([a4116ba](https://github.com/podium-lib/podlet/commit/a4116ba53a5c988678ae51bb84f467b41e0d73d9))
-   **deps:** update all dependencies ([caa9fcf](https://github.com/podium-lib/podlet/commit/caa9fcf8f174144f62a92700af43839b2784de80))
-   **deps:** update all dependencies ([d970008](https://github.com/podium-lib/podlet/commit/d9700085acb0779181cef168f84080bbd9d03f0e))
-   **deps:** update all dependencies ([7fd8e49](https://github.com/podium-lib/podlet/commit/7fd8e494ea55043c65634f3c49d5e4dedcc03b73))
-   **deps:** update all dependencies ([763da37](https://github.com/podium-lib/podlet/commit/763da374e57d935e93892f415a43a3c485e52cba))
-   **deps:** update all dependencies (non-major) ([a26feeb](https://github.com/podium-lib/podlet/commit/a26feeb4ccdd85876be25a4dedfb2b3786ab30f7))
-   **deps:** update dependency @podium/proxy to v4.2.45 ([81df855](https://github.com/podium-lib/podlet/commit/81df855ce6c15e3d36f30e3eb778d8e906edae78))
-   **deps:** update dependency @podium/proxy to v4.2.53 ([59c66a6](https://github.com/podium-lib/podlet/commit/59c66a6525551e2fa7bd01516ea7620ac991befa))
-   **deps:** update dependency @podium/proxy to v4.2.55 ([76cb389](https://github.com/podium-lib/podlet/commit/76cb389e9b19cc8c67534a15589d220ed6138ceb))
-   **deps:** update dependency @podium/proxy to v4.2.62 ([c1f9159](https://github.com/podium-lib/podlet/commit/c1f915917ccb9b8981ab4248458652c77b81480a))
-   **deps:** update dependency @podium/proxy to v4.2.65 ([2569533](https://github.com/podium-lib/podlet/commit/2569533fada1652d6070580c2fef55c63b1413cf))
-   **deps:** update dependency @podium/proxy to v4.2.67 ([b9db2e6](https://github.com/podium-lib/podlet/commit/b9db2e626c22a15b90c9887c2dea710835926e0c))
-   **deps:** update dependency @podium/proxy to v4.2.68 ([140c6a0](https://github.com/podium-lib/podlet/commit/140c6a0b31e39ea663b9cc58fe1c55a8806da195))
-   **deps:** update dependency @podium/proxy to v4.2.72 ([fb00921](https://github.com/podium-lib/podlet/commit/fb00921a1607954c50168849a84a76625fc621bc))
-   **deps:** update dependency @podium/proxy to v4.2.75 ([3d26c35](https://github.com/podium-lib/podlet/commit/3d26c356571f2f3f141a13f168aee0e64997c5ad))
-   **deps:** update dependency @podium/schemas to v4.1.24 ([f8f44f2](https://github.com/podium-lib/podlet/commit/f8f44f2576c5e897a572fe0228a960599daf18ea))
-   **deps:** update dependency @podium/schemas to v4.1.26 ([90e1339](https://github.com/podium-lib/podlet/commit/90e1339a746f568fa5589fe87e96a7d503051dfe))
-   **deps:** update dependency @podium/schemas to v4.1.28 ([5c0fdde](https://github.com/podium-lib/podlet/commit/5c0fdde560fc2feabd33bb4d3496bb92c72e568d))
-   **deps:** update dependency @podium/utils to v4.4.33 ([198324f](https://github.com/podium-lib/podlet/commit/198324fe0e6f9d18b4ad994ab55bb3fd381f02cc))
-   **deps:** update dependency @podium/utils to v4.4.35 ([a5c53fb](https://github.com/podium-lib/podlet/commit/a5c53fb5310a46b16d360ddc27d2ddbac674fcab))
-   **deps:** update dependency ajv to v8.10.0 ([5eeb704](https://github.com/podium-lib/podlet/commit/5eeb70431de127af3613b23762b4b98b14500915))
-   **deps:** update dependency ajv to v8.5.0 ([2a0131b](https://github.com/podium-lib/podlet/commit/2a0131bd5126cd0a572cadf199d57185ef5cc7be))
-   **deps:** update dependency ajv to v8.6.0 ([b5723a9](https://github.com/podium-lib/podlet/commit/b5723a93e5fe70c567d230b0e70c0895d6608561))
-   **deps:** update dependency ajv to v8.6.1 ([1e112b3](https://github.com/podium-lib/podlet/commit/1e112b3faef4d4225b0a1f68e131a4eeaef8edf7))
-   **deps:** update dependency ajv to v8.6.2 ([d57e0f6](https://github.com/podium-lib/podlet/commit/d57e0f6b4db4db415edf601e388b93e5f6aea6c7))
-   **deps:** update dependency ajv to v8.6.3 ([cc4b489](https://github.com/podium-lib/podlet/commit/cc4b489d9605c112e9bdbc466ad76da57f247b47))
-   **deps:** update dependency ajv to v8.7.1 ([3dfedfa](https://github.com/podium-lib/podlet/commit/3dfedfab2306f0e1c3a2e2b904746fc9cdc713ed))
-   **deps:** update dependency ajv to v8.8.0 ([e1550ef](https://github.com/podium-lib/podlet/commit/e1550ef04ba12ee6f08af564b8697751d0c9d7e4))
-   **deps:** update dependency ajv to v8.8.1 ([b9127d8](https://github.com/podium-lib/podlet/commit/b9127d89b9bfaa5fd72663e34313c4559fc1e563))
-   update Proxy module to fix trailer header vulnerability ([0f67d23](https://github.com/podium-lib/podlet/commit/0f67d23307fc67bef9855835f5d3b3fcfcf6601d))

# [5.0.0-next.4](https://github.com/podium-lib/podlet/compare/v5.0.0-next.3...v5.0.0-next.4) (2021-05-09)

### Features

-   Convert to ESM ([cedb222](https://github.com/podium-lib/podlet/commit/cedb222127c25469bf856942463ce02491d5ad08))

### BREAKING CHANGES

-   Convert from CommonJS module to ESM

# [5.0.0-next.3](https://github.com/podium-lib/podlet/compare/v5.0.0-next.2...v5.0.0-next.3) (2021-05-08)

## [4.4.64](https://github.com/podium-lib/podlet/compare/v4.4.63...v4.4.64) (2022-05-09)

### Bug Fixes

-   **deps:** update [@podium](https://github.com/podium) packages ([77fb104](https://github.com/podium-lib/podlet/commit/77fb104e008ce285331b22b2cb1a1e4cd99e1361))
-   **deps:** update all dependencies ([e1e24c6](https://github.com/podium-lib/podlet/commit/e1e24c6668756dcc9a72c79a936f208e51cd584d))
-   **deps:** update all dependencies ([916968a](https://github.com/podium-lib/podlet/commit/916968af86b69bf592775270f6296d1247820ce3))
-   **deps:** update all dependencies ([d3efefb](https://github.com/podium-lib/podlet/commit/d3efefbc48621809edca0fa004a1405a8829be02))
-   **deps:** update dependency @podium/proxy to v4.2.2 ([ac8fd49](https://github.com/podium-lib/podlet/commit/ac8fd495df7fbe4238886aae9e9ff5769c37a037))
-   **deps:** update dependency @podium/proxy to v4.2.3 ([aa08351](https://github.com/podium-lib/podlet/commit/aa083517aa5de4945d26d6caab82acec78a277e2))
-   **deps:** update dependency @podium/proxy to v4.2.30 ([8bd0e57](https://github.com/podium-lib/podlet/commit/8bd0e575bb1545a3cf93a6cf4d0b8285ea6782c8))
-   **deps:** update dependency @podium/proxy to v4.2.4 ([4a87242](https://github.com/podium-lib/podlet/commit/4a8724229b9e46bb6a60d00e304d6c6cd9274fb3))
-   **deps:** update dependency @podium/proxy to v4.2.5 ([ce16e53](https://github.com/podium-lib/podlet/commit/ce16e53ec6cae82c0431a57c4c042ebfc241d0c1))
-   **deps:** update dependency @podium/proxy to v4.2.6 ([e70dff0](https://github.com/podium-lib/podlet/commit/e70dff011e52b77b25c58d915ffd665cec6175d3))
-   **deps:** update dependency @podium/proxy to v4.2.7 ([3103c29](https://github.com/podium-lib/podlet/commit/3103c2908c2ecb19a52dfc09704f399177213a93))
-   **deps:** update dependency ajv to v8.0.5 ([70e97b7](https://github.com/podium-lib/podlet/commit/70e97b71cbba564b66dd59f4035eafff7b94a466))
-   Add ajv as a dependency to deal with peer dep issues ([0a199fe](https://github.com/podium-lib/podlet/commit/0a199fe361760b6f55ad0f7bb851c0b70d969498))
-   Update @podium/schema to version 4.1.9 to fix ajv error ([4b13199](https://github.com/podium-lib/podlet/commit/4b1319940b5ae2d47e3a0fa338ac96eb5201be25))
-   **deps:** update dependency @podium/proxy to v4.2.8 ([025ab94](https://github.com/podium-lib/podlet/commit/025ab94ac79b20ac65745098800815b82f507632))
-   **deps:** update dependency @podium/schemas to v4.0.3 ([0469aa4](https://github.com/podium-lib/podlet/commit/0469aa4304c19205922c694a91ecc477422ed591))
-   **deps:** update dependency @podium/schemas to v4.0.4 ([c16d777](https://github.com/podium-lib/podlet/commit/c16d777eaf8d01bb095e34549cf66e86b7f611da))
-   **deps:** update dependency @podium/schemas to v4.0.5 ([92df10d](https://github.com/podium-lib/podlet/commit/92df10dbb4d073f055308e9ff31c8414e17f2c9b))
-   **deps:** update dependency @podium/utils to v4.3.1 ([a08ab18](https://github.com/podium-lib/podlet/commit/a08ab18fe744a21f39086de3678981e9fe28ef62))
-   **deps:** update dependency @podium/utils to v4.3.3 ([85a5b43](https://github.com/podium-lib/podlet/commit/85a5b43be0755d7aee0df39c0cc3a6c34bbd2d25))
-   **deps:** update dependency @podium/utils to v4.4.0 ([6acd127](https://github.com/podium-lib/podlet/commit/6acd127c3a05308c848994f0652ef20520d4ff89))
-   **deps:** update dependency @podium/utils to v4.4.1 ([a3efa6b](https://github.com/podium-lib/podlet/commit/a3efa6b94b2c311e405cd21c0525b4d19c0c37c5))

# [5.0.0-next.2](https://github.com/podium-lib/podlet/compare/v5.0.0-next.1...v5.0.0-next.2) (2020-07-19)

### Features

-   Remove deprecated return value on .js and .css methods ([4052c02](https://github.com/podium-lib/podlet/commit/4052c02750a0071487bfa1ffb76ccebcc55bf185))

### BREAKING CHANGES

-   In version 4 of podium it became possible to set multiple assets to a podlet through its `.js()` and `.css()` methods. This did make it impossible to let these methods return a resonable value, but to keep a backwards compabillity with version 3 of Podium, the first item passed in was returned for compabillity. This removes this compaillity with version 3 of Podium.

# [5.0.0-next.1](https://github.com/podium-lib/podlet/compare/v4.4.0...v5.0.0-next.1) (2020-07-14)

### Features

-   Drop node 10.x support ([1f9ca4f](https://github.com/podium-lib/podlet/commit/1f9ca4f97e8da9addac4e70813ba981e7742ec9e))

### BREAKING CHANGES

-   Only support node 12 and 14.
-   **deps:** update dependency @podium/proxy to v4.2.75 ([3d26c35](https://github.com/podium-lib/podlet/commit/3d26c356571f2f3f141a13f168aee0e64997c5ad))

## [4.4.63](https://github.com/podium-lib/podlet/compare/v4.4.62...v4.4.63) (2022-04-05)

### Bug Fixes

-   update Proxy module to fix trailer header vulnerability ([0f67d23](https://github.com/podium-lib/podlet/commit/0f67d23307fc67bef9855835f5d3b3fcfcf6601d))

## [4.4.62](https://github.com/podium-lib/podlet/compare/v4.4.61...v4.4.62) (2022-03-28)

### Bug Fixes

-   **deps:** update all dependencies (non-major) ([a26feeb](https://github.com/podium-lib/podlet/commit/a26feeb4ccdd85876be25a4dedfb2b3786ab30f7))

## [4.4.61](https://github.com/podium-lib/podlet/compare/v4.4.60...v4.4.61) (2022-02-05)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.72 ([fb00921](https://github.com/podium-lib/podlet/commit/fb00921a1607954c50168849a84a76625fc621bc))

## [4.4.60](https://github.com/podium-lib/podlet/compare/v4.4.59...v4.4.60) (2022-02-05)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v4.4.35 ([a5c53fb](https://github.com/podium-lib/podlet/commit/a5c53fb5310a46b16d360ddc27d2ddbac674fcab))

## [4.4.59](https://github.com/podium-lib/podlet/compare/v4.4.58...v4.4.59) (2022-02-05)

### Bug Fixes

-   **deps:** update all dependencies ([37ed836](https://github.com/podium-lib/podlet/commit/37ed8364377d625097a11d31c4d28e7930d3d914))

## [4.4.58](https://github.com/podium-lib/podlet/compare/v4.4.57...v4.4.58) (2022-02-04)

### Bug Fixes

-   **deps:** update dependency ajv to v8.10.0 ([5eeb704](https://github.com/podium-lib/podlet/commit/5eeb70431de127af3613b23762b4b98b14500915))

## [4.4.57](https://github.com/podium-lib/podlet/compare/v4.4.56...v4.4.57) (2022-01-16)

### Bug Fixes

-   **deps:** update all dependencies ([0e4abcb](https://github.com/podium-lib/podlet/commit/0e4abcb6a10236d9fd9b8acdcad08d462ede6d28))

## [4.4.56](https://github.com/podium-lib/podlet/compare/v4.4.55...v4.4.56) (2022-01-02)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.68 ([140c6a0](https://github.com/podium-lib/podlet/commit/140c6a0b31e39ea663b9cc58fe1c55a8806da195))

## [4.4.55](https://github.com/podium-lib/podlet/compare/v4.4.54...v4.4.55) (2022-01-02)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v4.4.33 ([198324f](https://github.com/podium-lib/podlet/commit/198324fe0e6f9d18b4ad994ab55bb3fd381f02cc))

## [4.4.54](https://github.com/podium-lib/podlet/compare/v4.4.53...v4.4.54) (2021-11-22)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.67 ([b9db2e6](https://github.com/podium-lib/podlet/commit/b9db2e626c22a15b90c9887c2dea710835926e0c))

## [4.4.53](https://github.com/podium-lib/podlet/compare/v4.4.52...v4.4.53) (2021-11-22)

### Bug Fixes

-   **deps:** update all dependencies ([29e88ff](https://github.com/podium-lib/podlet/commit/29e88ff756f1eee69827847d15d35aedfa453d41))

## [4.4.52](https://github.com/podium-lib/podlet/compare/v4.4.51...v4.4.52) (2021-11-22)

### Bug Fixes

-   **deps:** update all dependencies ([f102755](https://github.com/podium-lib/podlet/commit/f10275597920e6b7d5190e97cb5b550258cde240))

## [4.4.51](https://github.com/podium-lib/podlet/compare/v4.4.50...v4.4.51) (2021-11-17)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.65 ([2569533](https://github.com/podium-lib/podlet/commit/2569533fada1652d6070580c2fef55c63b1413cf))

## [4.4.50](https://github.com/podium-lib/podlet/compare/v4.4.49...v4.4.50) (2021-11-17)

### Bug Fixes

-   **deps:** update all dependencies ([938fe6c](https://github.com/podium-lib/podlet/commit/938fe6cb93e7cf582e4d83cfba8e0543578caa20))

## [4.4.49](https://github.com/podium-lib/podlet/compare/v4.4.48...v4.4.49) (2021-11-17)

### Bug Fixes

-   **deps:** update dependency @podium/schemas to v4.1.28 ([5c0fdde](https://github.com/podium-lib/podlet/commit/5c0fdde560fc2feabd33bb4d3496bb92c72e568d))

## [4.4.48](https://github.com/podium-lib/podlet/compare/v4.4.47...v4.4.48) (2021-11-16)

### Bug Fixes

-   **deps:** update dependency ajv to v8.8.1 ([b9127d8](https://github.com/podium-lib/podlet/commit/b9127d89b9bfaa5fd72663e34313c4559fc1e563))

## [4.4.47](https://github.com/podium-lib/podlet/compare/v4.4.46...v4.4.47) (2021-11-15)

### Bug Fixes

-   **deps:** update all dependencies ([f248848](https://github.com/podium-lib/podlet/commit/f248848bea2081735953658dc3eadbb2a21c2ac9))

## [4.4.46](https://github.com/podium-lib/podlet/compare/v4.4.45...v4.4.46) (2021-11-14)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.62 ([c1f9159](https://github.com/podium-lib/podlet/commit/c1f915917ccb9b8981ab4248458652c77b81480a))

## [4.4.45](https://github.com/podium-lib/podlet/compare/v4.4.44...v4.4.45) (2021-11-14)

### Bug Fixes

-   **deps:** update all dependencies ([42a93bf](https://github.com/podium-lib/podlet/commit/42a93bf95e2bc690641202277fe31bb59e04319a))

## [4.4.44](https://github.com/podium-lib/podlet/compare/v4.4.43...v4.4.44) (2021-11-13)

### Bug Fixes

-   **deps:** update dependency ajv to v8.8.0 ([e1550ef](https://github.com/podium-lib/podlet/commit/e1550ef04ba12ee6f08af564b8697751d0c9d7e4))

## [4.4.43](https://github.com/podium-lib/podlet/compare/v4.4.42...v4.4.43) (2021-11-09)

### Bug Fixes

-   **deps:** update all dependencies ([e93d3bc](https://github.com/podium-lib/podlet/commit/e93d3bc84b9dbfa4f9959506deb6c6a8ed5d210f))

## [4.4.42](https://github.com/podium-lib/podlet/compare/v4.4.41...v4.4.42) (2021-11-09)

### Bug Fixes

-   **deps:** update dependency @podium/schemas to v4.1.26 ([90e1339](https://github.com/podium-lib/podlet/commit/90e1339a746f568fa5589fe87e96a7d503051dfe))

## [4.4.41](https://github.com/podium-lib/podlet/compare/v4.4.40...v4.4.41) (2021-11-08)

### Bug Fixes

-   **deps:** update dependency ajv to v8.7.1 ([3dfedfa](https://github.com/podium-lib/podlet/commit/3dfedfab2306f0e1c3a2e2b904746fc9cdc713ed))

## [4.4.40](https://github.com/podium-lib/podlet/compare/v4.4.39...v4.4.40) (2021-10-27)

### Bug Fixes

-   **deps:** update all dependencies ([8368aa0](https://github.com/podium-lib/podlet/commit/8368aa005431dd127cbb83ec1c8a8e808a6ce1d1))

## [4.4.39](https://github.com/podium-lib/podlet/compare/v4.4.38...v4.4.39) (2021-09-13)

### Bug Fixes

-   **deps:** update all dependencies ([82a9a4a](https://github.com/podium-lib/podlet/commit/82a9a4a35c61853460661a9ba173667ac33440b4))

## [4.4.38](https://github.com/podium-lib/podlet/compare/v4.4.37...v4.4.38) (2021-09-12)

### Bug Fixes

-   **deps:** update dependency ajv to v8.6.3 ([cc4b489](https://github.com/podium-lib/podlet/commit/cc4b489d9605c112e9bdbc466ad76da57f247b47))

## [4.4.37](https://github.com/podium-lib/podlet/compare/v4.4.36...v4.4.37) (2021-08-14)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.55 ([76cb389](https://github.com/podium-lib/podlet/commit/76cb389e9b19cc8c67534a15589d220ed6138ceb))

## [4.4.36](https://github.com/podium-lib/podlet/compare/v4.4.35...v4.4.36) (2021-08-14)

### Bug Fixes

-   **deps:** update all dependencies ([83f4364](https://github.com/podium-lib/podlet/commit/83f43642321c7aa3b5d29a639a3dbfe45bcc7a77))

## [4.4.35](https://github.com/podium-lib/podlet/compare/v4.4.34...v4.4.35) (2021-08-14)

### Bug Fixes

-   **deps:** update dependency @podium/schemas to v4.1.24 ([f8f44f2](https://github.com/podium-lib/podlet/commit/f8f44f2576c5e897a572fe0228a960599daf18ea))

## [4.4.34](https://github.com/podium-lib/podlet/compare/v4.4.33...v4.4.34) (2021-07-16)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.53 ([59c66a6](https://github.com/podium-lib/podlet/commit/59c66a6525551e2fa7bd01516ea7620ac991befa))

## [4.4.33](https://github.com/podium-lib/podlet/compare/v4.4.32...v4.4.33) (2021-07-16)

### Bug Fixes

-   **deps:** update all dependencies ([88302c8](https://github.com/podium-lib/podlet/commit/88302c854869bec4a8db1fa53ac8395a2465ecc4))

## [4.4.32](https://github.com/podium-lib/podlet/compare/v4.4.31...v4.4.32) (2021-07-15)

### Bug Fixes

-   **deps:** update dependency ajv to v8.6.2 ([d57e0f6](https://github.com/podium-lib/podlet/commit/d57e0f6b4db4db415edf601e388b93e5f6aea6c7))

## [4.4.31](https://github.com/podium-lib/podlet/compare/v4.4.30...v4.4.31) (2021-07-04)

### Bug Fixes

-   **deps:** update all dependencies ([a4116ba](https://github.com/podium-lib/podlet/commit/a4116ba53a5c988678ae51bb84f467b41e0d73d9))

## [4.4.30](https://github.com/podium-lib/podlet/compare/v4.4.29...v4.4.30) (2021-07-04)

### Bug Fixes

-   **deps:** update dependency ajv to v8.6.1 ([1e112b3](https://github.com/podium-lib/podlet/commit/1e112b3faef4d4225b0a1f68e131a4eeaef8edf7))

## [4.4.29](https://github.com/podium-lib/podlet/compare/v4.4.28...v4.4.29) (2021-06-07)

### Bug Fixes

-   **deps:** update all dependencies ([caa9fcf](https://github.com/podium-lib/podlet/commit/caa9fcf8f174144f62a92700af43839b2784de80))

## [4.4.28](https://github.com/podium-lib/podlet/compare/v4.4.27...v4.4.28) (2021-06-06)

### Bug Fixes

-   **deps:** update dependency ajv to v8.6.0 ([b5723a9](https://github.com/podium-lib/podlet/commit/b5723a93e5fe70c567d230b0e70c0895d6608561))

## [4.4.27](https://github.com/podium-lib/podlet/compare/v4.4.26...v4.4.27) (2021-05-24)

### Bug Fixes

-   **deps:** update all dependencies ([d970008](https://github.com/podium-lib/podlet/commit/d9700085acb0779181cef168f84080bbd9d03f0e))

## [4.4.26](https://github.com/podium-lib/podlet/compare/v4.4.25...v4.4.26) (2021-05-24)

### Bug Fixes

-   **deps:** update dependency ajv to v8.5.0 ([2a0131b](https://github.com/podium-lib/podlet/commit/2a0131bd5126cd0a572cadf199d57185ef5cc7be))

## [4.4.25](https://github.com/podium-lib/podlet/compare/v4.4.24...v4.4.25) (2021-05-15)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.45 ([81df855](https://github.com/podium-lib/podlet/commit/81df855ce6c15e3d36f30e3eb778d8e906edae78))

## [4.4.24](https://github.com/podium-lib/podlet/compare/v4.4.23...v4.4.24) (2021-05-15)

### Bug Fixes

-   **deps:** update all dependencies ([7fd8e49](https://github.com/podium-lib/podlet/commit/7fd8e494ea55043c65634f3c49d5e4dedcc03b73))

## [4.4.23](https://github.com/podium-lib/podlet/compare/v4.4.22...v4.4.23) (2021-05-09)

### Bug Fixes

-   **deps:** update all dependencies ([763da37](https://github.com/podium-lib/podlet/commit/763da374e57d935e93892f415a43a3c485e52cba))

## [4.4.22](https://github.com/podium-lib/podlet/compare/v4.4.21...v4.4.22) (2021-05-05)

### Bug Fixes

-   **deps:** update all dependencies ([e1e24c6](https://github.com/podium-lib/podlet/commit/e1e24c6668756dcc9a72c79a936f208e51cd584d))

## [4.4.21](https://github.com/podium-lib/podlet/compare/v4.4.20...v4.4.21) (2021-04-27)

### Bug Fixes

-   **deps:** update all dependencies ([916968a](https://github.com/podium-lib/podlet/commit/916968af86b69bf592775270f6296d1247820ce3))

## [4.4.20](https://github.com/podium-lib/podlet/compare/v4.4.19...v4.4.20) (2021-04-12)

### Bug Fixes

-   **deps:** update all dependencies ([d3efefb](https://github.com/podium-lib/podlet/commit/d3efefbc48621809edca0fa004a1405a8829be02))

## [4.4.19](https://github.com/podium-lib/podlet/compare/v4.4.18...v4.4.19) (2021-04-03)

### Bug Fixes

-   **deps:** update dependency ajv to v8.0.5 ([70e97b7](https://github.com/podium-lib/podlet/commit/70e97b71cbba564b66dd59f4035eafff7b94a466))

## [4.4.18](https://github.com/podium-lib/podlet/compare/v4.4.17...v4.4.18) (2021-04-03)

### Bug Fixes

-   **deps:** update [@podium](https://github.com/podium) packages ([77fb104](https://github.com/podium-lib/podlet/commit/77fb104e008ce285331b22b2cb1a1e4cd99e1361))

## [4.4.17](https://github.com/podium-lib/podlet/compare/v4.4.16...v4.4.17) (2021-03-31)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.30 ([8bd0e57](https://github.com/podium-lib/podlet/commit/8bd0e575bb1545a3cf93a6cf4d0b8285ea6782c8))

## [4.4.16](https://github.com/podium-lib/podlet/compare/v4.4.15...v4.4.16) (2021-03-31)

### Bug Fixes

-   Add ajv as a dependency to deal with peer dep issues ([0a199fe](https://github.com/podium-lib/podlet/commit/0a199fe361760b6f55ad0f7bb851c0b70d969498))

## [4.4.15](https://github.com/podium-lib/podlet/compare/v4.4.14...v4.4.15) (2021-03-30)

### Bug Fixes

-   Update @podium/schema to version 4.1.9 to fix ajv error ([4b13199](https://github.com/podium-lib/podlet/commit/4b1319940b5ae2d47e3a0fa338ac96eb5201be25))

## [4.4.14](https://github.com/podium-lib/podlet/compare/v4.4.13...v4.4.14) (2020-10-29)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.8 ([025ab94](https://github.com/podium-lib/podlet/commit/025ab94ac79b20ac65745098800815b82f507632))

## [4.4.13](https://github.com/podium-lib/podlet/compare/v4.4.12...v4.4.13) (2020-10-29)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v4.4.1 ([a3efa6b](https://github.com/podium-lib/podlet/commit/a3efa6b94b2c311e405cd21c0525b4d19c0c37c5))

## [4.4.12](https://github.com/podium-lib/podlet/compare/v4.4.11...v4.4.12) (2020-10-12)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.7 ([3103c29](https://github.com/podium-lib/podlet/commit/3103c2908c2ecb19a52dfc09704f399177213a93))

## [4.4.11](https://github.com/podium-lib/podlet/compare/v4.4.10...v4.4.11) (2020-10-12)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v4.4.0 ([6acd127](https://github.com/podium-lib/podlet/commit/6acd127c3a05308c848994f0652ef20520d4ff89))

## [4.4.10](https://github.com/podium-lib/podlet/compare/v4.4.9...v4.4.10) (2020-10-10)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.6 ([e70dff0](https://github.com/podium-lib/podlet/commit/e70dff011e52b77b25c58d915ffd665cec6175d3))

## [4.4.9](https://github.com/podium-lib/podlet/compare/v4.4.8...v4.4.9) (2020-10-10)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.5 ([ce16e53](https://github.com/podium-lib/podlet/commit/ce16e53ec6cae82c0431a57c4c042ebfc241d0c1))

## [4.4.8](https://github.com/podium-lib/podlet/compare/v4.4.7...v4.4.8) (2020-10-10)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v4.3.3 ([85a5b43](https://github.com/podium-lib/podlet/commit/85a5b43be0755d7aee0df39c0cc3a6c34bbd2d25))

## [4.4.7](https://github.com/podium-lib/podlet/compare/v4.4.6...v4.4.7) (2020-10-10)

### Bug Fixes

-   **deps:** update dependency @podium/schemas to v4.0.5 ([92df10d](https://github.com/podium-lib/podlet/commit/92df10dbb4d073f055308e9ff31c8414e17f2c9b))

## [4.4.6](https://github.com/podium-lib/podlet/compare/v4.4.5...v4.4.6) (2020-09-29)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.4 ([4a87242](https://github.com/podium-lib/podlet/commit/4a8724229b9e46bb6a60d00e304d6c6cd9274fb3))

## [4.4.5](https://github.com/podium-lib/podlet/compare/v4.4.4...v4.4.5) (2020-09-13)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.3 ([aa08351](https://github.com/podium-lib/podlet/commit/aa083517aa5de4945d26d6caab82acec78a277e2))

## [4.4.4](https://github.com/podium-lib/podlet/compare/v4.4.3...v4.4.4) (2020-09-13)

### Bug Fixes

-   **deps:** update dependency @podium/utils to v4.3.1 ([a08ab18](https://github.com/podium-lib/podlet/commit/a08ab18fe744a21f39086de3678981e9fe28ef62))

## [4.4.3](https://github.com/podium-lib/podlet/compare/v4.4.2...v4.4.3) (2020-09-13)

### Bug Fixes

-   **deps:** update dependency @podium/proxy to v4.2.2 ([ac8fd49](https://github.com/podium-lib/podlet/commit/ac8fd495df7fbe4238886aae9e9ff5769c37a037))

## [4.4.2](https://github.com/podium-lib/podlet/compare/v4.4.1...v4.4.2) (2020-09-13)

### Bug Fixes

-   **deps:** update dependency @podium/schemas to v4.0.4 ([c16d777](https://github.com/podium-lib/podlet/commit/c16d777eaf8d01bb095e34549cf66e86b7f611da))

## [4.4.1](https://github.com/podium-lib/podlet/compare/v4.4.0...v4.4.1) (2020-08-15)

### Bug Fixes

-   **deps:** update dependency @podium/schemas to v4.0.3 ([0469aa4](https://github.com/podium-lib/podlet/commit/0469aa4304c19205922c694a91ecc477422ed591))

# [4.4.0](https://github.com/podium-lib/podlet/compare/v4.3.4...v4.4.0) (2020-06-28)

### Features

-   Added support for data-\* attributes on .js() method ([84b1a48](https://github.com/podium-lib/podlet/commit/84b1a484af669194f0f4521482de1d16325a4606))

# Changelog

Notable changes to this project.

The latest version of this document is always available in [releases][releases-url].

## [Unreleased]

## [4.0.1] - 2019-06-14

-   Fixed an issue where `publicPathname` was not constructed correctly in podlets when in development mode

## [4.0.0] - 2019-06-12

-   See [the release notes](https://podium-lib.io/blog/2019/06/14/Version-4.0.0)

## [3.0.3] - 2019-03-27

-   Updated @podium/proxy to version 3.0.4 - [#19](https://github.com/podium-lib/podlet/pull/19)
-   Remove redudant use of lodash.merge - [#18](https://github.com/podium-lib/podlet/pull/18)
-   Updated @podium/utils to version 3.1.2 - [#17](https://github.com/podium-lib/podlet/pull/17)
-   Updated other dependencies

## [3.0.2] - 2019-03-11

-   Update @podium/proxy to version 3.0.3 to handle Max Eventlisteners warning and improve error handling - [#16](https://github.com/podium-lib/podlet/pull/16)
-   Update @metric/client to version 2.4.1 to handle Max Eventlisteners warning - [#15](https://github.com/podium-lib/podlet/pull/15)

## [3.0.1] - 2019-03-05

-   Update @podium/proxy to version 3.0.1 - [#12](https://github.com/podium-lib/podlet/pull/12)
-   Add error event listeners on all metric streams - [#11](https://github.com/podium-lib/podlet/pull/11)

## [3.0.0] - 2019-02-21

-   Initial open source release. Module is made http framework free and open source.

[unreleased]: https://github.com/podium-lib/podlet/compare/v4.0.1...HEAD
[4.0.1]: https://github.com/podium-lib/podlet/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/podium-lib/podlet/compare/v3.0.3...v4.0.0
[3.0.3]: https://github.com/podium-lib/podlet/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/podium-lib/podlet/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/podium-lib/podlet/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/podium-lib/podlet/releases/tag/v3.0.0
[releases-url]: https://github.com/podium-lib/podlet/blob/main/CHANGELOG.md
