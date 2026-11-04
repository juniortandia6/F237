using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace F237.API.Json
{
    // Toutes les dates de la base sont en UTC. SQL Server ne garde pas cette
    // information : sans ce convertisseur, l'API renverrait "2026-11-04T14:30:00"
    // (sans fuseau) et chaque navigateur la prendrait pour son heure locale.
    // Avec lui, l'API renvoie "2026-11-04T14:30:00Z" et le navigateur affiche
    // la bonne heure dans le fuseau de la personne (15:30 au Cameroun, 09:30 à Montréal...).
    public class DateTimeUtcConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var date = reader.GetDateTime();
            return date.Kind switch
            {
                DateTimeKind.Utc => date,
                DateTimeKind.Local => date.ToUniversalTime(),
                _ => DateTime.SpecifyKind(date, DateTimeKind.Utc),
            };
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            var utc = value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
            };
            writer.WriteStringValue(utc.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture));
        }
    }
}