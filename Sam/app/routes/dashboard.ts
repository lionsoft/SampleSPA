'use strict';

module App {
    app.config(() => {
    Routes.push(
        {
            name: 'dashboard',
            title: 'Dashboard',
            url: '/',
            templateUrl: '/app/views/dashboard/dashboard.html',
            settings: {
                nav: 1,
                content: '<i class="fa fa-dashboard"></i> Dashboard'
            },
            files: [
            ]
        }
    );
    });
   
}