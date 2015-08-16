'use strict';

// ReSharper disable InconsistentNaming
module App {

    export interface IApiService {

        Account: IAccountApi;
    }

    export interface IPromise<T> extends ng.IPromise<T> {
        /**
         * Помечает результат запроса к сервису, что необходимо выполнять обработку ошибки по умолчанию.
         */
        HandleError(): ng.IPromise<T>;
        /**
         * Помечает результат запроса к сервису, что необходимо в случае ошибки пытаться 
         * извлечь текст ошибки из ответа. В этом случе параметр reason в методе catch будет строкой - текстом ошибки.
         */
        ExtractError(): ng.IPromise<T>;
    }

    export interface IAccountApi {
        Register(login: string, password: string): IPromise<IUser>;
        Login(login: string, password: string, rememberMe?: boolean): IPromise<IUser>;
        Logout(): IPromise<void>;
    }

    export class ApiService extends ApiServiceBase implements IApiService {

        Account: IAccountApi = {
            Register: <any>{ method: "POST", route: "Register", params: { Login: null, Password: null } },
            Login: <any>{ method: "POST", route: "Login", params: { Login: null, Password: null, RememberMe: null } },
            Logout: <any>{ method: "POST", route: "Logout" }
        };
/*
        Users: IUsersApi = {
            HashPassword: <any>{ method: "POST", route: "HashPassword", cache: true },
            ComparePasswords: <any>{ method: "POST", route: "ComparePasswords", cache: true }
        };
        Trackers: ITrackersApi = {};
        Icons: IResourceClass<IIcon> = {};

        Callers: IResourceClass<ICaller> = {};
        Categories: IResourceClass<ICategory> = {};
        Cards: ICardsApi = {};
        Orders: IOrdersApi = {};
        CustomPoi: ICustomPoiApi = {};
        ActionGuides: IResourceClass<IActionGuide> = {};
        Localization: ILocalizationApi = {
            GetLocalization: <any>{ method: "GET", route: "GetLocalization/:langId"}
        };
*/

        Init() {
            super.Init(URL.API);
        }
    }

    app.service("ApiService", ApiService.Factory());
}
