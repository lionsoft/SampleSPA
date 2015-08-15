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