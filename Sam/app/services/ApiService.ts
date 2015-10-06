'use strict';

// ReSharper disable InconsistentNaming
module App {

    export interface IAccountApi extends IResourceClass<IUser>  {
        Register(login: string, password: string): IPromise<IUser>;
        Login(login: string, password: string, rememberMe?: boolean): IPromise<IUser>;
        Logout(): IPromise<void>;
    }

    export interface IApiService {

        Account: IAccountApi;
    }                                                 

    export class ApiService extends ApiServiceBase implements IApiService {

        Account: IAccountApi = {
            Register: <any>{ method: "POST", route: "Register", params: { Login: null, Password: null } },
            Login: <any>{ method: "POST", route: "Login", params: { Login: null, Password: null, RememberMe: null } },
            Logout: <any>{ method: "POST", route: "Logout" },
        };

        Init() {
            super.Init(URL.API);
        }
    }

    app.service("ApiService", ApiService.Factory());
}
