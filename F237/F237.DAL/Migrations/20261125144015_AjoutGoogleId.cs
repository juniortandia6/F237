using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AjoutGoogleId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleId",
                table: "Utilisateurs",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_GoogleId",
                table: "Utilisateurs",
                column: "GoogleId",
                unique: true,
                filter: "[GoogleId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Utilisateurs_GoogleId",
                table: "Utilisateurs");

            migrationBuilder.DropColumn(
                name: "GoogleId",
                table: "Utilisateurs");
        }
    }
}
