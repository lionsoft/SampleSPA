'use strict';

module App.Services {

    export interface IProductsService extends ICRUDService<any> {
    }

    class ProductsService extends CRUDService<any> implements IProductsService {

        phpApiService: IPhpApiService;

        TypeDescription = "Product";
        
        get ApiService() { return this.phpApiService.Products; }

        protected prepareQuery(odata: OData, isSmartLoad?: boolean): void {
            // remove default behavior    
        }
    }

    app.service("samProducts", ProductsService.Factory("phpApiService"));
} 