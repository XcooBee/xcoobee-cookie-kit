# XcooBee Cookie Kit

## What is the XCK

The objective of the XcooBee Cookie Kit (XCK) is to enable websites to manage their Cookie consent more effectively and with less annoyance to their users. The XCK can work in concert with the XcooBee network to improve overall management for users and businesses but that is not required. When the XCK works independently of XcooBee some management functionality will not be available.

The XCK makes it easy to plugin cookie consent into your website. It handles all user interaction to obtain consent and lets the website know which cookies can be used for each users while they visit your website. Similarly, your website can now be informed when users change their consent even when they are not visiting it.

THe XCK is one of the most transparent and frictionless ways to manage cookies on your site. It will not pop-up, in, or otherwise hinder the user experience when it is not needed. Yet, at the same time, it provides full compliance with European e-directives and related GDPR rules. 

Website owners can easily react to data-requests, and report on privacy related requests if needed via the XcooBee network.

The XCK does not require a XcooBee connection to work for your website. You will still have access to the majority of user consent gathering but will not have central insight and consent management.

## Install

You activate the XCK by embedding it into your site via `<script>` tags. In addition, during invocation you provide additional parameters to the script tag.

Some of these include:

- position of the hover button
- terms url
- cookie policy url
- expiration time for the widget
- text message
- cookie handling function
- site defaults
- target Url

When you subscribe to XcooBee you can also specify:

- your campaign reference
- company logo
- cssAutoLoad

A `campaignId` is needed for the XCK to communicate with XcooBee and allow management of consents. Please visit [XcooBee](https://www.xcoobee.com) if you need to create an account. Without it the XCK will work in offline mode.


## Initialization Parameters

The XCK is initialized with a set of parameters that determine the behavior of the XCK on your site. This can include rendering location, timeouts, event handlers, css etc.

The following is a list of parameters the XCK can process:

### checkByDefaultTypes

This is an array of strings of cookie types used on your sites by default. This is one or more of [application_cookie|usage_cookie|statistics_cookie|advertising_cookie]. The default is empty array.

Example:

```json
  checkByDefaultTypes: ["application_cookie"]
```

### cookieHandler

If you are using a single page application or a JavaScript based solution for setting cookies you need to specify a cookie handler function, e.g.  `handleCookies(<object>)`. The XCK will call this function with the user's preferences or defaults as needed. This function should either remove or set the cookies based on the categories allowed by user.

This is related to `targetUrl`. One of `cookieHandler` or `targetUrl` is required to be specified for XCK to start.

See more information in section `How to Use the XcooBee Cookie Kit` in this document.

```json
cookieHandler: handleCookies
```

### expirationTime `integer`

This is the time in seconds we will display the floating cookie icon. After the expiration time has been reached the floating cookie icon will be removed from display. This time resets every time the icon is clicked and a pop-up dialog is displayed.

When set to zero, the icon will not be removed.

Defaults to zero.

```json
expirationTime: 0

```

### position `list`

The position parameter is one of [left_bottom|left_top|right_bottom|right_top] and indicates the position from which the XCK displays its window or floating cookie icon. Default: left_bottom

```
position: "left_bottom"
```

### privacyUrl `string` `required`

This is the page the user will be directed to to review your Privacy Policy. The cookie kit will not start without data for Privacy Policy.

```json
termsUrl: "https://mysite.com/privacy"
```

### requestDataTypes
 This is an array of strings of cookie types used on your sites for which you wish to obtain the users' consent before creating. This is one or more of [application_cookie|usage_cookie|statistics_cookie|advertising_cookie]. The default is `application_cookie`.

 ```json
  requestDataTypes: ["application_cookie"]
```

### targetUrl `string`

If you are using Request/Response technology based site, for example PHP, JSP, CFML and you set the cookies in your code, the XCK will make a call via HTTP GET to the targetUrl you specify and a URL parameter payload with the user's preferences for cookies. 

You will, then, need to set them accordingly. We encourage the use of HTTPS/TLS connections to ensure proper security.

This is related to `cookieHandler`. One of `cookieHandler` or `targetUrl` is required to be specified for XCK to start.

See more information in section `How to Use the XcooBee Cookie Kit` in this document.

```json
targetUrl: "https://mysite.com/setCookies"
```


### termsUrl `string` `required`

This is the page the user will be directed to to review your Terms of Service. The cookie kit will not start without valid terms of service.

```json
termsUrl: "https://mysite.com/terms"
```

### textMessage `string` `required`

This is the message we will display to the user when asking for cookie preferences. This message can be formatted as string or as JSON. When using JSON you can specify the message in different languages. The XCK will make an attempt to determine the default language based on browser settings and fallback to US English if it cannot make a determination. The cookie kit will not start without a consent message to display to users.

Example of text entry in single language:

```json
textMessage: "This site uses cookies. Please select the cookie types that you wish to use and then click OK"

```

Example of text entry in multiple languages:

```json
{
  "en-us": "English text",
  "de-de": "German text",
  "es-419": "Spanish text",
  "fr-fr": "French text",
}
```


## Initialization Parameters with XcooBee subscription

### campaignReference

This connects your campaignId to the XCK. The XcooBee campaign wizard will generate it for you.

### companyLogo

The XCK can display your company logo. Your cookie campaign options will have the ability to upload a logo and will make available to the XCK.
This parameter is only available when subscripting to XcooBee.

### CSS override 

If you wish to use your own CSS, the XcooBee code generator will set this based on your selection for your Cookie Campaign. Your campaign wizard will guide you through the process.

### campaignName

Your campaign name in XcooBee needs to match your website name that is hosting the XCK.



## Program Hooks

- [events]
  - cookie scripts
  - cookie domains by type
- [parameters]

## Examples of script tag

```javascript
<script type="text/javascript" id="xcoobee-cookie-kit" src="{URL}/xcoobee-cookie-kit.min.js"></script>
<script type="text/javascript">
  Xcoobee.initialize({
    campaignReference: <String>,
    campaignName: <String>,
    checkByDefaultTypes: <Array>[application_cookie|usage_cookie|statistics_cookie|advertising_cookie]
    companyLogo: <Base64>,
    cookieHandler: <Function>
    cssAutoLoad: <Boolean>,
    expirationTime: <Number> (in seconds),
    position: <String> ("left_bottom", "left_top", "right_bottom", "right_top"),
    privacyUrl: <String>,
    requestDataTypes: <Array>[application_cookie|usage_cookie|statistics_cookie|advertising_cookie],
    targetUrl: <String>,
    termsUrl: <String>,
    testMode: <Boolean>,
    textMessage: <String>, <JSON>
  });
</script>
```


## CSS Reference

<link rel="stylesheet" href="{URL}/xcoobee-cookie-kit.min.css">

All of the display elements can be overridden, however, we can not support non-standard CSS values.

# How to Use the XcooBee Cookie Kit

## How to use Cookie Kit in Single Page Application (SPA)

When using a SPA you can specify a JavaScript handler that can receive the result of the user interaction for cookie consent. Thereafter you need to load the scripts and/or set the cookies directly based on the user's interaction.

Since this can change, you also need to be able to remove the cookies when users change their mind.

In both cases, the XCK will invoke your handler function after the user has completed their interaction with XCK.

XCK will call target handler with JSON object as function parameter. Users preferences are in the first function argument.

The function argument object will be a JS Object.

Example JS object:

```json
{
  "application": true,
  "usage": true,
  "statistics": false,
  "advertising": false 
}

```

Thus the call signature will be: `handlerFunction(cookieObject)`.

For example if your handler function is named `cookieHandler` and the  object is named `userCookiePreferences` this would be the call:

```JavaScript

  cookieHandler(userCookiePreferences);

```

Sample cookieHandler function:

```JavaScript

function cookieHandler(cookieObject) {
    if (cookieObject.application) {
      // set required cookies here
      // ...
    } else {
      // remove required cookie here
      // ...
    };

    if (cookieObject.usage) {
      // set user personalization cookies here
      // ...
    } else {
      // remove user personalization cookies here
      // ...
    };

    if (cookieObject.statistics) {
      // set site statistics gathering cookies here
      // ...
    } else {
      // remove site statistics gathering cookies here
      // ...
    };

    if (cookieObject.advertising) {
      // set advertising and marketing and tracking cookies here
      // ...
    } else {
      // remove advertising and marketing and tracking cookies here
      // ...
    };
}

```


## How to use Cookie Kit with Request/Response systems like PHP, JSP, .net, CFML etc.

The XCK can communicate users' grant and removal of consent for cookies to your site via webhook post (HTTP POST) as well. You will need an web accessible endpoint as defined by `targetUrl` that can process these messages and set/unset the cookies by cookie type.

[TODO: provide example. We should make this like the SDK so they can use the same page for both. The following example does not match SDK pattern and is simplified. Use POST example ask Volodymyr].

[Will be a webhook post HTTP POST]

- specify target url
- XCK will use an HTTP POST with URL parameter for each cookie type and true or false as value

The possible types are:
  - application
  - usage
  - statistics
  - advertising

```HTTP

  https://mysite.com/process-cookies.jsp?application=true&usage=false&statistics=false&advertising=false

```


## How use the XCK with XcooBee subscription and high security data exchange

When you have a XcooBee subscription your website can also receive updates regarding the granted consent when the user if not directly online via the XcooBee network. This communication will occur through webhooks and higher level of encryption. 

As an alternative to direct HTTP POST, your subscription to the XcooBee network also allows event polling so you can use the XCK for sites that are not directly accessible via the internet, i.e. intranet sites or sites under development.

You need to be able to process messages from XcooBee that are using PGP encryption on top of HTTPS/TLS. 
The message pattern is the same as described previous section. 

You can use one of the XcooBee SDKs for simplifying this interaction:

- [XcooBee JavaScript SDK](https://github.com/XcooBee/xcoobee-js-sdk)
- [XcooBee PHP SDK](https://github.com/XcooBee/xcoobee-php-sdk)

The use of the XcooBee network is not a required interaction. Users will transparently update their cookie preferences with your site every time they visit. 

