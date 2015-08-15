module LionSoftAngular {

    /**
     * Инвертирует в обе стороны значения биндящиеся при использовании привязки ng-model.
     * Пример:
     *     <ng-switch ng-inverted ng-model="$.switch1"></ng-switch>
     */
    class NgInverted extends Directive
    {
        require = 'ngModel';

        Link(scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, controller: ng.INgModelController, transclude: ng.ITranscludeFunction) {
            controller.$parsers.push(val => !val);
            controller.$formatters.push(val => !val);
        }
    }

    LionSoftAngular.Module.directive("ngInverted", NgInverted.Factory());
}