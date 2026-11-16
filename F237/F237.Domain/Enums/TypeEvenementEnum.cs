// F237.Domain/Enums/TypeEvenementEnum.cs
// Événements de match saisis à la main dans l'admin (l'API ne les fournit pas pour l'Elite One/Two).
// Les buts restent dans ButMatch : un événement ne compte JAMAIS dans le score ni au classement des buteurs.
namespace F237.Domain.Enums
{
    public enum TypeEvenementEnum
    {
        PenaltyManque = 1,   // penalty raté ou arrêté
        CartonJaune = 2,     // prévu pour plus tard
        CartonRouge = 3,     // prévu pour plus tard
    }
}