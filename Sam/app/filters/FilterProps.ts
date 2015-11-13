'use strict';
module App.Filters {

    /**
     * Makes filtering by contains or starts with one or some defined properties.
     * If properties are not defined - makes filtering by properties 'Name' or 'name'. 
     * By default filtering is by contains.
     * 
     * USAGE:
     * "person in people | filterProps: $select.search"
     * "person in people | filterProps: $select.search : 'name'"
     * "person in people | filterProps: $select.search : 'name,description'"
     * "person in people | filterProps: $select.search : ['name','description']"
     * "person in people | filterProps: $select.search : 'name' : true"
     */
    class FilterProps extends Filter {
        Execute(items: any[], value: string, props?: string | string[], startsWith?: boolean): any[] {
            if (value === undefined || value === "" || !angular.isArray(items))
                return items;
            props = props || ["Name","name"];
            if (angular.isString(props))
                props = (<string>props).split(',');
            var query = {};
// ReSharper disable once QualifiedExpressionMaybeNull
            for (var i = 0; i < props.length; i++) {
                var propName = (props[0] || "").trim();
                if (propName)
                    query[propName] = value;
            }
            return this.$filter("filterOr")(items, query, startsWith);
        }
    }

    app.filter("filterProps", FilterProps.Factory());
}