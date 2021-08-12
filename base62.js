/*

Copyright (c) 2016 Andrew Nesbitt

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (Base62) { "use strict";

    var DEFAULT_CHARACTER_SET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    Base62.encode = function(integer){
        if (integer === 0) {return '0';}
        var s = '';
        while (integer > 0) {
            s = Base62.characterSet[integer % 62] + s;
            integer = Math.floor(integer/62);
        }
        return s;
    };

    var defaultCharsetDecode = function defaultCharsetDecode (base62String) {
        var value = 0,
            i = 0,
            length = base62String.length,
            charValue;

        for (; i < length; i++) {
            charValue = base62String.charCodeAt(i);

            if (charValue < 58) {
                charValue = charValue - 48;
            } else if (charValue < 91) {
                charValue = charValue - 29;
            } else {
                charValue = charValue - 87;
            }

            value += charValue * Math.pow(62, length - i - 1);
        }

        return value;
    };

    var customCharsetDecode = function customCharsetDecode (base62String) {
        var val = 0,
            i = 0,
            length = base62String.length,
            characterSet = Base62.characterSet;

        for (; i < length; i++) {
            val += characterSet.indexOf(base62String[i]) * Math.pow(62, length - i - 1);
        }

        return val;
    };

    var decodeImplementation = null;

    Base62.decode = function(base62String){
        return decodeImplementation(base62String);
    };

    Base62.setCharacterSet = function(chars) {
        var arrayOfChars = chars.split(""), uniqueCharacters = [];

        if(arrayOfChars.length !== 62) throw Error("You must supply 62 characters");

        arrayOfChars.forEach(function(char){
            if(!~uniqueCharacters.indexOf(char)) uniqueCharacters.push(char);
        });

        if(uniqueCharacters.length !== 62) throw Error("You must use unique characters.");

        Base62.characterSet = arrayOfChars;

        decodeImplementation = chars === DEFAULT_CHARACTER_SET ? defaultCharsetDecode : customCharsetDecode;
    };

    Base62.setCharacterSet(DEFAULT_CHARACTER_SET);

    // export as AMD module / Node module / browser or worker variable
    if (typeof define === 'function' && define.amd) define(function() { return Base62; });
    else if (typeof module !== 'undefined') {
        module.exports = Base62;
        module.exports.default = Base62;
    } else if (typeof self !== 'undefined') self.Base62 = Base62;
    else window.Base62 = Base62;

}({}));