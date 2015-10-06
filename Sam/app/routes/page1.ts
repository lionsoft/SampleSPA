'use strict';

module App {
    app.config(() => {
    Routes.push(
        {
            name: 'page1',
            title: 'Page1',
            url: '/page1',
            auth: true,
            roles: [UserRole.User, UserRole.Admin],
            templateUrl: '/app/views/Page1/page1.html',
            settings: {
                topMenu: 'MENU.10.USER',
                nav: 1,
                content: 'MENU.PAGE1 | Page1'
            },
            files: [
            ]
        }
    );
    });
   
}