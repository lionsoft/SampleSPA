using System;
using System.Linq;

namespace Sam.Api
{
    public class SequentialIdProvider
    {
        private readonly System.Data.Entity.DbContext _context;

        public SequentialIdProvider(System.Data.Entity.DbContext context)
        {
            _context = context;
        }

        public void Create(string name)
        {
            _context.Database.ExecuteSqlCommand(string.Format("CREATE SEQUENCE {0} START WITH 1", name));
        }

        public long GetNextId(string name)
        {
            return _context.Database.SqlQuery<long>(string.Format("SELECT NEXT VALUE FOR {0}", name)).FirstOrDefault();
        }
    }
}