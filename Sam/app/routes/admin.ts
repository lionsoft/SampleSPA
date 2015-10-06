'use strict';

module App {
    app.config(() => {
    Routes.push(
        {
            name: 'admin',
            title: 'Admin',
            url: '/admin',
            auth: true,
            roles: [UserRole.Admin],
            templateUrl: '/app/views/Admin/admin.html',
            settings: {
                topMenu: 'MENU.20.ADMIN',
                nav: 1,
                content: 'MENU.ADMIN | Admin'
            },
            files: [
            ]
        }
    );
    });
   
}