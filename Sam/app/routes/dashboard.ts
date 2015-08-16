'use strict';

module App {
    Routes.push(
        {
            name: 'dashboard',
            title: 'DDDD',
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
}