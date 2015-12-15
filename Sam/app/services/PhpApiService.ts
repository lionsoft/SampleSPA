'use strict';

// ReSharper disable InconsistentNaming
module App {

    export interface IProductApi extends IResourceClass<any>  {
    }

    export interface IPhpApiService {

        Products: IProductApi;
    }                                                 

    export class PhpApiService extends ApiServiceBase implements IPhpApiService {

        Products: IProductApi = {};

        Init() {
            super.Init("http://localhost:5555/odata-example/odata.svc");
        }
    }

    app.service("phpApiService", PhpApiService.Factory());
}
