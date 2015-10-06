'use strict';

module App.Decorators {

    // ReSharper disable once InconsistentNaming
    /**
     *  Store controller name to its $scope
     */
    class ControllerServiceDecorator extends LionSoftAngular.ServiceDecorator {

        Decorate($delegate) {
            return (expression, locals, later, ident) => {
                if (typeof expression == "string") {
                    var arr = expression.split(" as ", 2);
                    if (arr.length == 1) {
                        locals.$scope.$controllerName = expression.trim();
                        locals.$scope.$controllerAs = "";
                    }
                    else {
                        locals.$scope.$controllerName = arr[0].trim();
                        locals.$scope.$controllerAs = arr[1].trim();
                    }
                }
                return $delegate(expression, locals, later, ident);
            }
        }
    }

    app.decorator("$controller", ControllerServiceDecorator.Factory());

} 
