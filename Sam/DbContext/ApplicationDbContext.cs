using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web.WebPages;
using Microsoft.AspNet.Identity.EntityFramework;
using Sam.Api;
using Sam.DbContext.Hooks;
using Sam.Extensions.EntityFramework;
using Sam.Extensions.EntityFramework.EFHooks;

namespace Sam.DbContext
{
    public partial class ApplicationDbContext : IdentityDbContext<User>
    {
        /// <summary>
        /// Default connection string name.
        /// </summary>
        public static string NameOrConnectionString = "ApplicationDb";


        [Table("DbInfo")]
        public class DbInfo
        {
            public const int MaxLength = -1; // For memo field

            public const string DbVersionParam = "DbVersion";

            [Key]
            public string Name { get; set; }

            [MaxLength(MaxLength)]
            public string Value { get; set; }
        }


        #region - Constructors -

//        private static int _cnt = 0;

        public SequentialIdProvider SequentialIdProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="Sam.DbContext.ApplicationDbContext"/> class.
        /// </summary>
        public ApplicationDbContext() : base(NameOrConnectionString, throwIfV1Schema: false)
        {
            Configuration.LazyLoadingEnabled = false;
            Configuration.ProxyCreationEnabled = false;
            SequentialIdProvider = new SequentialIdProvider(this);
            Initialize();
//            Debug.WriteLine("Created: " + Interlocked.Increment(ref _cnt));
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
//            Debug.WriteLine("Disposed: " + Interlocked.Decrement(ref _cnt));
        }

        public static ApplicationDbContext Create()
        {
            return new ApplicationDbContext();
        }

        #endregion


        #region - Initialization -


        /// <summary>
        /// Gets a value indicating whether database was initialized.
        /// </summary>
        /// <value>
        ///   <c>true</c> if database was initialized; otherwise, <c>false</c>.
        /// </value>
        protected static bool WasInitialized;

        internal void Initialize()
        {
            if (WasInitialized) return;
            WasInitialized = true;
            if (ActualDbVersion > CurrentDbVersion)
            {
                // Updating of the database must be done in another connection,
                // otherwise the added entities first time will be retrieved from cache but not from the database.
                // It can lead to a state when calculated fields are not filled first time,
                // and when LazyLoading = false the entities will be full retrieved.
                // 
                using (var db = Create())
                {
                    db.UpgradeDatabase(CurrentDbVersion, ActualDbVersion);
                    db.Attach(new DbInfo { Name = DbInfo.DbVersionParam, Value = ActualDbVersion.ToString() }, CurrentDbVersion == 0);
                    db.SaveChanges();
                }
            }
        }

        public bool LazyLoadingEnabled
        {
            get { return Configuration.LazyLoadingEnabled; }
            set { Configuration.LazyLoadingEnabled = value; }
        }

        public DbContextHooks _hooks;
        public DbContextHooks Hooks
        {
            get
            {
                if (_hooks == null)
                {
                    _hooks = new DbContextHooks(this);
                    _hooks.Add(new DateTimeUtcHook());
                    _hooks.Add(new KeyValueHook());
                    _hooks.Add(new FillWithCurrentUserHook());
                    _hooks.Add(new FillWithCurrentDateHook());
                }
                return _hooks;
            }
        }

        public override int SaveChanges()
        {
            return Hooks.SaveChanges(base.SaveChanges);
        }

        public override Task<int> SaveChangesAsync()
        {
            return SaveChangesAsync(CancellationToken.None);
        }
        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            return Hooks != null
                ? Hooks.SaveChangesAsync(base.SaveChangesAsync, cancellationToken)
                : base.SaveChangesAsync(cancellationToken);
        }

        #endregion

        #region - Database Version Checker -


        private static int? _currentDbVersion; // null - if current version hasn't got

        /// <summary>
        /// Database current version.<para></para>
        /// <c>0</c> - database has been just created.
        /// Will be updated automatically on changing <see cref="ActualDbVersion"/>.
        /// </summary>
        public int CurrentDbVersion
        {
            get
            {
                if (!_currentDbVersion.HasValue)
                {
                    _currentDbVersion = Infos.Where(x => x.Name == DbInfo.DbVersionParam).Select(x => x.Value).FirstOrDefault().AsInt();
                }
                return _currentDbVersion.Value;
            }
        }


        #endregion



        [Browsable(false)]
        public IDbSet<DbInfo> Infos { get; set; }


    }
}