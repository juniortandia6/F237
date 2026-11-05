using F237.BLL.Services.Implementations;
using F237.Domain.Entities;

namespace F237.API.DTOs
{
    /// <summary>
    /// Article tel que le site l'affiche. Même forme que les anciennes données
    /// du frontend (data/actualites.js) : texte français + bloc "en" facultatif.
    /// </summary>
    public class ArticleDto
    {
        public int Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Tag { get; set; } = string.Empty;
        public string? Img { get; set; }
        public DateTime Date { get; set; }
        public bool ALaUne { get; set; }
        public string Titre { get; set; } = string.Empty;
        public string Resume { get; set; } = string.Empty;
        public List<string>? Contenu { get; set; }      // null dans les listes (seulement sur la page article)
        public ArticleTexteDto? En { get; set; }

        public static ArticleDto Depuis(Article a, bool avecContenu) => new()
        {
            Id = a.Id,
            Slug = a.Slug,
            Tag = a.Tag,
            Img = a.ImageUrl,
            Date = a.DatePublication,
            ALaUne = a.ALaUne,
            Titre = a.TitreFr,
            Resume = a.ResumeFr,
            Contenu = avecContenu ? ArticleService.Paragraphes(a.ContenuFr) : null,
            En = a.TitreEn == null && a.ResumeEn == null && a.ContenuEn == null
                ? null
                : new ArticleTexteDto
                {
                    Titre = a.TitreEn,
                    Resume = a.ResumeEn,
                    Contenu = avecContenu && a.ContenuEn != null ? ArticleService.Paragraphes(a.ContenuEn) : null,
                },
        };
    }

    public class ArticleTexteDto
    {
        public string? Titre { get; set; }
        public string? Resume { get; set; }
        public List<string>? Contenu { get; set; }
    }

    /// <summary>Article complet pour l'admin (brouillons compris, contenu brut).</summary>
    public class ArticleAdminDto
    {
        public int Id { get; set; }
        public string Slug { get; set; } = string.Empty;
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
        public DateTime DatePublication { get; set; }
        public DateTime DateCreation { get; set; }
        public DateTime DateModification { get; set; }

        public static ArticleAdminDto Depuis(Article a) => new()
        {
            Id = a.Id,
            Slug = a.Slug,
            Tag = a.Tag,
            ImageUrl = a.ImageUrl,
            TitreFr = a.TitreFr,
            ResumeFr = a.ResumeFr,
            ContenuFr = a.ContenuFr,
            TitreEn = a.TitreEn,
            ResumeEn = a.ResumeEn,
            ContenuEn = a.ContenuEn,
            EstPublie = a.EstPublie,
            ALaUne = a.ALaUne,
            DatePublication = a.DatePublication,
            DateCreation = a.DateCreation,
            DateModification = a.DateModification,
        };
    }
}