'use strict';
module App {

    /**
     * Расширенная информация о роуте страницы
     */
    export interface IRouteSettings {
        /**
         * Номер по порядку отображения пункта меню 
         */
        nav?: number;
        /**
         * Html-разметка пункта меню
         */
        content?: string;
    }

    /**
     * Расширенная информация о роуте страницы
     */
    export interface IAppRoute extends ng.route.IRoute {
        /**
         * Адрес страницы (относительно адреса web-приложения)
         */
        url: string;

        /**
         * Path or function that returns a path to an html template that should be used by ngView.
         *
         * If templateUrl is a function, it will be called with the following parameters:
         *
         * Если имя контроллера явно не указано, то имя файла темплейта - это 
         * то чему будет равняться наименование контроллера и значение св-ва контроллера NgName. 
         */
        templateUrl?: string|{ ($routeParams?: angular.route.IRouteParamsService): string; }

        /**
         * Настройки отображения ссылки на страницу в боковом меню.
         */
        settings?: IRouteSettings;

        /**
         * Требует ли страница авторизации. 
         * При попытке перейти на такую страницу без авторизации - пользователь будет переброшен на страницу авторизации.
         */
        auth?: boolean;

        /**
         * Если параметр указан - это перечень ролей для которых доступен этот пункт.
         * Для других ролей или если нет авторизации пункт будет спрятан.
         */
        roles?: number[];

        /**
         * Признак того, что данная страница не будет отображаться в меню.
         */
        isInvisible?: boolean;

        /**
         * Идентификатор страницы. Может быть в виде parent1.parent2.controllerName.
         * Влияет на подсветку пунктов меню.
         */
        name?: string;

        /**
         * Заголовок страницы (то, что будет выведено в заголовке окна/закладки браузера)
         */
        title?: string;

        /**
         *  Список файлов и бандлов для автоматической загрузке при активизировании страницы.
         */
        files?: string[];
    }

    export var Routes: IAppRoute[] = [];
} 