using System;
using Microsoft.AspNet.Identity.EntityFramework;
using Sam.DbContext.Hooks;
using Sam.Extensions;

#pragma warning disable 4014

namespace Sam.DbContext
{
    partial class ApplicationDbContext
    {
        /// <summary>
        /// Database actual version.
        /// If <see cref="ActualDbVersion"/> great than <see cref="CurrentDbVersion"/> the method <see cref="UpgradeDatabase"/> will be executed.
        /// </summary>
        public const int ActualDbVersion = 1;

        private static ApplicationUserManager _userManager;

        protected void UpgradeDatabase(int fromVersion, int toVersion)
        {
            _userManager = _userManager ?? new ApplicationUserManager(new UserStore<User>());

            // Creating database from scratch
            if (fromVersion == 0)
            {
//                SequentialIdProvider.Create(Card.NumberSeq);
                FillWithCurrentUserHook.DefaultUserId = SequentialGuid.NewGuid().ToString();
                Users.Add(new User
                {
                    Id = FillWithCurrentUserHook.DefaultUserId,
                    UserName = "1",
                    Email = "user0@mail.com",
                    SecurityStamp = Guid.NewGuid().ToString(),
                    PasswordHash = _userManager.PasswordHasher.HashPassword("1")
                });
            }
            // Updating database to version 2
            else if (toVersion == 2)
            {
            }
        }

    }
}
