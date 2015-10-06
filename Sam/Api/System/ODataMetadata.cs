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
                var item = PrepareResultEntity((T)(pi == null ? x : pi.GetValue(x)));

                return item;
            });
        }

        private TEntity PrepareResultEntity<TEntity>(TEntity p)
        {
/*
            var card = p as Card;
            if (card != null)
            {
                AccountController.ClearUserEmployeeFields(card.Employee);
            }
            var cardAccess = p as CardAccess;
            if (cardAccess != null)
            {
                PrepareResultEntity(cardAccess.Card);
            }
            var e = p as Employee;
            if (e != null)
            {
                AccountController.ClearUserEmployeeFields(e, false);
            }
*/
            var u = p as User;
            if (u != null)
            {
                AccountController.ClearUserFields(u);
            }
            return p;
        }


        public IEnumerable<T> Results { get; protected set; }

        public long? Count { get; protected set; }
    }
}