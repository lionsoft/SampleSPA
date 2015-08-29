using T4TS;

namespace Sam.DbContext
{
    [TypeScriptInterface(Name = "User")]
    public class TypeScriptUser
    {
        [TypeScriptMember(Optional = true)]
        public string Id { get; set; }
        
        [TypeScriptMember(Optional = true)]
        public string UserName { get; set; }

        [TypeScriptMember(Optional = true)]
        public string PasswordHash { get; set; }

        [TypeScriptMember(Optional = true)]
        public string Email { get; set; }
        
/*
        [TypeScriptMember(Optional = true)]
        public string PhoneNumber { get; set; }
        public bool? PhoneNumberConfirmed { get; set; }
        public bool? LockoutEnabled { get; set; }
        public DateTime? LockoutEndDateUtc { get; set; }
        public bool? TwoFactorEnabled { get; set; }
*/
    }
}