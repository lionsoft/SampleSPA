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
                //.useStaticFilesLoader({ prefix: URL.API + "/l10n/", suffix: ".json" })
                .useStaticFilesLoader({ prefix: URL.APP_ROOT + "/l10n/", suffix: ".json" })
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
                        $.getScript(`${URL.DIST_ROOT}/i18n/angular-locale_${defLang.value.angular}.js`);
                    if (defLang.value.momentjs)
                        moment.locale(defLang.value.momentjs);
                }

        }])
    ;

    //#endregion
} 