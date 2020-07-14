# [5.0.0-next.1](https://github.com/podium-lib/podlet/compare/v4.4.0...v5.0.0-next.1) (2020-07-14)


### Features

* Drop node 10.x support ([1f9ca4f](https://github.com/podium-lib/podlet/commit/1f9ca4f97e8da9addac4e70813ba981e7742ec9e))


### BREAKING CHANGES

* Only support node 12 and 14.

# [4.4.0](https://github.com/podium-lib/podlet/compare/v4.3.4...v4.4.0) (2020-06-28)


### Features

* Added support for data-* attributes on .js() method ([84b1a48](https://github.com/podium-lib/podlet/commit/84b1a484af669194f0f4521482de1d16325a4606))

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
[releases-url]: https://github.com/podium-lib/podlet/blob/master/CHANGELOG.md
