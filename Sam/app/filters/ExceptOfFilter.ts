'use strict';
module App.Filters {

    /**
     * Usage:
     * 
     * <ui-select-choices repeat="item.Id as item in $.items | exceptOf: $.selectedItemIds : 'Id'>
     */
    class ExceptOfFilter extends Filter
    {
        Execute(items: any[], excludeArray: any[], propName?: string): any[] {
            var out;

            if (angular.isArray(items) && angular.isArray(excludeArray)) {
                out = items.where(item => propName ? !excludeArray.Contains(item[propName]) : !excludeArray.Contains(item)).toArray();
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
    }

    app.filter("exceptOf", ExceptOfFilter.Factory());
}