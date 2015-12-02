(function() {
    'use strict';

    if (typeof String.prototype.ExtractDirectory != 'function') {
        String.prototype.ExtractDirectory = function (separator) {
            separator = separator || '/';
            var path = this.split(separator);
            path.length--;
            path = path.join(separator);
            return path;
        };
    }

    if (typeof String.prototype.ExtractFileName != 'function') {
        String.prototype.ExtractFileName = function (separator) {
            separator = separator || '/';
            var path = this.split(separator);
            path = path[path.length - 1];
            return path;
        };
    }

    /**
        Extracts file name without extension from path.
         for 'fileName.ext' -> returns 'fileName'
         for 'fileName.' -> returns 'fileName'
         for 'fileName.name1.name2.ext' -> returns 'fileName.name1.name2'
    */
    if (typeof String.prototype.ExtractOnlyFileName != 'function') {
        String.prototype.ExtractOnlyFileName = function (separator) {
            var res = this.ExtractFileName(separator);
            var path = res.split('.');
            if (path.length > 1) {
                path.length--;
                res = path.join('.');
            }
            return res;
        };
    }

    /**
        Extracts file extension from path.
         for 'fileName.ext' -> returns 'ext'
         for 'fileName.' -> returns ''
         for 'fileName' -> returns undefined
    */
    if (typeof String.prototype.ExtractFileExt != 'function') {
        String.prototype.ExtractFileExt = function (separator) {
            var res = this.ExtractFileName(separator);
            var path = res.split('.');
            if (path.length > 1) {
                res = path[path.length - 1];
            } else {
                res = undefined;
            }
            return res;
        };
    }

    /**
        Changes file extension from path.
         for 'fileName.ext' { '' -> returns 'fileName'
         for 'fileName.ext' { '.newExt' or 'newExt' -> returns 'fileName.newExt'
         for 'fileName.' { '.newExt' or 'newExt' -> returns 'fileName.newExt'
         for 'fileName' { '.newExt' or 'newExt' -> returns 'fileName.newExt'
    */
    if (typeof String.prototype.ChangeFileExt != 'function') {
        String.prototype.ChangeFileExt = function (newExt, separator) {
            newExt = newExt || "";
            if (newExt !== "" && newExt[0] !== '.')
                newExt = '.' + newExt;
            var oldExt = this.ExtractFileExt(separator);
            if (oldExt === undefined)
                oldExt = '';
            else
                oldExt = '.' + oldExt;
            var res = this.substr(0, this.length - oldExt.length) + newExt;
            return res;
        };
    }



    if (typeof String.prototype.ExpandPath != 'function') {
        String.prototype.ExpandPath = function (basePath, separator) {
            if (this.StartsWith(/https?:\/\//i)) {
                return this;
            }
            separator = separator || '/';
            var path = this;
            if (!basePath) {
                if (path.StartsWith(separator)) {
                    //basePath = window.location.appFolder;
                    basePath = window.location.origin;
                } else {
                    basePath = window.location.href;
                    // Do the assumption if href is not ends with separator and the last part of the path contains an extension - 
                    // it's href to file name and we have to extract its folder.
                    if (!basePath.EndsWith('/') && basePath.ExtractFileName().Contains('.'))
                        basePath = basePath.ExtractDirectory();
                }
            }
            if (path.StartsWith(separator)) {
                path = path.substr(1, path.length - 1);
                basePath = window.location.origin;
            }

            if (!basePath.EndsWith(separator))
                basePath = basePath + separator;
            return basePath + path;
        };
    }
}());