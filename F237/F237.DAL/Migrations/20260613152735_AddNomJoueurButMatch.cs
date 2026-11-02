using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddNomJoueurButMatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ButsMatch_Joueurs_JoueurId",
                table: "ButsMatch");

            migrationBuilder.AlterColumn<int>(
                name: "JoueurId",
                table: "ButsMatch",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ApiJoueurId",
                table: "ButsMatch",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "EstPenalty",
                table: "ButsMatch",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "NomEquipe",
                table: "ButsMatch",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomJoueur",
                table: "ButsMatch",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_ButsMatch_Joueurs_JoueurId",
                table: "ButsMatch",
                column: "JoueurId",
                principalTable: "Joueurs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ButsMatch_Joueurs_JoueurId",
                table: "ButsMatch");

            migrationBuilder.DropColumn(
                name: "ApiJoueurId",
                table: "ButsMatch");

            migrationBuilder.DropColumn(
                name: "EstPenalty",
                table: "ButsMatch");

            migrationBuilder.DropColumn(
                name: "NomEquipe",
                table: "ButsMatch");

            migrationBuilder.DropColumn(
                name: "NomJoueur",
                table: "ButsMatch");

            migrationBuilder.AlterColumn<int>(
                name: "JoueurId",
                table: "ButsMatch",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ButsMatch_Joueurs_JoueurId",
                table: "ButsMatch",
                column: "JoueurId",
                principalTable: "Joueurs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
