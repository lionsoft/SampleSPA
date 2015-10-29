using System.Collections.Generic;
using System.Linq;
using Sam.DbContext;

namespace Sam.Api
{
    public class ODataMetadata<T> where T : class
    {
        protected ODataMetadata()
        {
            
        }
        public ODataMetadata(IEnumerable<T> result, long? count)
        {
            Count = count;
            Results = result;
        }

        public ODataMetadata(IEnumerable<object> result, long? count)
        {
            Count = count;
            if (typeof (T) == typeof (object))
                Results = (IEnumerable<T>) result;
            else
                Results = Convert(result);
        }
        private IEnumerable<T> Convert(IEnumerable<object> result)
        {
            return result.Select(x =>
            {
                var pi = x is T ? null : x.GetType().GetProperty("Instance");
                var item = PrepareResultEntity<T>(pi == null ? x : pi.GetValue(x));
                return item;
            });
        }

        private TEntity PrepareResultEntity<TEntity>(object p)
        {
            var u = p as User;
            if (u != null)
            {
                var jsonUser = JsonUser.Create(u);
                if (typeof (TEntity) == typeof (JsonUser))
                    p = jsonUser;
                else
                    p = jsonUser.ToUser();
            }
            return (TEntity)p;
        }


        public IEnumerable<T> Results { get; protected set; }

        public long? Count { get; protected set; }
    }
}