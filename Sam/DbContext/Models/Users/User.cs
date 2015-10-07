using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Newtonsoft.Json;
using Sam.Extensions;
using T4TS;

namespace Sam.DbContext
{
    // You can add profile data for the user by adding more properties to your ApplicationUser class, please visit http://go.microsoft.com/fwlink/?LinkID=317594 to learn more.
    public class User : IdentityUser, IEntityObjectId<string>
    {
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User> manager, string authenticationType)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, authenticationType);
            // Add custom user claims here
            userIdentity.SetClaimValue("Email", Email);
            userIdentity.SetClaimValue("Role", ((int)UserRole).ToString());

            return userIdentity;
        }


        public UserRole UserRole { get; set; }

        [JsonIgnore]
        public override bool EmailConfirmed { get; set; }

        [JsonIgnore]
        public override bool PhoneNumberConfirmed { get; set; }

        [JsonIgnore]
        public override bool TwoFactorEnabled { get; set; }

        [JsonIgnore]
        public override bool LockoutEnabled { get; set; }

        [JsonIgnore]
        public override int AccessFailedCount { get; set; }

        [JsonIgnore]
        public override ICollection<IdentityUserRole> Roles { get { return base.Roles; } }

        [JsonIgnore]
        public override ICollection<IdentityUserClaim> Claims { get { return base.Claims; } }

        [JsonIgnore]
        public override ICollection<IdentityUserLogin> Logins { get { return base.Logins; } }

        public User() : base()
        {
          Id = null;
        }

        public User(string userName) : base(userName)
        {
          Id = Guid.NewGuid().ToString();
        }

        internal User Sanitize()
        {
            return JsonUser.Create(this).ToUser();
        }


    }
}