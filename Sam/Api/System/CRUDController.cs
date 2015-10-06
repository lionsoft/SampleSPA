using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.OData.Extensions;
using System.Web.Http.OData.Query;
using Sam.DbContext;
using Sam.Extensions.EntityFramework;

namespace Sam.Api
{
    public static class CRUDController
    {
        public static async Task<object> CreateODataResponse<TEntity>(IQueryable<TEntity> query, HttpRequestMessage request, ODataQueryOptions<TEntity> queryOptions) where TEntity : class
        {
            var results = queryOptions.ApplyTo(query);
            var res = await results.ToListAsync();
            if (queryOptions.InlineCount != null && queryOptions.InlineCount.Value == InlineCountValue.AllPages)
            {
                var odataProperties = request.ODataProperties();
                return new[] { new ODataMetadata<TEntity>(res, odataProperties.TotalCount) };
            }
            else
            {
                return new ODataMetadata<TEntity>(res, 0).Results;
            }
        }
    }


    public class CRUDController<TEntity, T> : AppController where TEntity : class, IEntityObjectId<T>
    {
        protected virtual IQueryable<TEntity> PrepareQuery(DbQuery<TEntity> dbSet)
        {
            return dbSet;
        }

        [HttpGet]
        public async virtual Task<object> Get(ODataQueryOptions<TEntity> queryOptions)
        {
            var includes = queryOptions.SelectExpand == null ? new string[0] : queryOptions.SelectExpand.RawExpand.Split(',');
            DbQuery<TEntity> query = Db.Set<TEntity>();
/*
            if (includes.Contains("CreatedBy"))
            {
                query = query.Include("CreatedBy.Employees");
            }
*/
            var res = await CRUDController.CreateODataResponse(PrepareQuery(query), Request, queryOptions);
            return res;
        }

        [HttpGet, Route("{id}")]
        public virtual Task<TEntity> GetAsync(T id)
        {
            return Db.Set<TEntity>().FindAsync(id);
        }

        protected virtual void PrepareSave(TEntity entity, bool isNew)
        {

        }

        protected virtual bool IsNullId(T id)
        {
            var objId = (object)(id);
            return objId == null || (id is int && id.ToString() == "0");
        }

        [HttpPatch]
        public Task<TEntity> SaveAsync(TEntity entity)
        {
            return SaveAsync(entity, IsNullId(entity.Id));
        }

        public virtual async Task<TEntity> SaveAsync(TEntity entity, bool isNew)
        {
            PrepareSave(entity, isNew);
            Db.Attach(entity, isNew);
            await Db.SaveChangesAsync();
            //await Db.Entry(e).GetDatabaseValuesAsync();
            return entity;
        }


        [HttpPost]
        public Task<TEntity> CreateAsync(TEntity entity)
        {
            return SaveAsync(entity, true);
        }

        [HttpPut]
        public virtual Task<TEntity> UpdateAsync(TEntity entity)
        {
            return SaveAsync(entity, false);
        }

        [HttpDelete, Route("{id}")]
        public virtual async Task<bool> DeleteAsync(T id)
        {
            var e = await GetAsync(id);
            if (e != null)
            {
                Db.Set<TEntity>().Remove(e);
                await Db.SaveChangesAsync();
            }
                
            return e != null;
        }

    }

    
    public class CRUDController<TEntity> : CRUDController<TEntity, string> where TEntity : class, IEntityObjectId
    {
        protected override bool IsNullId(string id)
        {
            return string.IsNullOrWhiteSpace(id);
        }

        public override async Task<TEntity> SaveAsync(TEntity entity, bool isNew)
        {
            PrepareSave(entity, isNew);
            Db.Attach(entity, isNew);
            await Db.SaveChangesAsync();
            //await Db.Entry(entity).GetDatabaseValuesAsync();
            entity = Db.Set<TEntity>()
                .Include(x => x.CreatedBy)
                .Include(x => x.ModifiedBy)
                .First(x => x.Id == entity.Id);
            return entity;
        }

    }
}