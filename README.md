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

When you subscribe to XcooBee you can also specify:

- your campaignId
- company logo

A `campaignId` is needed for the XCK to communicate with XcooBee and allow management of consents. Please visit [XcooBee](https://www.xcoobee.com) if you need to create an account. Without it the XCK will work in offline mode.

## Program Hooks

- [events]
- [parameters]

## Examples of script tag

```javascript
<script type="text/javascript" id="xcoobee-cookie-kit" src="{URL}/xcoobee-cookie-kit.min.js"></script>
<script type="text/javascript">
  Xcoobee.initialize({
    campaignId: <String>,
    position: <String> ("left_bottom", "left_top", "right_bottom", "right_top"),
    termsUrl: <String>,
    privacyUrl: <String>,
    expirationTime: <Number> (in seconds),
    companyLogoUrl: <String>,
    cookieHandler: <Function>
    textMessage: <String>, <JSON>,
    cssAutoLoad: <Boolean>
  });
</script>
```

## CSS Reference

<link rel="stylesheet" href="{URL}/xcoobee-cookie-kit.min.css">

All of the display elements can be overridden, however, we can not support non-standard CSS values.

# How to Use the XcooBee Cookie Kit

## How to use Cookie Kit in Single Page Application

[TODO: provide example]

## How to use Cookie Kit with Request/Response systems like PHP, JSP, etc.

[TODO: provide example]