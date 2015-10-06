// ReSharper disable InconsistentNaming
module $l10n {

    export var $defaultLanguage = "en";

    export var $languages = {
        en: { name: "english", fallbackLangId1: ["fr"], angular: "en", momentjs: "en-us", select2: "en", browser: ['en-us', 'en-uk', 'en-gb', 'en_US', 'en_UK', 'en_GB'] },
        ru: { name: "русский", angular: "ru", momentjs: "ru", select2: "ru", browser: ['ru-ru', 'ru_RU'] },
    }
}
