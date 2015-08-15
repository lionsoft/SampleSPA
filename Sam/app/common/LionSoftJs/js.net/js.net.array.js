(function() {
    'use strict';

    if (typeof Array.prototype.clone != 'function') {
        Array.prototype.clone = function() {
            return this.slice(0);
        };
    }

    /** 
        Syntax:
            array.Add(index, value1, value2, [subValue1, subValue2, ..., subValueN], ..., valueN) 
    */
    if (typeof Array.prototype.Add != 'function') {
        Array.prototype.Add = function () {
            var index = this.length;
            arguments.length > 0
                && this.splice.apply(this, [index, 0].concat([].shift.call(arguments)))
                && this.Add.apply(this, arguments);
            return this;
        };
    }
    if (typeof Array.prototype.AddRange != 'function') {
        Array.prototype.AddRange = function () {
            this.Add.apply(this, arguments);
            return this;
        };
    }

    /** 
        Syntax:
            array.Insert(index, value1, value2, [subValue1, subValue2, ..., subValueN], ..., valueN) 
    */
    if (typeof Array.prototype.Insert != 'function') {
        Array.prototype.Insert = function (index) {
            index = Math.min(index, this.length);
            arguments[0] = index;
            arguments.length > 1
                && this.splice.apply(this, [index, 0].concat([].pop.call(arguments)))
                && this.Insert.apply(this, arguments);
            return this;
        };
    }
    if (typeof Array.prototype.InsertRange != 'function') {
        Array.prototype.InsertRange = function () {
            this.Insert.apply(this, arguments);
            return this;
        };
    }
    if (typeof Array.prototype.Contains != 'function') {
        Array.prototype.Contains = function (element) {
            return this.indexOf(element) >= 0;
        };
    }
    if (typeof Array.prototype.Clear != 'function') {
        Array.prototype.Clear = function () {
            this.splice(0, this.length);
            return this;
        };
    }
    if (typeof Array.prototype.RemoveAt != 'function') {
        Array.prototype.RemoveAt = function (index, count) {
            if (index >= 0) {
                if (count == undefined) count = 1;
                this.splice(index, count);
            }
            return this;
        };
    }
    if (typeof Array.prototype.RemoveRange != 'function') {
        Array.prototype.RemoveRange = function (index, count) {
            return this.RemoveAt(index, count);
        };
    }
    if (typeof Array.prototype.Remove != 'function') {
        Array.prototype.Remove = function () {
            for (var index in arguments) {
                var element = arguments[index];
                var idx = this.indexOf(element);
                this.RemoveAt(idx);
            }
            return this;
        };
    }
    if (typeof Array.prototype.GetRange != 'function') {
        Array.prototype.GetRange = function (index, count) {
            if (index == undefined)
                index = 0;
            else
                index = Math.min(Math.max(index, 0), this.length - 1);

            if (count == undefined)
                count = this.length - index;
            else
                count = Math.min(count, this.length - index);

            if (index < 0 || count <= 0) return [];

            return this.slice(index, index + count);
        };
    }

    function _indexOf(testArray, element, index, count, fromTheEnd) {
        if (index == undefined)
            index = fromTheEnd ? testArray.length - 1 : 0;
        else
            index = Math.min(Math.max(index, 0), testArray.length - 1);

        if (count != undefined)
            testArray = testArray.GetRange(0, fromTheEnd ? index - count + 1 : index + count);

        return fromTheEnd 
              ? testArray.lastIndexOf(element, index)
              : testArray.indexOf(element, index);
    }

    if (typeof Array.prototype.IndexOf != 'function') {
        Array.prototype.IndexOf = function (element, index, count) {
            if (index == undefined)
                index = 0;
            else
                index = Math.min(Math.max(index, 0), this.length - 1);

            var testArray = this;

            if (count != undefined)
                testArray = this.GetRange(0, index + count);

            return testArray.indexOf(element, index);
        };
    }

    if (typeof Array.prototype.LastIndexOf != 'function') {
        Array.prototype.LastIndexOf = function (element, index, count) {
            if (index == undefined)
                index = this.length - 1;
            else
                index = Math.min(Math.max(index, 0), this.length - 1);

            var testArray = this;

            if (count != undefined) {
                testArray = this.GetRange(index - count + 1, this.length);
                index = count - 1;
            }
                

            return testArray.lastIndexOf(element, index);
        };
    }

}());

