using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmerConsumerAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixIsActiveDefaultAndBackfill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            // Backfill users that were unintentionally set inactive by the previous default.
            migrationBuilder.Sql("UPDATE [Users] SET [IsActive] = 1 WHERE [IsActive] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);
        }
    }
}
