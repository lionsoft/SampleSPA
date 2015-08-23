'use strict';

declare module angular.translate {
    interface ITranslateService {
        (translationId: string, interpolateParams?: any, interpolationId?: string, defaultTranslationText?: string): IPromise<string>;
        (translationId: string[], interpolateParams?: any, interpolationId?: string, defaultTranslationText?: string[]): IPromise<{ [key: string]: string }>;
    }
}

module App {

    //#region Configure Translate provider

    app
        .config(['$translateProvider', ($translateProvider: angular.translate.ITranslateProvider) => {
            var availableLangKeys = ['en', 'ua', 'ru'];
            var langKeyAliases = <angular.translate.ILanguageKeyAlias>{
                'en-us': 'en',
                'en-uk': 'en',
                'en-gb': 'en',
                'en_US': 'en',
                'en_UK': 'en',
                'en_GB': 'en',

                'ru-ru': 'ru',
                'ru_RU': 'ru',

                'uk-ua': 'ua',
                'uk_UA': 'ua'
            };


            $translateProvider
                .registerAvailableLanguageKeys(availableLangKeys, langKeyAliases)
                .useSanitizeValueStrategy(null)
                .useStaticFilesLoader({ prefix: URL.APP_ROOT + "l10n/", suffix: ".json" })
                .determinePreferredLanguage()
            ;

                if (location.pathname.Trim('/'))
                    $l10n.$defaultLanguage = location.pathname.Trim('/');
                $l10n.$defaultLanguage = $l10n.$defaultLanguage || "ru";
                $l10n.$languages = $l10n.$languages || <any>{};
                var defLangName = $l10n.$defaultLanguage;

                var defLang = Enumerable.from($l10n.$languages).firstOrDefault(x => x.key === defLangName);

                if (defLang) {
                    var langId = defLang.key;
                    $translateProvider.preferredLanguage(langId);
                    $translateProvider.use(langId);
                    document.documentElement.lang = langId;

                    if (defLang.value.fallbackLangId)
                        $translateProvider.fallbackLanguage(defLang.value.fallbackLangId);

                    if (defLang.value.angular)
                        $.getScript("/Scripts/i18n/angular-locale_{0}.js".format(defLang.value.angular));
                    if (defLang.value.momentjs)
                        moment.locale(defLang.value.momentjs);
                    if (defLang.value.select2)
                        $.getScript("/Scripts/i18n/{0}.js".format(defLang.value.select2));
                }

        }])
    ;

    //#endregion


    //#region Configure Translate provider decorator

    class NvTranslate extends LionSoftAngular.NgObject {

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

    class NvTranslateFilter extends LionSoftAngular.Filter {

        $delegate;

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


    app
        .decorator("$translate", NvTranslate.Factory("$delegate", "$route"))
        .decorator("translateFilter", NvTranslateFilter.Factory("$delegate", "$route"));

    //#endregion
} 