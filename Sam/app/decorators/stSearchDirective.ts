'use strict';

module App.Decorators {

    // ReSharper disable once InconsistentNaming
    /**
     * Expand st-search directive functionality.
     * 
     * Usage:
     * 
     *   <div st-search='Name,Description' ... </div>
     * 
     * If list of the searchin fields is not defined - Name field will be used by default.
     * 
     * Formats:
      *     FieldName  - field has string type, use Contains function
     *     *FieldName  - field has string type, use StartsWith function
     *     FieldName*  - field has string type, use EndsWith function
     *     *FieldName* - field has string type, use Equal function
     * 
     *     FieldName:i - field has integer type, use Equal function
     * 
     */
    class StSearchDirectiveDecorator extends LionSoftAngular.DirectiveDecorator {

        Link(scope, element: ng.IAugmentedJQuery, attrs, controllers: any, transclude: ng.ITranscludeFunction) {
            attrs.stSearch = Utils.SmartTable.EncodeFieldNames(attrs.stSearch);
            super.Link(scope, element, attrs, controllers, transclude);
        }
    }

    app.decorator("stSearchDirective", StSearchDirectiveDecorator.Factory());
}   