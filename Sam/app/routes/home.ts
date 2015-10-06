'use strict';

module App {
    app.config(() => {
    Routes.push(
        {
            name: 'home',
            title: 'HomePage',
            url: '/',
            auth: false,
            templateUrl: '/app/views/home/home.html',
            files: [
            ]
        }
    );
    });
   
}