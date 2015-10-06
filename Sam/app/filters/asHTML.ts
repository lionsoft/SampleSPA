'use strict';
module App.Filters {

    class AsHtmlFilter extends Filter
    {
        $sce: ng.ISCEService;

        Execute(value) {
            return this.$sce.trustAsHtml(value);
        }
    }

    app.filter("asHtml", AsHtmlFilter.Factory('$sce'));
}