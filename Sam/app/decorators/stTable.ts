'use strict';

module App.Decorators {

    /**
     * Expand st-table directive functionality.
     * 
     * 
     */
    class StTableDirectiveDecorator extends LionSoftAngular.DirectiveDecorator {

        Link(scope, element: ng.IAugmentedJQuery, attrs, controllers: any, transclude: ng.ITranscludeFunction) {
            super.Link(scope, element, attrs, controllers, transclude);
        }
    }

//    app.decorator("stTableDirective", StTableDirectiveDecorator.Factory());
}   