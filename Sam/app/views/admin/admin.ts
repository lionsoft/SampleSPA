'use strict';

module App.Controllers {

    class Admin extends PageController {

        samUsers : Services.IUsersService;

        Init() {
        }

        Activated() {
        }
    }

    app.controller('admin', Admin.Factory("samUsers"));

} 