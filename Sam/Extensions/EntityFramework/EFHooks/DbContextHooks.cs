using System;
using System.Collections.Generic;
using System.Linq;

namespace Sam.Extensions.EntityFramework.EFHooks
{
    /// <summary>
    /// An Entity Framework DbContext that can be hooked into by registering EFHooks.IHook objects.
    /// </summary>
    public partial class DbContextHooks
    {
        public System.Data.Entity.DbContext Context { get; private set; }

        /// <summary>
        /// The pre-action hooks.
        /// </summary>
        public List<IPreActionHook> PreHooks { get; private set;  }
        /// <summary>
        /// The post-action hooks.
        /// </summary>
        public List<IPostActionHook> PostHooks { get; private set;  }


        /// <summary>
        /// Initializes a new instance of the <see cref="DbContextHooks" /> class, initializing empty lists of hooks.
        /// </summary>
        public DbContextHooks(System.Data.Entity.DbContext context)
        {
            Context = context;
            PreHooks = new List<IPreActionHook>();
            PostHooks = new List<IPostActionHook>();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DbContextHooks" /> class, filling <see cref="PreHooks"/> and <see cref="PostHooks"/>.
        /// </summary>
        /// <param name="context">Databse context</param>
        /// <param name="hooks">The hooks.</param>
        public DbContextHooks(System.Data.Entity.DbContext context, IHook[] hooks)
        {
            Context = context;
            PreHooks = hooks.OfType<IPreActionHook>().ToList();
            PostHooks = hooks.OfType<IPostActionHook>().ToList();
        }

        /// <summary>
        /// Registers a hook.
        /// </summary>
        /// <param name="hook">The hook to register.</param>
        public void Add(IHook hook)
        {
            RegisterHook(hook as IPreActionHook);
            RegisterHook(hook as IPostActionHook);
        }

        /// <summary>
        /// Registers a hook to run before a database action occurs.
        /// </summary>
        /// <param name="hook">The hook to register.</param>
        private void RegisterHook(IPreActionHook hook)
        {
            if (hook != null)
            {
                PreHooks.Add(hook);
            }
        }

        /// <summary>
        /// Registers a hook to run after a database action occurs.
        /// </summary>
        /// <param name="hook">The hook to register.</param>
        private void RegisterHook(IPostActionHook hook)
        {
            if (hook != null)
            {
                PostHooks.Add(hook);
            }
        }

        /// <summary>
        /// Saves all changes made in this context to the underlying database.
        /// </summary>
        /// <returns>
        /// The number of objects written to the underlying database.
        /// </returns>
        public int SaveChanges(Func<int> saveChanges)
        {
            var hookExecution = new HookRunner(this);
            hookExecution.RunPreActionHooks();
            var result = saveChanges();
            hookExecution.RunPostActionHooks();
            return result;
        }
    }
}