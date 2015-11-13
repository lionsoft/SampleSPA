module App.Directives {

    class SamEditMaskDirective extends Directive {

        Declare(d: ng.IDirective) {
            d.restrict = 'A';
            d.require = 'ngModel';
        }

        private _format;
        private _arrFormat;

        Link($scope, el, attrs, model) {
            this._format = attrs["samEditMask"],
            this._arrFormat = this._format.split('|');

            if (this._arrFormat.length > 1) {
                this._arrFormat.sort((a, b) => (a.length - b.length));
            }

            model.$formatters.push((value) => {

/*
                var dt = moment(value);
                if (dt.isValid() && !isNaN(parseInt(value))) {
                    value = dt.format("HH:mm");
                }

*/
                return value === null ? '' : this.mask(String(value).replace(/\D/g, ''));
            });

            model.$parsers.push((value) => {
                model.$viewValue = this.mask(value);
                var modelValue = String(value).replace(/\D/g, '');
                el.val(model.$viewValue);
                return modelValue;
            });
        }

        private mask(val) {
            if (val === null) {
                return '';
            }
            var value = String(val).replace(/\D/g, '');
            var arrFormat = this._arrFormat;
            if (arrFormat.length > 1) {
                for (var a in arrFormat) {
                    if (arrFormat.hasOwnProperty(a)) {
                        if (value.replace(/\D/g, '').length <= arrFormat[a].replace(/\D/g, '').length) {
                            this._format = arrFormat[a];
                            break;
                        }
                    }
                }
            }
            var newValue = '';
            for (var nmI = 0, mI = 0; mI < this._format.length;) {
                if (this._format[mI].match(/\D/)) {
                    newValue += this._format[mI];
                } else {
                    if (value[nmI] != undefined) {
                        newValue += value[nmI];
                        nmI++;
                    } else {
                        break;
                    }
                }
                mI++;
            }
            return newValue;
        }
    }

    app.directive('samEditMask', SamEditMaskDirective.Factory());
}