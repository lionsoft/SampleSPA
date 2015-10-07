using System.Collections.Generic;
using T4TS;

namespace Sam.DbContext
{
    [TypeScriptInterface(Name = "User")]
    public class JsonUser
    {
        public string Id { get; set; }
        
        [TypeScriptMember(Optional = true)]
        public string UserName { get; set; }

        [TypeScriptMember(Optional = true)]
        public string Email { get; set; }
        public UserRole UserRole { get; set; }

        [TypeScriptMember(Optional = true)]
        public string PasswordHash { get; set; }

        private JsonUser(User user)
        {
            Id = user.Id;
            UserName = user.UserName;
            Email = user.Email;
            UserRole = user.UserRole;
        }
        public static JsonUser Create(User user)
        {
            return user == null ? null : new JsonUser(user);
        }

        public User ToUser()
        {
            return new User { Id = Id, UserName = UserName, Email = Email, UserRole = UserRole }; 
        }
    }
}