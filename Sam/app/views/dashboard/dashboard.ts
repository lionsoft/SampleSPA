'use strict';
module App.Controllers
{
    export interface INews
    {
        title: string;
        description: string;
    }

    export class Dashboard extends Controller
    {
//#region Variables
        datacontext: Services.IDatacontext;
        messageCount: number;
        news: INews;
        people: Array<any> = [];
//#endregion

        Init() {
            //this.title = "Dashboard";
            this.datacontext = this.get("datacontext");
            this.news = this.getNews();
            // Queue all promises and wait for them to finish before loading the view
            this.activate(this.getMessageCount(), this.getPeople());

            app.api.Account.Test().HandleError().then(s => alert(s));
        }

        Activated() {
            this.log('Activated Dashboard View');
        }

//#region Public Methods
        getNews(): INews
        {
            return {
                title: "Hot Towel Typescript",
                description: 'Hot Towel Typescript is a SPA template using Angular, Breeze and Typescript. '
                    + 'This is a conversion of John Papas HotTowel.Angular.Breeze package'
            };
        }

        getMessageCount()
        {
            return this.datacontext.getMessageCount().then(data =>
            {
                return this.messageCount = data;
            });
        }

        getPeople()
        {
            return this.datacontext.getPeople().then(data =>
            {
                return this.people = data;
            });
        }
//#endregion
    }

    // register controller with angular
    app.controller('dashboard', Dashboard.Factory());
}