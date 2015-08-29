using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.Infrastructure.Annotations;
using System.Data.Entity.ModelConfiguration.Conventions;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Sam.DbContext
{
    /// <summary>
    /// Description of the application tables
    /// </summary>
    partial class ApplicationDbContext
    {
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Conventions.Add<OneToManyCascadeDeleteConvention>();
            modelBuilder.Conventions.Add<ManyToManyCascadeDeleteConvention>();

            // Устанавливаем размер строки по умолчанию 128 символов
            modelBuilder.Properties<string>().Configure(c => c.HasMaxLength(128));

            modelBuilder.Entity<IdentityUserRole>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserLogin>().ToTable("Logins");
            modelBuilder.Entity<IdentityUserClaim>().ToTable("Claims");
            modelBuilder.Entity<IdentityRole>().ToTable("Roles");

            modelBuilder.Entity<IdentityUser>().ToTable("Users");
            modelBuilder.Entity<User>().ToTable("Users");

            modelBuilder.Entity<User>().Property(u => u.Email).HasColumnAnnotation("Index", new IndexAnnotation(new IndexAttribute("IDX_UserEmail", 0) { IsUnique = true }));
         }

    }
}