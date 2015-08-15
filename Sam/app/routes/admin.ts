'use strict';

module App {
    Routes.push(
        {
            name: 'admin',
            title: 'АДМИН',
            url: '/admin',
            auth: true,
            templateUrl: '/app/views/admin/admin.html', // this is default value
            settings: {
                nav: 2,
                content: '<i class="fa fa-lock"></i> Admin'
            },
            files: [
            ]
        }
    );
}