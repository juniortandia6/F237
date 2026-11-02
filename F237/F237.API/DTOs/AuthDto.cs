// F237.API/DTOs/AuthDto.cs

namespace F237.API.DTOs
{
    public class RegisterDto
    {
        public string Nom { get; set; } = "";
        public string Prenom { get; set; } = "";
        public string Email { get; set; } = "";
        public string MotDePasse { get; set; } = "";
    }

    public class LoginDto
    {
        public string Email { get; set; } = "";
        public string MotDePasse { get; set; } = "";
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = "";
        public string Nom { get; set; } = "";
        public string Prenom { get; set; } = "";
        public string Email { get; set; } = "";
        public int SoldePoints { get; set; }
        public DateTime Expiration { get; set; }
    }

    public class UtilisateurProfilDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = "";
        public string Prenom { get; set; } = "";
        public string Email { get; set; } = "";
        public int SoldePoints { get; set; }
        public DateTime DateInscription { get; set; }
        public int NbParis { get; set; }
        public int NbParisGagnes { get; set; }
        public int TauxReussite { get; set; }
        public int ClassementGeneral { get; set; }
    }
}