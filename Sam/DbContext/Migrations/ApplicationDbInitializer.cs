using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;

namespace Sam.DbContext
{
    /// <summary>
    /// Defines database creation parameters
    /// </summary>
    public class DbCreationParams
    {
        /// <summary>
        /// Gets or sets the default database collate.
        /// </summary>
        public string Collate { get; set; }
    }

    /// <inheritdoc/>
    class ApplicationDbInitializer : MigrateDatabaseToLatestVersion<ApplicationDbContext, Configuration>
    {
        private readonly DbCreationParams _creationParams;

        /// <summary>
        /// Initializes a new instance of the <see cref="ApplicationDbInitializer"/> class.
        /// </summary>
        /// <param name="creationParams"></param>
        public ApplicationDbInitializer(DbCreationParams creationParams = null)
        {
            _creationParams = creationParams ?? new DbCreationParams();
        }
        /// <inheritdoc/>
        public override void InitializeDatabase(ApplicationDbContext context)
        {
            if (context.Database.CreateIfNotExists())
            {
                if (_creationParams.Collate != null) 
                    context.Database.ExecuteSqlCommand(TransactionalBehavior.DoNotEnsureTransaction, string.Format("ALTER DATABASE [{0}] COLLATE {1}", context.Database.Connection.Database, _creationParams.Collate));
                SqlConnection.ClearAllPools();
            }
            else
            {
                if (ApplicationDbContext.ActualDbVersion < context.CurrentDbVersion)
                {
                    throw new DbUpdateException(string.Format("Actual database version ({0}) of the application less than current database one ({1}).\r\nDowngrade of the database is not supported.", ApplicationDbContext.ActualDbVersion, context.CurrentDbVersion));
                }
            }

            base.InitializeDatabase(context);
        }
    }
}