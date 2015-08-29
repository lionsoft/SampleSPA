using System;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Sam.Extensions
{
    public static class EntityExtensions
    {
        public static TEntity Attach<TEntity>(this System.Data.Entity.DbContext dbContext, TEntity entity, bool isNew) where TEntity : class
        {
            dbContext.Entry(entity).State = isNew ? EntityState.Added : EntityState.Modified;
            return entity;
        }

        #region - First -

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity FirstEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            return dbSet.Local.FirstOrDefault() ?? dbSet.First();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity FirstEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            return dbSet.Local.FirstOrDefault(predicate.Compile()) ?? dbSet.First(predicate);
        }

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> FirstAsyncEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            var res = dbSet.Local.FirstOrDefault();
            return res != null ? Task.FromResult(res) : dbSet.FirstAsync();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> FirstAsyncEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            var res = dbSet.Local.FirstOrDefault(predicate.Compile());
            return res != null ? Task.FromResult(res) : dbSet.FirstAsync(predicate);
        }

        #endregion

        #region - FirstOrDefault -

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity FirstOrDefaultEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            return dbSet.Local.FirstOrDefault() ?? dbSet.FirstOrDefault();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity FirstOrDefaultEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            return dbSet.Local.FirstOrDefault(predicate.Compile()) ?? dbSet.FirstOrDefault(predicate);
        }

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> FirstOrDefaultAsyncEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            var res = dbSet.Local.FirstOrDefault();
            return res != null ? Task.FromResult(res) : dbSet.FirstOrDefaultAsync();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> FirstOrDefaultAsyncEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            var res = dbSet.Local.FirstOrDefault(predicate.Compile());
            return res != null ? Task.FromResult(res) : dbSet.FirstOrDefaultAsync(predicate);
        }

        #endregion

        #region - Single -

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity SingleEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            return dbSet.Local.SingleOrDefault() ?? dbSet.Single();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity SingleEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            return dbSet.Local.SingleOrDefault(predicate.Compile()) ?? dbSet.Single(predicate);
        }

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> SingleAsyncEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            var res = dbSet.Local.SingleOrDefault();
            return res != null ? Task.FromResult(res) : dbSet.SingleAsync();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> SingleAsyncEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            var res = dbSet.Local.SingleOrDefault(predicate.Compile());
            return res != null ? Task.FromResult(res) : dbSet.SingleAsync(predicate);
        }

        #endregion

        #region - SingleOrDefault -

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity SingleOrDefaultEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            return dbSet.Local.SingleOrDefault() ?? dbSet.SingleOrDefault();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static TEntity SingleOrDefaultEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            return dbSet.Local.SingleOrDefault(predicate.Compile()) ?? dbSet.SingleOrDefault(predicate);
        }

        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> SingleOrDefaultAsyncEx<TEntity>(this IDbSet<TEntity> dbSet) where TEntity : class
        {
            var res = dbSet.Local.SingleOrDefault();
            return res != null ? Task.FromResult(res) : dbSet.SingleOrDefaultAsync();
        }
        /// <summary>
        /// Отличается от стандартного метода тем, что вначале ищет в локальном кеше, а если не находит - выполняет запрос к БД
        /// </summary>
        public static Task<TEntity> SingleOrDefaultAsyncEx<TEntity>(this IDbSet<TEntity> dbSet, Expression<Func<TEntity, bool>> predicate) where TEntity : class
        {
            var res = dbSet.Local.SingleOrDefault(predicate.Compile());
            return res != null ? Task.FromResult(res) : dbSet.SingleOrDefaultAsync(predicate);
        }

        #endregion
    }
}