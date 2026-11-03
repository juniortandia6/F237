using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AjoutColonnesGroupeClassement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Classements",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Groupe",
                table: "Classements",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrdreGroupe",
                table: "Classements",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Classements");

            migrationBuilder.DropColumn(
                name: "Groupe",
                table: "Classements");

            migrationBuilder.DropColumn(
                name: "OrdreGroupe",
                table: "Classements");
        }
    }
}
