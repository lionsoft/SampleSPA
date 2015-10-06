'use strict';

module App {
    app.config(() => {
    Routes.push(
        {
            name: 'page2',
            title: 'Page2',
            url: '/page2',
            auth: true,
            roles: [UserRole.User, UserRole.Admin],
            templateUrl: '/app/views/Page2/page2.html',
            settings: {
                topMenu: 'MENU.10.USER',
                nav: 2,
                content: 'MENU.PAGE2 | Page2'
            },
            files: [
            ]
        }
    );
    });
   
}