'use strict';

module App.Decorators {

    // ReSharper disable once InconsistentNaming
    /**
     *  Configure Translate provider decorator
     */
    class TranslateServiceDecorator extends LionSoftAngular.NgObject {

        $delegate: angular.translate.ITranslateService;

        $route: angular.route.IRouteService;

        protected getFactoryResult(): any {
            var res = (translationId, interpolateParams?, interpolationId?, defaultTranslationText?) => this.Execute(translationId, interpolateParams, interpolationId, defaultTranslationText);
            for (var idx in this.$delegate) {
                if (this.$delegate.hasOwnProperty(idx)) {
                    res[idx] = this.$delegate[idx];
                }
            }
            return res;
        }

        Execute(translationId: string, interpolateParams?: any, interpolationId?: string, defaultTranslationText?: string): ng.IPromise<string>;
        Execute(translationId: string[], interpolateParams?: any, interpolationId?: string, defaultTranslationText?: string[]): ng.IPromise<{ [key: string]: string }>;
        Execute(translationId, interpolateParams?, interpolationId?, defaultTranslationText?) {
            if (angular.isArray(translationId)) {
                var results = [];
                defaultTranslationText = defaultTranslationText || [];
                for (var i = 0; i < translationId.length; i++) {
                    results.push(this.Execute(translationId[i], interpolateParams, interpolationId, defaultTranslationText[i]));
                }
                return this.$q.all(results);
            } else if (angular.isString(translationId)) {
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
                defaultTranslationText = defaultTranslationText || defValue;
                if (currentView) {
                    return <any>this.$delegate(currentView + "." + translationId, interpolateParams, interpolationId)
                        .then(res => {
                            if (res === currentView + "." + translationId)
                                return this.$delegate(translationId, interpolateParams, interpolationId, defaultTranslationText);
                            else
                                return this.promiseFromResult(res);
                        })
                        .catch(() => {
                            return this.$delegate(translationId, interpolateParams, interpolationId, defaultTranslationText);
                        });
                } else {
                    return this.$delegate(translationId, interpolateParams, interpolationId, defaultTranslationText);
                }
            } else {
                return this.promiseFromResult("");
            }
        }
    }

    app.decorator("$translate", TranslateServiceDecorator.Factory("$delegate", "$route"));

} 