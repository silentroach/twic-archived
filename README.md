# Twic Extension

The opensource twitter client for Chromium based browsers.

## Twitter API v.2

Project is closed cause of Twitter API v.2 rules and restrictions. It breaks Twic look and feel.

## How to prepare your developer version

    mkdir twic
    git clone https://github.com/silentroach/twic.git twic
    cd twic
    git submodule update --init --recursive

That's all you need to help me develop this awesome extension.

**Be carefull** to use the git master branch version - automatical database structure migrations are described **only between production versions**.

## Testing

All you need to test the extension is to add the "src" folder to your Chrome extensions list (in developer mode).

## Building

To prepare the builder you need to run this for the first time:

    tools/builder/tools/prepare

To build the extension you need to run

    make extension

**Note** that NodeJS and Java are used in builder, you need to install it first.

## Copyright

[Kalashnikov Igor](mailto:igor.kalashnikov@me.com)

Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported

## 3rdparty

* [Google Closure Library](http://code.google.com/closure/library/) - base library for some language enhancements
* [SHA1 crypt implementation](http://pajhome.org.uk/crypt/md5)
* [Twitter Text](https://github.com/twitter/twitter-text-js)
* [Iconza project icons](http://www.iconza.com/)
