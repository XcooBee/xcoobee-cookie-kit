# XcooBee Cookie Kit Project Monorepo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

The XcooBee Cookie Kit is an active GDPR/CCPA cookie & fingerprint and consent as well as script-loading manager for your site.

In a world where websites are constructed from many different pre-build components and scripts, the XCK uses smart script and cookie loading **and** removal to help you remain compliant with regulations even when you have poorly written scripts and cookies.

The XcooBee Cookie Kit project is maintained as a monorepo (one repo with multiple projects) with several NPM
packages. Lerna is the tool we use to maintain the monorepo. Checkout the `packages`
sub-directory for specific packages.

There are three packages we maintain in the monorepo.

- [XcooBee Cookie Kit Core](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-core) - core services managing browser cookies
- [XcooBee Cookie Kit Web](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-web) - JavaScript based plugin into any website
- [React JS Cookie Kit](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-react) - prepackaged React JS implementation of cookie management


## Using the Cookie Kit

The packages are also published individually to npm. This is where you should look if you wish to use the Cookie Kit. You can also install the core libraries using `npm i xcoobee-cookie-kit-core`, but most likely you will only need the web or react versions:

- [npm i xcoobee-cookie-kit-web](https://www.npmjs.com/package/xcoobee-cookie-kit-web)
- [npm i react-cookie-kit](https://www.npmjs.com/package/react-cookie-kit)


## To Install all Packages in Monorepo for contribution purposes

This is where you should look if you want to contribute and make changes and submit Pull Requests.

Please run the following commands from the root project folder

```
npm install
npm run bootstrap
```

## To Build

Run the following to build all distribution packages simultaneously

`npm run build`

To build web distribution for XcooBee production:

`npm run web:buildbeta`


## To Contribute

Please see our contribution document to make contributions to this project.

[Contribute](https://github.com/XcooBee/xcoobee-cookie-kit/blob/master/CONTRIBUTING.md)


## Individual Repos

All repos are published individually in npm. You can review each package's source code here:

- [XcooBee Cookie Kit Core](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-core)
- [XcooBee Cookie Kit Web](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-web)
- [React JS Cookie Kit](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-react)


## Video

[Cookie Kit Tutorial](https://youtu.be/gKYNoARNXRo) - shows the programming and usage in a plain HTML single-page application.
