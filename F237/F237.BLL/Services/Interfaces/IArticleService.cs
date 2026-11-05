using F237.Domain.Entities;

namespace F237.BLL.Services.Interfaces
{
    public interface IArticleService
    {
        /// <summary>Articles visibles sur le site (publiés, date passée), filtrés par catégorie si besoin.</summary>
        Task<List<Article>> GetPubliesAsync(string? tag);

        /// <summary>Un article publié par son slug (null si introuvable ou brouillon).</summary>
        Task<Article?> GetPublieBySlugAsync(string slug);

        // ── Admin
        Task<List<Article>> GetTousAsync();
        Task<Article?> GetByIdAsync(int id);
        Task<ResultatArticle> CreerAsync(SaisieArticle saisie);
        Task<ResultatArticle> ModifierAsync(int id, SaisieArticle saisie);
        Task<bool> SupprimerAsync(int id);
    }

    /// <summary>Ce que l'admin envoie pour créer ou modifier un article.</summary>
    public class SaisieArticle
    {
        public string? Slug { get; set; }            // facultatif : généré depuis le titre français
        public string Tag { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string TitreFr { get; set; } = string.Empty;
        public string ResumeFr { get; set; } = string.Empty;
        public string ContenuFr { get; set; } = string.Empty;
        public string? TitreEn { get; set; }
        public string? ResumeEn { get; set; }
        public string? ContenuEn { get; set; }
        public bool EstPublie { get; set; }
        public bool ALaUne { get; set; }
        public DateTime? DatePublication { get; set; } // facultatif : maintenant par défaut
    }

    /// <summary>Résultat d'une création / modification : l'article, ou l'erreur à afficher.</summary>
    public class ResultatArticle
    {
        public Article? Article { get; init; }
        public string? Erreur { get; init; }
        public bool Introuvable { get; init; }

        public static ResultatArticle Ok(Article a) => new() { Article = a };
        public static ResultatArticle Ko(string erreur) => new() { Erreur = erreur };
        public static ResultatArticle NonTrouve() => new() { Introuvable = true };
    }
}