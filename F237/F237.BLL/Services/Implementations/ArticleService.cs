using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using F237.BLL.Services.Interfaces;
using F237.DAL.Repositories.Interfaces;
using F237.Domain.Entities;

namespace F237.BLL.Services.Implementations
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _articleRepository;

        // Segments déjà utilisés par les routes /api/articles/... : interdits comme slug
        private static readonly HashSet<string> SlugsReserves = new() { "admin" };

        public ArticleService(IArticleRepository articleRepository)
        {
            _articleRepository = articleRepository;
        }

        public Task<List<Article>> GetPubliesAsync(string? tag) =>
            _articleRepository.GetPubliesAsync(tag, DateTime.UtcNow);

        public async Task<Article?> GetPublieBySlugAsync(string slug)
        {
            var article = await _articleRepository.GetBySlugAsync(slug);
            return article != null && article.EstPublie && article.DatePublication <= DateTime.UtcNow
                ? article
                : null;
        }

        public Task<List<Article>> GetTousAsync() => _articleRepository.GetTousAsync();

        public Task<Article?> GetByIdAsync(int id) => _articleRepository.GetByIdAsync(id);

        public async Task<ResultatArticle> CreerAsync(SaisieArticle saisie)
        {
            var erreur = Valider(saisie);
            if (erreur != null) return ResultatArticle.Ko(erreur);

            var maintenant = DateTime.UtcNow;
            var article = new Article { DateCreation = maintenant };
            Appliquer(article, saisie, maintenant);
            article.Slug = await SlugUniqueAsync(saisie.Slug, saisie.TitreFr, null);

            await _articleRepository.AjouterAsync(article);
            return ResultatArticle.Ok(article);
        }

        public async Task<ResultatArticle> ModifierAsync(int id, SaisieArticle saisie)
        {
            var article = await _articleRepository.GetByIdAsync(id);
            if (article == null) return ResultatArticle.NonTrouve();

            var erreur = Valider(saisie);
            if (erreur != null) return ResultatArticle.Ko(erreur);

            Appliquer(article, saisie, DateTime.UtcNow);
            // Le slug ne change que si l'admin en donne un nouveau (les liens partagés restent valides)
            if (!string.IsNullOrWhiteSpace(saisie.Slug) && Slugifier(saisie.Slug) != article.Slug)
                article.Slug = await SlugUniqueAsync(saisie.Slug, saisie.TitreFr, article.Id);

            await _articleRepository.ModifierAsync(article);
            return ResultatArticle.Ok(article);
        }

        public async Task<bool> SupprimerAsync(int id)
        {
            var article = await _articleRepository.GetByIdAsync(id);
            if (article == null) return false;
            await _articleRepository.SupprimerAsync(article);
            return true;
        }

        // ── Règles ────────────────────────────────────────────────────────────

        private static string? Valider(SaisieArticle s)
        {
            if (string.IsNullOrWhiteSpace(s.TitreFr)) return "Le titre (français) est obligatoire.";
            if (string.IsNullOrWhiteSpace(s.ResumeFr)) return "Le résumé (français) est obligatoire.";
            if (string.IsNullOrWhiteSpace(s.ContenuFr)) return "Le contenu (français) est obligatoire.";
            if (s.TitreFr.Trim().Length > 200 || (s.TitreEn?.Trim().Length ?? 0) > 200) return "Le titre dépasse 200 caractères.";
            if (s.ResumeFr.Trim().Length > 400 || (s.ResumeEn?.Trim().Length ?? 0) > 400) return "Le résumé dépasse 400 caractères.";
            if (!TagsArticle.Tous.Contains(s.Tag))
                return $"Catégorie inconnue. Valeurs possibles : {string.Join(", ", TagsArticle.Tous)}.";
            if (!string.IsNullOrWhiteSpace(s.ImageUrl))
            {
                var ok = Uri.TryCreate(s.ImageUrl.Trim(), UriKind.Absolute, out var uri)
                         && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp);
                if (!ok || s.ImageUrl.Trim().Length > 500) return "L'image doit être une adresse http(s) complète (500 caractères max).";
            }
            return null;
        }

        private static void Appliquer(Article a, SaisieArticle s, DateTime maintenantUtc)
        {
            a.Tag = s.Tag;
            a.ImageUrl = TexteOuNull(s.ImageUrl);
            a.TitreFr = s.TitreFr.Trim();
            a.ResumeFr = s.ResumeFr.Trim();
            a.ContenuFr = NormaliserContenu(s.ContenuFr);
            a.TitreEn = TexteOuNull(s.TitreEn);
            a.ResumeEn = TexteOuNull(s.ResumeEn);
            a.ContenuEn = string.IsNullOrWhiteSpace(s.ContenuEn) ? null : NormaliserContenu(s.ContenuEn);
            // Un brouillon qu'on publie sans date précise prend la date du jour
            var devientPublie = s.EstPublie && !a.EstPublie;
            a.EstPublie = s.EstPublie;
            a.ALaUne = s.ALaUne;
            a.DatePublication = s.DatePublication.HasValue
                ? EnUtc(s.DatePublication.Value)
                : (a.Id == 0 || devientPublie ? maintenantUtc : a.DatePublication);
            a.DateModification = maintenantUtc;
        }

        // "2026-11-05T09:00:00-05:00" -> UTC ; une date sans fuseau est considérée comme déjà en UTC
        private static DateTime EnUtc(DateTime d) => d.Kind switch
        {
            DateTimeKind.Utc => d,
            DateTimeKind.Local => d.ToUniversalTime(),
            _ => DateTime.SpecifyKind(d, DateTimeKind.Utc),
        };

        private static string? TexteOuNull(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

        // Retours à la ligne Windows -> "\n", espaces en trop retirés, paragraphes séparés par une ligne vide
        private static string NormaliserContenu(string texte)
        {
            var paragraphes = Regex.Split(texte.Replace("\r\n", "\n").Trim(), @"\n\s*\n")
                .Select(p => p.Trim())
                .Where(p => p.Length > 0);
            return string.Join("\n\n", paragraphes);
        }

        /// <summary>Découpe un contenu stocké en paragraphes (utilisé par l'API).</summary>
        public static List<string> Paragraphes(string? contenu) =>
            string.IsNullOrWhiteSpace(contenu)
                ? new List<string>()
                : Regex.Split(contenu, @"\n\s*\n").Select(p => p.Trim()).Where(p => p.Length > 0).ToList();

        private async Task<string> SlugUniqueAsync(string? slugVoulu, string titre, int? saufId)
        {
            var base_ = Slugifier(string.IsNullOrWhiteSpace(slugVoulu) ? titre : slugVoulu);
            if (base_.Length == 0) base_ = "article";
            if (SlugsReserves.Contains(base_)) base_ += "-1";

            var slug = base_;
            for (var i = 2; await _articleRepository.SlugExisteAsync(slug, saufId); i++)
                slug = $"{base_}-{i}";
            return slug;
        }

        // "Colombe s'envole en tête !" -> "colombe-s-envole-en-tete"
        private static string Slugifier(string texte)
        {
            var sansAccents = new StringBuilder();
            foreach (var c in texte.Normalize(NormalizationForm.FormD))
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    sansAccents.Append(c);

            var slug = Regex.Replace(sansAccents.ToString().ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
            if (slug.Length > 80) slug = slug[..80].TrimEnd('-');
            return slug;
        }
    }
}