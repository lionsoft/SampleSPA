// ReSharper disable once InconsistentNaming
"use strict";
module App.URL {
    /**
    * Базовый адрес внутреннего WebAPI приложения
    */
    export const API = "/api";

    /**
     * Базовый адрес приложения
     */
    export const APP_ROOT = '/app';

    /**
     * Базовый адрес размещения всех директив
     */
    export const DIRECTIVES_ROOT = 'directives/'.ExpandPath(APP_ROOT);

    /**
     * Base URL for directory "dist" where building up production-ready files
     */
    export const DIST_ROOT = '/dist';
};

 