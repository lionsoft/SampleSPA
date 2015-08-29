using System.Data.Entity;

namespace Sam.Extensions.EntityFramework.EFHooks
{
    public class EntityHook<TEntity> : IPreActionHook, IPostActionHook, IPostLoadHook where TEntity : class
    {
        public EntityState HookStates
        {
            get { return EntityState.Added | EntityState.Modified; }
        }

        public void HookObject(object entity, HookEntityMetadata metadata)
        {
            var e = entity as TEntity;
            if (e != null)
            {
                if (metadata.HookType == HookType.Load)
                    HookOnLoad(e, metadata);
                else if (metadata.HookType == HookType.Pre)
                    HookBeforeSave(e, metadata.State == EntityState.Added, metadata);
                else if (metadata.HookType == HookType.Post)
                    HookAfterSave(e, metadata.State == EntityState.Added, metadata);
            }
        }

        public virtual bool RequiresValidation
        {
            get { return false; }
        }

        protected virtual void HookBeforeSave(TEntity entity, bool isNew, HookEntityMetadata metadata)
        {
        }
        protected virtual void HookAfterSave(TEntity entity, bool isNew, HookEntityMetadata metadata)
        {
            HookOnLoad(entity, metadata);
        }

        protected virtual void HookOnLoad(TEntity entity, HookEntityMetadata metadata)
        {
        }

    }
}
