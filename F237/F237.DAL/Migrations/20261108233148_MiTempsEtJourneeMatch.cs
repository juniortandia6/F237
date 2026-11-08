using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class MiTempsEtJourneeMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Journee",
                table: "Matchs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ScoreMiTempsDomicile",
                table: "Matchs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ScoreMiTempsExterieur",
                table: "Matchs",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Journee",
                table: "Matchs");

            migrationBuilder.DropColumn(
                name: "ScoreMiTempsDomicile",
                table: "Matchs");

            migrationBuilder.DropColumn(
                name: "ScoreMiTempsExterieur",
                table: "Matchs");
        }
    }
}
