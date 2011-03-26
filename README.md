Twic
================================================================

The [opensource twitter client](https://chrome.google.com/webstore/detail/hglcekhnfbahipbmdceknefmpncbpikg) for Chromium based browsers

Please don't forget to:

    git submodule update --init --recursive

**Be carefull** to use the git master branch version - automatical database structure migrations are described **only betweet production versions**.

Copyright
---------

[Kalashnikov Igor](mailto:igor.kalashnikov@gmail.com)

Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported

3rdparty
--------

* [SHA1 crypt implementation](http://pajhome.org.uk/crypt/md5)
* [Iconza icons](http://www.iconza.com/)

Specific commands
-----------------

You can use make command to do something:

* lint all js files in project

      make lint

* search for FIXME and TODO annotations in js comments

      make todo

* build the extension (doesn't work yet)

      make extension
