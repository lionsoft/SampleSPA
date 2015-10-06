using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Reflection;
using Sam.Extensions.EntityFramework.EFHooks;

namespace Sam.DbContext.Hooks
{
    public class FillWithCurrentDateHook : IPreActionHook
    {
        private static readonly ConcurrentDictionary<Type, Tuple<PropertyInfo, bool>[]> _cache = new ConcurrentDictionary<Type, Tuple<PropertyInfo, bool>[]>();

        public void HookObject(object entity, HookEntityMetadata metadata)
        {
            var entityType = entity.GetType();
            var props = _cache.GetOrAdd(entityType,
                t => entityType.GetProperties()
                    .Where(pi => (Nullable.GetUnderlyingType(pi.PropertyType) != null ? pi.PropertyType.GetGenericArguments()[0] : pi.PropertyType) == typeof(DateTime))
                    .Select(pi =>
                    {
                        var attr = pi.GetCustomAttribute<FillWithCurrentDateAttribute>();
                        return new Tuple<PropertyInfo, bool?>(pi, attr != null ? attr.OnCreateOnly : (bool?) null);
                    })
                    .Where(x => x.Item2 != null)
                    .Select(x => new Tuple<PropertyInfo, bool>(x.Item1, x.Item2.Value))
                    .ToArray());
            foreach (var pi in props.Where(x => metadata.State == EntityState.Added || !x.Item2 && metadata.State == EntityState.Modified))
            {
                pi.Item1.SetValue(entity, DateTime.Now);
            }
        }

        public EntityState HookStates
        {
            get { return EntityState.Added | EntityState.Modified; }
        }

        public bool RequiresValidation
        {
            get { return false; }
        }
    }

    /// <summary>
    /// Помечает свойство класса БД, которое должно быть автоматически заполнено текущей датой перед сохранением
    /// нового или существующего объекта.
    /// Если указано, что заполнять свойство нужно только перед сохранением существующего объекта - оно будет заполнено 
    /// и при создании объекта тоже.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class FillWithCurrentDateAttribute : Attribute
    {
        public bool OnCreateOnly { get; set; }
    }

}