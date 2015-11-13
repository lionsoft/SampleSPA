'use strict';
module App.Filters {

    /**                                           
     * AngularJS default filter with the following expression:
     * "person in people | filter: {name: $select.search, age: $select.search}"
     * performs a AND between 'name: $select.search' and 'age: $select.search'.
     * We want to perform a OR.
     * In addition you can pass the second parameter as 'true' if you want to filter by starts with condition.
     */
    class FilterOr extends Filter {
        Execute(items: any[], props: any, startsWith?: boolean): any[] {
            var out = [];
            if (angular.isArray(items)) {
                out = items.where(item => {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        var idx = item[prop].toString().toLowerCase().indexOf(text);
                        if (idx !== -1 && (!startsWith || idx === 0)) {
                            itemMatches = true;
                            break;
                        }
                    }
                    return itemMatches;
                }).toArray();
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
    }

    app.filter("filterOr", FilterOr.Factory());
}