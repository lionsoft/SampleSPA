using System.Data.Entity;
using System.Web.WebPages;
using Sam.Extensions;
using Sam.Extensions.EntityFramework.EFHooks;

namespace Sam.DbContext.Hooks
{
    public class KeyValueHook : IPreActionHook
    {
        public void HookObject(object entity, HookEntityMetadata metadata)
        {
            var entityId = entity as IEntityObjectId<string>;
            if (entityId != null && entityId.Id.IsEmpty())
                entityId.Id = SequentialGuid.NewGuid().ToString();
        }

        public EntityState HookStates
        {
            get { return EntityState.Added; }
        }

        public bool RequiresValidation
        {
            get { return false; }
        }
    }
}