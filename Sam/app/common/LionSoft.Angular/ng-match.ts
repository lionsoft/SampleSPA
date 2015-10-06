module LionSoftAngular {

    /**
     * Usege:
     * 
     * <input type='password' ng-match='$.confirmPass' name='pass' ng-model='$.pass' />
     * <input type='password' ng-model='$.confirmPass' />
     */
    class NgMatch extends Directive {

        restrict = 'A';
        require = '?ngModel';

        Link(scope: ng.IScope | any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes | any, controller: ng.INgModelController, transclude: ng.ITranscludeFunction) {
            // if ngModel is not defined, we don't need to do anything
            if (!controller) return;
            var val = attrs.ngMatch;
            if (!val) return;

            var validatePasswords = (ctrl, password1, password2) => {
                ctrl.$setValidity('match', (!password1 && !password2) || (password1 === password2));
            }


            var firstPassword = this.$parse(val);

            scope.$watch(val, newVal => validatePasswords(controller, element.val(), newVal));

            var validator = value => {
                validatePasswords(controller, element.val(), firstPassword(scope));
                return value;
            };

            controller.$parsers.unshift(validator);
            controller.$formatters.push(validator);
            attrs.$observe(this.name, () => validator(controller.$viewValue));
        }

    }

    LionSoftAngular.Module.directive("ngMatch", NgMatch.Factory());
}
 