using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class RenameVilleToPays : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Ville",
                table: "Equipes",
                newName: "Pays");

            migrationBuilder.AddColumn<int>(
                name: "ApiFootballId",
                table: "Matchs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApiFootballId",
                table: "Matchs");

            migrationBuilder.RenameColumn(
                name: "Pays",
                table: "Equipes",
                newName: "Ville");
        }
    }
}
