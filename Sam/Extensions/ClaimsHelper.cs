using System.Linq;
using System.Security.Principal;

namespace Sam.Extensions
{
    public static class ClaimsHelper
    {
        public static void SetClaimValue(this IIdentity identity, string claimType, string value)
        {
            var ident = identity as System.Security.Claims.ClaimsIdentity;
            var claim = claimType == System.Security.Claims.ClaimTypes.Name
                ? new System.Security.Claims.Claim(claimType, value ?? "", "http://www.w3.org/2001/XMLSchema#string", "LOCAL AUTHORITY", "LOCAL AUTHORITY", ident)
                : new System.Security.Claims.Claim(claimType, value ?? "");
            SetClaim(identity, claim);
        }

        public static void SetClaim(this IIdentity identity, System.Security.Claims.Claim claim)
        {
            var ident = identity as System.Security.Claims.ClaimsIdentity;
            if (ident == null) return;
            foreach (var c in ident.FindAll(c => c.Type == claim.Type).ToList())
            {
                ident.RemoveClaim(c);
            }
            ident.AddClaim(claim);
        }

        public static string GetClaimValue(this IIdentity identity, string claimType)
        {
            var ident = identity as System.Security.Claims.ClaimsIdentity;
            if (ident == null) return null;
            var claim = ident.FindFirst(claimType);
            return claim != null ? claim.Value : null;
        }
    }

}