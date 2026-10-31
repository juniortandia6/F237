using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AjoutRoleUtilisateur : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Utilisateurs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Role",
                table: "Utilisateurs");
        }
    }
}
