'use strict';
module App.Filters {

    class UserRoleFilter extends EnumFilter
    {
        Source =
        [
            { Key: UserRole.User, Value: 'User' },
            { Key: UserRole.Admin, Value: 'Admin' },
        ];
    }

    app.filter("UserRole", UserRoleFilter.Factory());
}