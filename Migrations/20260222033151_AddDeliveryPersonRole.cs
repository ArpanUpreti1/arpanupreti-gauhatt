using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmerConsumerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryPersonRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsAvailableForDelivery",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLocationUpdate",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleNumber",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleType",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryPersonId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DeliveryAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeliveryPersonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DistanceToPickupKm = table.Column<double>(type: "float", nullable: true),
                    DistanceToDeliveryKm = table.Column<double>(type: "float", nullable: true),
                    TotalDistanceKm = table.Column<double>(type: "float", nullable: true),
                    AssignedFromLatitude = table.Column<double>(type: "float", nullable: true),
                    AssignedFromLongitude = table.Column<double>(type: "float", nullable: true),
                    PickupLatitude = table.Column<double>(type: "float", nullable: true),
                    PickupLongitude = table.Column<double>(type: "float", nullable: true),
                    PickupAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DropoffLatitude = table.Column<double>(type: "float", nullable: true),
                    DropoffLongitude = table.Column<double>(type: "float", nullable: true),
                    DropoffAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PickedUpAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryAssignments_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeliveryAssignments_Users_DeliveryPersonId",
                        column: x => x.DeliveryPersonId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_DeliveryPersonId",
                table: "Orders",
                column: "DeliveryPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryAssignments_DeliveryPersonId",
                table: "DeliveryAssignments",
                column: "DeliveryPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryAssignments_OrderId",
                table: "DeliveryAssignments",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryAssignments_Status",
                table: "DeliveryAssignments",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_DeliveryPersonId",
                table: "Orders",
                column: "DeliveryPersonId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_DeliveryPersonId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "DeliveryAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Orders_DeliveryPersonId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "IsAvailableForDelivery",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLocationUpdate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VehicleNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "VehicleType",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeliveryPersonId",
                table: "Orders");
        }
    }
}
