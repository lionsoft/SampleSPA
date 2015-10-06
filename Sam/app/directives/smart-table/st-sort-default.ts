'use strict';

module App.Directives {

    /**
     * Fixes an issue when st-sort-default attribute without any value was ignored.
     * 
     * Usage:
     * 
     *  <th st-sort-default st-sort='Name'>Accending default sorting by Name</th>
     *  <th st-sort-default='reverse' st-sort='Name'>Descending default sorting by Name</th>
     *  <th st-sort-default='desc' st-sort='Name'>Descending default sorting by Name</th>
     */
    class StSortDefault extends LionSoftAngular.Directive
    {
        restrict = 'A';
        scope = false;

        PreLink(scope, element, attrs) {
            if (attrs.stSortDefault === "")
                attrs.stSortDefault = "direct";
            else if (attrs.stSortDefault === "desc")
                attrs.stSortDefault = "reverse";
        }
    }

    app.directive("stSortDefault", StSortDefault.Factory());
}