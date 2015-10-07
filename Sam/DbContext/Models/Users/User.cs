using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Sam.Extensions;

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
        public User() : base()
        {
          this.Id = null;
        }

        public User(string userName) : base(userName)
        {
          this.Id = Guid.NewGuid().ToString();
        }
    }
}