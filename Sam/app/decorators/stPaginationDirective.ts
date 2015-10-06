'use strict';

module App.Decorators {

    // ReSharper disable once InconsistentNaming
    /**
     * Add stGetPageSizes to the directive scope for custom paginator.
     */
    class StPaginationDirectiveDecorator extends LionSoftAngular.DirectiveDecorator {

        Link(scope, element: ng.IAugmentedJQuery, attrs, controllers: any, transclude: ng.ITranscludeFunction) {
            super.Link(scope, element, attrs, controllers, transclude);
            scope.stShowPageSizes = true;
            if (attrs.stShowPageSizes)
                scope.$watch(attrs.stShowPageSizes, val => scope.stShowPageSizes = val);
            scope.stGetPageSizes = current => [current, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].distinct().orderBy(x => x).toArray();
        }
    }

    app.decorator("stPaginationDirective", StPaginationDirectiveDecorator.Factory());
}   