using System.ComponentModel.DataAnnotations;

namespace F237.Domain.Entities
{
    /// <summary>
    /// Article de la section Actualités, rédigé depuis l'admin.
    /// Le français est obligatoire ; l'anglais est facultatif (repli sur le français).
    /// Le contenu est un texte brut : une ligne vide sépare deux paragraphes.
    /// </summary>
    public class Article
    {
        public int Id { get; set; }

        // Adresse de l'article : /actualites/{Slug} (unique, généré depuis le titre)
        [MaxLength(120)]
        public string Slug { get; set; } = string.Empty;

        // Catégorie : "Elite One", "Elite Two", "Transfert", "Talents", "Compétition"
        [MaxLength(40)]
        public string Tag { get; set; } = string.Empty;

        // Image de couverture (URL complète). Null : le site met une image par défaut.
        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        // ── Français (obligatoire)
        [MaxLength(200)]
        public string TitreFr { get; set; } = string.Empty;

        [MaxLength(400)]
        public string ResumeFr { get; set; } = string.Empty;

        public string ContenuFr { get; set; } = string.Empty;

        // ── Anglais (facultatif)
        [MaxLength(200)]
        public string? TitreEn { get; set; }

        [MaxLength(400)]
        public string? ResumeEn { get; set; }

        public string? ContenuEn { get; set; }

        // Brouillon (false) ou visible sur le site (true)
        public bool EstPublie { get; set; } = false;

        // Mis en avant en priorité dans le hero de l'accueil
        public bool ALaUne { get; set; } = false;

        // Toutes les dates en UTC
        public DateTime DatePublication { get; set; } = DateTime.UtcNow;
        public DateTime DateCreation { get; set; } = DateTime.UtcNow;
        public DateTime DateModification { get; set; } = DateTime.UtcNow;
    }

    /// <summary>Catégories autorisées (mêmes clés que actualites.tags.* côté frontend).</summary>
    public static class TagsArticle
    {
        public static readonly string[] Tous = { "Elite One", "Elite Two", "Transfert", "Talents", "Compétition" };
    }
}