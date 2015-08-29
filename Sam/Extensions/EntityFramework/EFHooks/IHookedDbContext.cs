using System.Collections.Generic;
using System.Data.Entity.Infrastructure;

namespace Sam.Extensions.EntityFramework.EFHooks
{
    public interface IHookedDbContext
    {
        DbChangeTracker ChangeTracker { get; }
        DbContextConfiguration Configuration { get; }

        /// <summary>
        /// The pre-action hooks.
        /// </summary>
        IList<IPreActionHook> PreHooks { get; }
        /// <summary>
        /// The post-action hooks.
        /// </summary>
        IList<IPostActionHook> PostHooks { get; }

    }
}