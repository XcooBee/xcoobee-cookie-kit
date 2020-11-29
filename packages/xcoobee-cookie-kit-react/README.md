# React Cookie Kit


## Download and use

Published as Open Source under Apache-2.0 License
https://www.npmjs.com/package/react-cookie-kit


## What is React Cookie Kit

The React Cookie Kit is special purpose build of the [XcooBee Cookie Kit (XCK)](https://www.npmjs.com/package/xcoobee-cookie-kit-web) Cookie Consent and Script Management library for use in ReactJS environments.
It is an active cookie and script consent manager for your site. It will load 3rd party scripts only when consent is verified removing the need for complex costly paid services that need to look and classify each cookie. The XCK prevents the loading of the script until you have reason to do so.
Thus, the react cookie kit is a true cookie-consent and script and life-cycle manager. It will help you implement the premises of the CCPA,GDPR, and European e-directive correctly.


## Video

[Cookie Kit Tutorial](https://youtu.be/gKYNoARNXRo)

## The XcooBee Cookie Kit

The XcooBee Cookie Kit (XCK) is **both** a cookie and script consent manager. It will load scripts and set cookies only when consent is verified and also automatically clean up when consent is removed.

The objective of the XcooBee Cookie Kit (XCK) is to enable websites to manage their cookie and script consent more effectively and with less annoyance to their users. The XCK can work in concert with the XcooBee network to improve overall management for users and businesses but that is not required. When the XCK works independently of XcooBee some management functionality will not be available.

The XCK makes it easy to plugin cookie, script, fingerprint and Do-Not-Sell consent into your website. It handles all user interaction to obtain consent and lets the website know which cookies and scripts can be used for each user while they visit your website. Similarly, your website can now be informed when users change their consent even when they are not visiting it.

The XCK is one of the most transparent and frictionless ways to manage cookies on your site. It will not pop-up, in, or otherwise hinder the user experience when it is not needed. Yet, at the same time, it provides full compliance with European e-directives and related GDPR rules as well as parts of the CCPA rules.

Website owners can easily react to data-requests and report on privacy related requests if needed via the XcooBee network.

The XCK does not require a XcooBee connection to work for your website. 

The XCK is responsive and will adjust easily to different screens including mobile uses.

Main components and further documentation:
- [XcooBee Cookie Kit Core](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-core)
- [XcooBee Cookie Kit Web](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-web)
- [React Cookie Kit](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-react)


## Using XCK with React

You need to add the cookie kit as dependency in your project

`npm install react-cookie-kit --save`


Inside your code you need to import the cookie kit

```js
import CookieKit from 'react-cookie-kit';

```

We also recommend that you import the style sheet

```js
import 'react-cookie-kit/dist/xck-react.css';
```

inside your render() method you can, then, use the cookie kit with all the available options:

```html
        <CookieKit
          cssAutoLoad={false}
          cookieHandler={this.onCookieConsentsChange}
          privacyUrl="https://mysite.com/privacy"
          requestDataTypes={['advertising', 'application', 'statistics', 'usage']}
          termsUrl="https://mysite.com/terms"
          textMessage={{
            "de-de": "Die Beschreibung. Wir benutzen Cookies.",
            "en-us": "The description. We use Cookies.",
            "es-419": "La descripción. Nous utilisons des cookies.",
            "fr-fr": "La description. Usamos cookies.",
          }}
        />
```

For further information on the type of available options and their use please consult the general documentation under Full Parameter Reference.

- [Cookie Kit Options](https://github.com/XcooBee/xcoobee-cookie-kit/tree/master/packages/xcoobee-cookie-kit-web#full-parameter-reference)


### Example App

A ReactJS example app is available in zip format for you to use in the example directory of this package or online:

- [Cookie Kit React Example App on Github](https://github.com/XcooBee/example-reactjs-xck-app)


