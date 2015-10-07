'use strict';

module App.Controllers {

    class Admin extends PageController {

        samUsers : Services.IUsersService;

        Init() {
        }

        Activated() {
        }


        prepareQuery(odata: Services.OData) {
            odata.ne("UserName", "1");
        }

        prepareEdit(user: IUser) {
            user.UserRole = UserRole.User;
        }
    }

    app.controller('admin', Admin.Factory("samUsers"));

} 