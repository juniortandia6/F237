using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace F237.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AjoutArticles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Articles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Tag = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TitreFr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ResumeFr = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: false),
                    ContenuFr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TitreEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ResumeEn = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    ContenuEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EstPublie = table.Column<bool>(type: "bit", nullable: false),
                    ALaUne = table.Column<bool>(type: "bit", nullable: false),
                    DatePublication = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DateModification = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Articles", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Articles_EstPublie_DatePublication",
                table: "Articles",
                columns: new[] { "EstPublie", "DatePublication" });

            migrationBuilder.CreateIndex(
                name: "IX_Articles_Slug",
                table: "Articles",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Articles");
        }
    }
}
