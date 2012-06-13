/**
* Modified Twitter Text 1.4.16 (original https://github.com/twitter/twitter-text-js)
*/

twic.text = { };

/**
 * @private
 */
twic.text.expr_ = { };

/**
 * Initialized
 * @private
 */
twic.text._initialized = false;

/**
 * Builds a RegExp
 * @param {RegExp|string} regex
 * @param {string=} flags
 * @private
 */
twic.text._regexSupplant = function(regex, flags) {
    flags = flags || '';

    if (!goog.isString(regex)) {
        if (regex.global && flags.indexOf("g") < 0) {
            flags += "g";
        }

        if (regex.ignoreCase && flags.indexOf("i") < 0) {
            flags += "i";
        }

        if (regex.multiline && flags.indexOf("m") < 0) {
            flags += "m";
        }

        regex = regex.source;
    }

    return new RegExp(regex.replace(/#\{(\w+)\}/g, function(match, name) {
        var newRegex = twic.text.expr_[name] || "";

        if (!goog.isString(newRegex)) {
            newRegex = newRegex.source;
        }

        return newRegex;
    }), flags);
};

/**
 * Simple string interpolation
 * @private
 */
twic.text._stringSupplant = function(str, values) {
    return str.replace(/#\{(\w+)\}/g, function(match, name) {
        return values[name] || '';
    } );
};

/**
 * @private
 */
twic.text._initialize = function() {
    if (twic.text._initialized) {
        return true;
    }

    /**
     * @param {Array} charClass
     * @param {number} start
     * @param {number} end
     */
    var addCharsToCharClass = function(charClass, start, end) {
        var s = String.fromCharCode(start);

        if (end !== start) {
            s += "-" + String.fromCharCode(end);
        }

        charClass.push(s);

        return charClass;
    };

    /**
     * Space is more than %20, U+3000 for example is the full-width space used with Kanji. Provide a short-hand
     * to access both the list of characters and a pattern suitible for use with String#split
     * Taken from: ActiveSupport::Multibyte::Handlers::UTF8Handler::UNICODE_WHITESPACE
     */
    var unicode_spaces = [
        String.fromCharCode(0x0020), // White_Space # Zs       SPACE
        String.fromCharCode(0x0085), // White_Space # Cc       <control-0085>
        String.fromCharCode(0x00A0), // White_Space # Zs       NO-BREAK SPACE
        String.fromCharCode(0x1680), // White_Space # Zs       OGHAM SPACE MARK
        String.fromCharCode(0x180E), // White_Space # Zs       MONGOLIAN VOWEL SEPARATOR
        String.fromCharCode(0x2028), // White_Space # Zl       LINE SEPARATOR
        String.fromCharCode(0x2029), // White_Space # Zp       PARAGRAPH SEPARATOR
        String.fromCharCode(0x202F), // White_Space # Zs       NARROW NO-BREAK SPACE
        String.fromCharCode(0x205F), // White_Space # Zs       MEDIUM MATHEMATICAL SPACE
        String.fromCharCode(0x3000)  // White_Space # Zs       IDEOGRAPHIC SPACE
    ];

    var invalid_chars = [
        String.fromCharCode(0xFFFE),
        String.fromCharCode(0xFEFF), // BOM
        String.fromCharCode(0xFFFF)  // Special
    ];

    var
        nonLatinHashtagChars = [],
        latinAccentChars = [];

    // White_Space # Cc   [5] <control-0009>..<control-000D>
    addCharsToCharClass(unicode_spaces, 0x009, 0x00D);
    // White_Space # Zs  [11] EN QUAD..HAIR SPACE
    addCharsToCharClass(unicode_spaces, 0x2000, 0x200A);

    // Directional change
    addCharsToCharClass(invalid_chars, 0x202A, 0x202E);

    twic.text.expr_['spaces_group'] = twic.text._regexSupplant(unicode_spaces.join(''));
    twic.text.expr_['spaces'] = twic.text._regexSupplant("[" + unicode_spaces.join('') + ']');
    twic.text.expr_['invalid_chars_group'] = twic.text._regexSupplant(invalid_chars.join(''));
    twic.text.expr_['punct'] = /\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?@\[\]\^_{|}~\$/;
    twic.text.expr_['atSigns'] = /[@＠]/;
    twic.text.expr_['extractMentions'] = twic.text._regexSupplant(/(^|[^a-zA-Z0-9_!#$%&*@＠])(#{atSigns})([a-zA-Z0-9_]{1,20})/g);

    // Cyrillic
    addCharsToCharClass(nonLatinHashtagChars, 0x0400, 0x04ff); // Cyrillic
    addCharsToCharClass(nonLatinHashtagChars, 0x0500, 0x0527); // Cyrillic Supplement
    addCharsToCharClass(nonLatinHashtagChars, 0x2de0, 0x2dff); // Cyrillic Extended A
    addCharsToCharClass(nonLatinHashtagChars, 0xa640, 0xa69f); // Cyrillic Extended B
    // Hebrew
    addCharsToCharClass(nonLatinHashtagChars, 0x0591, 0x05bd); // Hebrew
    addCharsToCharClass(nonLatinHashtagChars, 0x05bf, 0x05bf);
    addCharsToCharClass(nonLatinHashtagChars, 0x05c1, 0x05c2);
    addCharsToCharClass(nonLatinHashtagChars, 0x05c4, 0x05c5);
    addCharsToCharClass(nonLatinHashtagChars, 0x05c7, 0x05c7);
    addCharsToCharClass(nonLatinHashtagChars, 0x05d0, 0x05ea);
    addCharsToCharClass(nonLatinHashtagChars, 0x05f0, 0x05f2);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb12, 0xfb28); // Hebrew Presentation Forms
    addCharsToCharClass(nonLatinHashtagChars, 0xfb2a, 0xfb36);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb38, 0xfb3c);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb3e, 0xfb3e);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb40, 0xfb41);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb43, 0xfb44);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb46, 0xfb4f);
    // Arabic
    addCharsToCharClass(nonLatinHashtagChars, 0x0610, 0x061a); // Arabic
    addCharsToCharClass(nonLatinHashtagChars, 0x0620, 0x065f);
    addCharsToCharClass(nonLatinHashtagChars, 0x066e, 0x06d3);
    addCharsToCharClass(nonLatinHashtagChars, 0x06d5, 0x06dc);
    addCharsToCharClass(nonLatinHashtagChars, 0x06de, 0x06e8);
    addCharsToCharClass(nonLatinHashtagChars, 0x06ea, 0x06ef);
    addCharsToCharClass(nonLatinHashtagChars, 0x06fa, 0x06fc);
    addCharsToCharClass(nonLatinHashtagChars, 0x06ff, 0x06ff);
    addCharsToCharClass(nonLatinHashtagChars, 0x0750, 0x077f); // Arabic Supplement
    addCharsToCharClass(nonLatinHashtagChars, 0x08a0, 0x08a0); // Arabic Extended A
    addCharsToCharClass(nonLatinHashtagChars, 0x08a2, 0x08ac);
    addCharsToCharClass(nonLatinHashtagChars, 0x08e4, 0x08fe);
    addCharsToCharClass(nonLatinHashtagChars, 0xfb50, 0xfbb1); // Arabic Pres. Forms A
    addCharsToCharClass(nonLatinHashtagChars, 0xfbd3, 0xfd3d);
    addCharsToCharClass(nonLatinHashtagChars, 0xfd50, 0xfd8f);
    addCharsToCharClass(nonLatinHashtagChars, 0xfd92, 0xfdc7);
    addCharsToCharClass(nonLatinHashtagChars, 0xfdf0, 0xfdfb);
    addCharsToCharClass(nonLatinHashtagChars, 0xfe70, 0xfe74); // Arabic Pres. Forms B
    addCharsToCharClass(nonLatinHashtagChars, 0xfe76, 0xfefc);
    addCharsToCharClass(nonLatinHashtagChars, 0x200c, 0x200c); // Zero-Width Non-Joiner
    // Thai
    addCharsToCharClass(nonLatinHashtagChars, 0x0e01, 0x0e3a);
    addCharsToCharClass(nonLatinHashtagChars, 0x0e40, 0x0e4e);
    // Hangul (Korean)
    addCharsToCharClass(nonLatinHashtagChars, 0x1100, 0x11ff); // Hangul Jamo
    addCharsToCharClass(nonLatinHashtagChars, 0x3130, 0x3185); // Hangul Compatibility Jamo
    addCharsToCharClass(nonLatinHashtagChars, 0xA960, 0xA97F); // Hangul Jamo Extended-A
    addCharsToCharClass(nonLatinHashtagChars, 0xAC00, 0xD7AF); // Hangul Syllables
    addCharsToCharClass(nonLatinHashtagChars, 0xD7B0, 0xD7FF); // Hangul Jamo Extended-B
    addCharsToCharClass(nonLatinHashtagChars, 0xFFA1, 0xFFDC); // half-width Hangul
    // Japanese and Chinese
    addCharsToCharClass(nonLatinHashtagChars, 0x30A1, 0x30FA); // Katakana (full-width)
    addCharsToCharClass(nonLatinHashtagChars, 0x30FC, 0x30FE); // Katakana Chouon and iteration marks (full-width)
    addCharsToCharClass(nonLatinHashtagChars, 0xFF66, 0xFF9F); // Katakana (half-width)
    addCharsToCharClass(nonLatinHashtagChars, 0xFF70, 0xFF70); // Katakana Chouon (half-width)
    addCharsToCharClass(nonLatinHashtagChars, 0xFF10, 0xFF19); // \
    addCharsToCharClass(nonLatinHashtagChars, 0xFF21, 0xFF3A); //  - Latin (full-width)
    addCharsToCharClass(nonLatinHashtagChars, 0xFF41, 0xFF5A); // /
    addCharsToCharClass(nonLatinHashtagChars, 0x3041, 0x3096); // Hiragana
    addCharsToCharClass(nonLatinHashtagChars, 0x3099, 0x309E); // Hiragana voicing and iteration mark
    addCharsToCharClass(nonLatinHashtagChars, 0x3400, 0x4DBF); // Kanji (CJK Extension A)
    addCharsToCharClass(nonLatinHashtagChars, 0x4E00, 0x9FFF); // Kanji (Unified)
    addCharsToCharClass(nonLatinHashtagChars, 0x2A700, 0x2B73F); // Kanji (CJK Extension C)
    addCharsToCharClass(nonLatinHashtagChars, 0x2B740, 0x2B81F); // Kanji (CJK Extension D)
    addCharsToCharClass(nonLatinHashtagChars, 0x2F800, 0x2FA1F); // Kanji (CJK supplement)
    addCharsToCharClass(nonLatinHashtagChars, 0x3003, 0x3003); // Kanji iteration mark
    addCharsToCharClass(nonLatinHashtagChars, 0x3005, 0x3005); // Kanji iteration mark
    addCharsToCharClass(nonLatinHashtagChars, 0x303B, 0x303B); // Han iteration mark

    twic.text.expr_['nonLatinHashtagChars'] = twic.text._regexSupplant(nonLatinHashtagChars.join(""));

    // Latin accented characters (subtracted 0xD7 from the range, it's a confusable multiplication sign. Looks like "x")
    addCharsToCharClass(latinAccentChars, 0x00c0, 0x00d6);
    addCharsToCharClass(latinAccentChars, 0x00d8, 0x00f6);
    addCharsToCharClass(latinAccentChars, 0x00f8, 0x00ff);
    // Latin Extended A and B
    addCharsToCharClass(latinAccentChars, 0x0100, 0x024f);
    // assorted IPA Extensions
    addCharsToCharClass(latinAccentChars, 0x0253, 0x0254);
    addCharsToCharClass(latinAccentChars, 0x0256, 0x0257);
    addCharsToCharClass(latinAccentChars, 0x0259, 0x0259);
    addCharsToCharClass(latinAccentChars, 0x025b, 0x025b);
    addCharsToCharClass(latinAccentChars, 0x0263, 0x0263);
    addCharsToCharClass(latinAccentChars, 0x0268, 0x0268);
    addCharsToCharClass(latinAccentChars, 0x026f, 0x026f);
    addCharsToCharClass(latinAccentChars, 0x0272, 0x0272);
    addCharsToCharClass(latinAccentChars, 0x0289, 0x0289);
    addCharsToCharClass(latinAccentChars, 0x028b, 0x028b);
    // Okina for Hawaiian (it *is* a letter character)
    addCharsToCharClass(latinAccentChars, 0x02bb, 0x02bb);
    // Latin Extended Additional
    addCharsToCharClass(latinAccentChars, 0x1e00, 0x1eff);

    twic.text.expr_['latinAccentChars'] = twic.text._regexSupplant(latinAccentChars.join(""));

    twic.text.expr_['endScreenNameMatch'] = twic.text._regexSupplant(/^(?:#{atSigns}|[#{latinAccentChars}]|:\/\/)/);

    // A hashtag must contain characters, numbers and underscores, but not all numbers.
    twic.text.expr_['hashtagBoundary'] = twic.text._regexSupplant(/(?:^|$|#{spaces}|[「」。、.,!！?？:;"'])/);
    twic.text.expr_['hashtagAlpha'] = twic.text._regexSupplant(/[a-z_#{latinAccentChars}#{nonLatinHashtagChars}]/i);
    twic.text.expr_['hashtagAlphaNumeric'] = twic.text._regexSupplant(/[a-z0-9_#{latinAccentChars}#{nonLatinHashtagChars}]/i);
    twic.text.expr_['extractHash'] = twic.text._regexSupplant(/(#{hashtagBoundary})(#|＃)(#{hashtagAlphaNumeric}*#{hashtagAlpha}#{hashtagAlphaNumeric}*)/gi);

    // URL related hash regex collection
    twic.text.expr_['validPrecedingChars'] = twic.text._regexSupplant(/(?:[^-\/"'!=A-Za-z0-9_@＠\.]|^)/);

    twic.text.expr_['invalidDomainChars'] = twic.text._stringSupplant("#{punct}#{spaces_group}#{invalid_chars_group}", twic.text.expr_);
    twic.text.expr_['validDomainChars'] = twic.text._regexSupplant(/[^#{invalidDomainChars}]/);
    twic.text.expr_['validSubdomain'] = twic.text._regexSupplant(/(?:(?:#{validDomainChars}(?:[_-]|#{validDomainChars})*)?#{validDomainChars}\.)/);
    twic.text.expr_['validDomainName'] = twic.text._regexSupplant(/(?:(?:#{validDomainChars}(?:-|#{validDomainChars})*)?#{validDomainChars}\.)/);
    twic.text.expr_['validGTLD'] = twic.text._regexSupplant(/(?:(?:aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel)(?=[^a-zA-Z]|$))/);
    twic.text.expr_['validCCTLD'] = twic.text._regexSupplant(/(?:(?:ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)(?=[^a-zA-Z]|$))/);
    twic.text.expr_['validPunycode'] = twic.text._regexSupplant(/(?:xn--[0-9a-z]+)/);
    twic.text.expr_['validDomain'] = twic.text._regexSupplant(/(?:#{validSubdomain}*#{validDomainName}(?:#{validGTLD}|#{validCCTLD}|#{validPunycode}))/);
    twic.text.expr_['validPortNumber'] = twic.text._regexSupplant(/[0-9]+/);

    twic.text.expr_['validGeneralUrlPathChars'] = twic.text._regexSupplant(/[a-z0-9!\*';:=\+,\.\$\/%#\[\]\-_~|&#{latinAccentChars}]/i);
    // Allow URL paths to contain balanced parens
    //  1. Used in Wikipedia URLs like /Primer_(film)
    //  2. Used in IIS sessions like /S(dfd346)/
    twic.text.expr_['validUrlBalancedParens'] = twic.text._regexSupplant(/\(#{validGeneralUrlPathChars}+\)/i);
    // Valid end-of-path chracters (so /foo. does not gobble the period).
    // 1. Allow =&# for empty URL parameters and other URL-join artifacts
    twic.text.expr_['validUrlPathEndingChars'] = twic.text._regexSupplant(/[\+\-a-z0-9=_#\/#{latinAccentChars}]|(?:#{validUrlBalancedParens})/i);
    // Allow @ in a url, but only in the middle. Catch things like http://example.com/@user/
    twic.text.expr_['validUrlPath'] = twic.text._regexSupplant('(?:' +
    '(?:' +
        '#{validGeneralUrlPathChars}*' +
            '(?:#{validUrlBalancedParens}#{validGeneralUrlPathChars}*)*' +
            '#{validUrlPathEndingChars}'+
        ')|(?:@#{validGeneralUrlPathChars}+\/)'+
    ')', 'i');

    twic.text.expr_['validUrlQueryChars'] = /[a-z0-9!\*'\(\);:&=\+\$\/%#\[\]\-_\.,~|]/i;
    twic.text.expr_['validUrlQueryEndingChars'] = /[a-z0-9_&=#\/]/i;
    twic.text.expr_['extractUrl'] = twic.text._regexSupplant(
    '('                                                                + // $1 total match
        '(#{validPrecedingChars})'                                     + // $2 Preceeding chracter
        '('                                                            + // $3 URL
            '(https?:\\/\\/)?'                                         + // $4 Protocol (optional)
            '(#{validDomain})'                                         + // $5 Domain(s)
            '(?::(#{validPortNumber}))?'                               + // $6 Port number (optional)
            '(\\/#{validUrlPath}*)?'                                   + // $7 URL Path
            '(\\?#{validUrlQueryChars}*#{validUrlQueryEndingChars})?'  + // $8 Query String
        ')' +
    ')'
    , 'gi');

    twic.text._initialized = true;
};

twic.text.processUrls = function(text, callback) {
    twic.text._initialize();

    return text.replace(twic.text.expr_['extractUrl'], function(match, all, before, url, protocol, domain, path, query) {
        return before + callback(url);
    } );
};

twic.text.getUrlParts = function(link) {
    var
        result = false;

    twic.text._initialize();

    link.replace(twic.text.expr_['extractUrl'], function(match, all, before, url, protocol, domain, path, query) {
        result = {
            domain: domain,
            query: query
        };
    } );

    return result;
};

twic.text.extractUrls = function(text) {
    var
        urls = [];

    twic.text._initialize();

    text.replace(twic.text.expr_['extractUrl'], function(match, all, before, url, protocol, domain, path, query) {
        urls.push(url);
    } );

    return urls;
};

twic.text.processHashes = function(text, callback) {
    twic.text._initialize();

    return text.replace(twic.text.expr_['extractHash'], function(match, before, hash, hashText) {
        return before + callback(hashText);
    } );
};

twic.text.processMentions = function(text, callback) {
    twic.text._initialize();

    return text.replace(twic.text.expr_['extractMentions'], function(match, before, atSign, screenName, offset, chunk) {
        var
            after = chunk.slice(offset + match.length);

        if (!after.match(twic.text.expr_['endScreenNameMatch'])) {
            return before + callback(screenName);
        }
    } );
};
