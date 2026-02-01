using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmerConsumerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmerApprovalStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovalDate",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedByAdminId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApprovedByAdminId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Users");
        }
    }
}
