'use strict';

module App.Decorators {

    // ReSharper disable once InconsistentNaming
    /**
     *  Configure Translate filter decorator
     */
    class TranslateFilterDecorator extends LionSoftAngular.Filter {

        $delegate: angular.translate.ITranslateService;

        $route: angular.route.IRouteService;

        Execute(translationId: string, params?: any): string {
            var defValue = translationId;
            var currentView = "";
            if (translationId) {
                if (this.$route.current) currentView = this.$route.current.name;
                var arr = translationId.split('|', 2);
                if (arr.length === 2) {
                    translationId = arr[0].trim();
                    defValue = (arr[1] || "").trim();
                }
            }
            var res;
            if (currentView) {
                res = this.$delegate(currentView + "." + translationId, params);
                if (res !== currentView + "." + translationId)
                    return res;
            }
            res = this.$delegate(translationId, params);
            if (res === translationId)
                res = defValue;
            return res;
        }
    }

    app.decorator("translateFilter", TranslateFilterDecorator.Factory("$delegate", "$route"));

} 