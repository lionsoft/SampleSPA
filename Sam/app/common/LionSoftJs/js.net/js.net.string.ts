interface RegExpConstructor {
    escape(text: string): string;
    rebuild(regexp: RegExp, options: any): RegExp;
}

(function () {
    'use strict';
    // ReSharper disable NativeTypePrototypeExtending

    //////////////////////////// private section /////////////////////////////////
    RegExp.escape = function(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    RegExp.rebuild = function(regexp, options) {
        var source = regexp.source || '';
        options = options || {};
        var flags = "";
        if (options.startsWith && !source.StartsWith("^")) source = "^" + source;
        if (options.endsWith && !source.EndsWith("$")) source = source + "$";

        if (options.ignoreCase === undefined && regexp.ignoreCase || options.ignoreCase !== undefined && options.ignoreCase) flags = "i";
        if (options.global === undefined && regexp.global || options.global !== undefined && options.global) flags = "g";
        if (options.multiline === undefined && regexp.multiline || options.multiline !== undefined && options.multiline) flags = "m";
        return new RegExp(source, flags);
    };

    function trim(s: string, charlist?: string) {
        return trimRight(trimLeft(s, charlist), charlist);
    }

    function trimLeft(s, charlist) {
        if (charlist === undefined)
            charlist = ' ';
        // converts array object to string
        if (charlist instanceof Array)
            charlist = charlist.join('');
        return s.replace(new RegExp("^[" + RegExp.escape(charlist) + "]+"), "");
    }

    function trimRight(s, charlist) {
        if (charlist === undefined)
            charlist = ' ';
        // converts array object to string
        if (charlist instanceof Array)
            charlist = charlist.join('');
        return s.replace(new RegExp("[" + RegExp.escape(charlist) + "]+$"), "");
    }
    ///////////////////////////////////////////////////////////////////////////////////

    if (typeof String.prototype.IsEqual != 'function') {
        String.prototype.IsEqual = function (strOrRegexp, caseInsensitive) {
            if (strOrRegexp instanceof Object) {
                var regexp = RegExp.rebuild(strOrRegexp, { startsWith: true, endsWith: true, ignoreCase: caseInsensitive });
                return this.search(regexp) >= 0;
            } else {
                if (caseInsensitive) {
                    return this.toLocaleLowerCase() === strOrRegexp.toLocaleLowerCase();
                } else {
                    return this === strOrRegexp;
                }
            }
        };
    }

    if (typeof String.prototype.StartsWith != 'function') {
        String.prototype.StartsWith = function (strOrRegexp, caseInsensitive) {
            if (strOrRegexp instanceof Object) {
                var regexp = RegExp.rebuild(strOrRegexp, { startsWith: true, ignoreCase: caseInsensitive });
                return this.search(regexp) >= 0;
            } else {
                if (strOrRegexp === "") return true;
                return this.slice(0, strOrRegexp.length).IsEqual(strOrRegexp, caseInsensitive);
            }
        };
    }

    if (typeof String.prototype.EndsWith != 'function') {
        String.prototype.EndsWith = function (strOrRegexp, caseInsensitive) {
            if (strOrRegexp instanceof Object) {
                var regexp = RegExp.rebuild(strOrRegexp, { endsWith: true, ignoreCase: caseInsensitive });
                return this.search(regexp) >= 0;
            } else {
                if (strOrRegexp === "") return true;
                return (this.slice(0, -strOrRegexp.length) + strOrRegexp).IsEqual(this, caseInsensitive);
            }
        };
    }

    if (typeof String.prototype.Contains != 'function') {
        String.prototype.Contains = function (strOrRegexp, caseInsensitive) {
            if (strOrRegexp instanceof Object) {
                var regexp = RegExp.rebuild(strOrRegexp, { ignoreCase: caseInsensitive });
                return this.search(regexp) >= 0;
            } else {
                if (caseInsensitive)
                    return this.toLowerCase().indexOf(strOrRegexp.toLowerCase()) >= 0;
                else
                    return this.indexOf(strOrRegexp) >= 0;
            }
        };
    }

    if (typeof String.prototype.Trim != 'function') {
        String.prototype.Trim = function (chars) {
            return trim(this, chars);
        };
    }

    if (typeof String.prototype.TrimStart != 'function') {
        String.prototype.TrimStart = function (chars) {
            return trimLeft(this, chars);
        };
    }
    if (typeof String.prototype.TrimLeft != 'function') {
        String.prototype.TrimLeft = function (chars) {
            return trimLeft(this, chars);
        };
    }

    if (typeof String.prototype.TrimEnd != 'function') {
        String.prototype.TrimEnd = function (chars) {
            return trimRight(this, chars);
        };
    }
    if (typeof String.prototype.TrimRight != 'function') {
        String.prototype.TrimRight = function (chars) {
            return trimRight(this, chars);
        };
    }

    if (typeof String.prototype.RegexIndexOf != 'function') {
        String.prototype.RegexIndexOf = function (regex, startPos) {
            var indexOf = this.substring(startPos || 0).search(regex);
            return (indexOf >= 0) ? (indexOf + (startPos || 0)) : indexOf;
        };
    }

    if (typeof String.prototype.RegexLastIndexOf != 'function') {
        String.prototype.RegexLastIndexOf = function(regex, startPos)
        {
            regex = (regex.global) ? regex : new RegExp(regex.source || regex, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
            if (typeof (startPos) == "undefined") {
                startPos = this.length;
            } else if (startPos < 0) {
                startPos = 0;
            }
            var stringToWorkWith = this.substring(0, startPos + 1);
            var lastIndexOf = -1;
            var nextStop = 0;
            var result;
            while ((result = regex.exec(stringToWorkWith)) != null) {
                lastIndexOf = result.index;
                regex.lastIndex = ++nextStop;
            }
            return lastIndexOf;
        };
    }

    if (typeof String.prototype.IndexOf != 'function') {
        String.prototype.IndexOf = function (regexOrString, startPos, count) {
            if (count <= 0) return -1;
            if (startPos == undefined)
                startPos = 0;
            else
                startPos = Math.min(Math.max(startPos, 0), this.length - 1);

            var testString = this;

            if (count != undefined)
                testString = this.slice(0, startPos + count);

            if (typeof regexOrString == "string")
                return testString.indexOf(regexOrString, startPos);
            else
                return testString.RegexIndexOf(regexOrString, startPos);
        };
    }

    if (typeof String.prototype.LastIndexOf != 'function') {
        String.prototype.LastIndexOf = function (regexOrString, startPos, count) {
            if (count <= 0) return -1;

            if (startPos == undefined)
                startPos = this.length - 1;
            else
                startPos = Math.min(Math.max(startPos, 0), this.length - 1);

            var testString = this;

            if (count != undefined) {
                testString = this.slice(startPos - count + 1, this.length);
                startPos = count - 1;
            }
                

            if (typeof regexOrString == "string")
                return testString.lastIndexOf(regexOrString, startPos);
            else
                return testString.RegexLastIndexOf(regexOrString, startPos);
        };
    }

    if (typeof String.prototype.FromJson != 'function') {
        String.prototype.FromJson = function (defValue) {
            try {
                var jsonString = trim(this);
                if (jsonString === "") return defValue;
                if (jsonString[0] !== "{" && jsonString[jsonString.length - 1] !== "}"
                    && jsonString[0] !== "[" && jsonString[jsonString.length - 1] !== "]") {
                    jsonString = "{" + jsonString + "}";
                }
                return eval(`(${jsonString})`);

            } catch (e) {
                return defValue;
            }
        };
    }

    if (typeof String.prototype.HtmlEncode != 'function') {
        String.prototype.HtmlEncode = function () {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(this).html();
        };
    }

    if (typeof String.prototype.HtmlDecode != 'function') {
        String.prototype.HtmlDecode = function () {
            return $('<div/>').html(this).text();
        };
    }

}());