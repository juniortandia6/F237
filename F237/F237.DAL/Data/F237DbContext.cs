using F237.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace F237.DAL.Data
{
    public class F237DbContext : DbContext
    {
        public F237DbContext(DbContextOptions<F237DbContext> options) : base(options)
        {
        }

        // Tables
        public DbSet<Equipe> Equipes { get; set; }
        public DbSet<Joueur> Joueurs { get; set; }
        public DbSet<Match> Matchs { get; set; }
        public DbSet<Saison> Saisons { get; set; }
        public DbSet<Classement> Classements { get; set; }
        public DbSet<ButMatch> ButsMatch { get; set; }
        public DbSet<Pari> Paris { get; set; }
        public DbSet<PariGroupe> PariGroupes { get; set; }
        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<DemandeRetrait> DemandesRetrait { get; set; }
        public DbSet<Transfert> Transferts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Equipe - Match (double relation)
            modelBuilder.Entity<Match>()
                .HasOne(m => m.EquipeDomicile)
                .WithMany(e => e.MatchsDomicile)
                .HasForeignKey(m => m.EquipeDomicileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Match>()
                .HasOne(m => m.EquipeExterieur)
                .WithMany(e => e.MatchsExterieur)
                .HasForeignKey(m => m.EquipeExterieurId)
                .OnDelete(DeleteBehavior.Restrict);

            // Transfert - Equipe (double relation)
            modelBuilder.Entity<Transfert>()
                .HasOne(t => t.EquipeDepart)
                .WithMany()
                .HasForeignKey(t => t.EquipeDepartId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transfert>()
                .HasOne(t => t.EquipeArrivee)
                .WithMany()
                .HasForeignKey(t => t.EquipeArriveeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}