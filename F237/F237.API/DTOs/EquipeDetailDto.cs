// F237.API/DTOs/EquipeDetailDto.cs

namespace F237.API.DTOs
{
    public class EquipeDetailDto
    {
        public int Id { get; set; }
        public int ApiFootballId { get; set; }
        public string Nom { get; set; } = "";
        public string? LogoUrl { get; set; }
        public int Division { get; set; }

        // Infos club depuis API-Football
        public InfosClubDto? Infos { get; set; }

        // Palmarès
        public List<TropheeDto> Palmares { get; set; } = new();

        // Effectif
        public List<JoueurEffectifDto> Effectif { get; set; } = new();

        // Stats saison en cours
        public ClassementSimpleDto? Classement { get; set; }

        // 5 derniers matchs
        public List<FormeMatchDto> DerniersMatchs { get; set; } = new();
    }

    public class InfosClubDto
    {
        public string Nom { get; set; } = "";
        public string? Pays { get; set; }
        public string? Ville { get; set; }
        public int? AnneeCreation { get; set; }
        public string? LogoUrl { get; set; }

        // Stade
        public string? StadeNom { get; set; }
        public string? StadeVille { get; set; }
        public int? StadeCapacite { get; set; }
        public string? StadeImage { get; set; }
    }

    public class TropheeDto
    {
        public string Ligue { get; set; } = "";
        public string Pays { get; set; } = "";
        public string Saison { get; set; } = "";
        public string Place { get; set; } = "";
    }

    public class JoueurEffectifDto
    {
        public int ApiId { get; set; }
        public string Nom { get; set; } = "";
        public string? Photo { get; set; }
        public int? Age { get; set; }
        public string? Numero { get; set; }
        public string? Poste { get; set; }
        public string? Nationalite { get; set; }
    }

    public class ClassementSimpleDto
    {
        public int Position { get; set; }
        public int Points { get; set; }
        public int MatchsJoues { get; set; }
        public int Victoires { get; set; }
        public int Nuls { get; set; }
        public int Defaites { get; set; }
        public int ButsPour { get; set; }
        public int ButsContre { get; set; }
        public int DifferenceDesButs { get; set; }
    }

    public class FormeMatchDto
    {
        public int MatchId { get; set; }
        public DateTime DateMatch { get; set; }
        public string EquipeDomicile { get; set; } = "";
        public string EquipeExterieur { get; set; } = "";
        public string? LogoDomicile { get; set; }
        public string? LogoExterieur { get; set; }
        public int? ScoreDomicile { get; set; }
        public int? ScoreExterieur { get; set; }
        public string Resultat { get; set; } = ""; // "V", "N", "D", "?"
        public bool EstDomicile { get; set; }
    }
}
