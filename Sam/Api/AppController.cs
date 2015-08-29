using System;
using System.Web.Http;
using Sam.DbContext;

namespace Sam.Api
{
    public class AppController : ApiController
    {
        private Lazy<ApplicationDbContext> _db = new Lazy<ApplicationDbContext>(ApplicationDbContext.Create);

        public ApplicationDbContext Db { get { return _db.Value; } }

        #region Overrides of ApiController

        /// <summary>
        /// Releases the unmanaged resources that are used by the object and, optionally, releases the managed resources.
        /// </summary>
        /// <param name="disposing">true to release both managed and unmanaged resources; false to release only unmanaged resources.</param>
        protected override void Dispose(bool disposing)
        {
            if (_db != null && _db.IsValueCreated)
            {
                Db.Dispose();
                _db = null;
            }
                
            base.Dispose(disposing);
        }

        #endregion
    }
}