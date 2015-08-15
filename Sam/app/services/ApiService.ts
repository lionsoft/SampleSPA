module App {

    export interface IApiService {
        
    }

    export class ApiService extends ApiServiceBase implements IApiService {
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
