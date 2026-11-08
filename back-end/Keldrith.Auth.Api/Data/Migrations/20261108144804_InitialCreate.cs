using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Keldrith.Auth.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Classes",
                columns: table => new
                {
                    ClassId = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Roles = table.Column<string>(type: "TEXT", nullable: false),
                    BaseStats_Attack = table.Column<int>(type: "INTEGER", nullable: false),
                    BaseStats_Defense = table.Column<int>(type: "INTEGER", nullable: false),
                    BaseStats_MaxHp = table.Column<int>(type: "INTEGER", nullable: false),
                    BaseStats_MaxMana = table.Column<int>(type: "INTEGER", nullable: false),
                    BaseStats_Speed = table.Column<int>(type: "INTEGER", nullable: false),
                    StatsPerLevel_Attack = table.Column<int>(type: "INTEGER", nullable: false),
                    StatsPerLevel_Defense = table.Column<int>(type: "INTEGER", nullable: false),
                    StatsPerLevel_MaxHp = table.Column<int>(type: "INTEGER", nullable: false),
                    StatsPerLevel_MaxMana = table.Column<int>(type: "INTEGER", nullable: false),
                    StatsPerLevel_Speed = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Classes", x => x.ClassId);
                });

            migrationBuilder.CreateTable(
                name: "Monsters",
                columns: table => new
                {
                    NpcId = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 30, nullable: false),
                    Level = table.Column<int>(type: "INTEGER", nullable: false),
                    XpReward = table.Column<int>(type: "INTEGER", nullable: false),
                    Stats_Attack = table.Column<int>(type: "INTEGER", nullable: false),
                    Stats_Defense = table.Column<int>(type: "INTEGER", nullable: false),
                    Stats_MaxHp = table.Column<int>(type: "INTEGER", nullable: false),
                    Stats_MaxMana = table.Column<int>(type: "INTEGER", nullable: false),
                    Stats_Speed = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Monsters", x => x.NpcId);
                });

            migrationBuilder.CreateTable(
                name: "MonsterSkills",
                columns: table => new
                {
                    SkillId = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Power = table.Column<int>(type: "INTEGER", nullable: false),
                    ManaCost = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterSkills", x => x.SkillId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    NormalizedUsername = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    NormalizedEmail = table.Column<string>(type: "TEXT", maxLength: 254, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "PlayerSkills",
                columns: table => new
                {
                    SkillId = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    ClassId = table.Column<string>(type: "TEXT", nullable: false),
                    RequiredLevel = table.Column<int>(type: "INTEGER", nullable: false),
                    SkillPointCost = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Power = table.Column<int>(type: "INTEGER", nullable: false),
                    ManaCost = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerSkills", x => x.SkillId);
                    table.ForeignKey(
                        name: "FK_PlayerSkills_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MonsterMonsterSkill",
                columns: table => new
                {
                    MonsterNpcId = table.Column<string>(type: "TEXT", nullable: false),
                    SkillsSkillId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonsterMonsterSkill", x => new { x.MonsterNpcId, x.SkillsSkillId });
                    table.ForeignKey(
                        name: "FK_MonsterMonsterSkill_MonsterSkills_SkillsSkillId",
                        column: x => x.SkillsSkillId,
                        principalTable: "MonsterSkills",
                        principalColumn: "SkillId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MonsterMonsterSkill_Monsters_MonsterNpcId",
                        column: x => x.MonsterNpcId,
                        principalTable: "Monsters",
                        principalColumn: "NpcId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Characters",
                columns: table => new
                {
                    CharacterId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    ClassId = table.Column<string>(type: "TEXT", nullable: false),
                    Level = table.Column<int>(type: "INTEGER", nullable: false),
                    Xp = table.Column<int>(type: "INTEGER", nullable: false),
                    SkillPoints = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Characters", x => x.CharacterId);
                    table.ForeignKey(
                        name: "FK_Characters_Classes_ClassId",
                        column: x => x.ClassId,
                        principalTable: "Classes",
                        principalColumn: "ClassId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Characters_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CharacterPlayerSkill",
                columns: table => new
                {
                    CharacterId = table.Column<int>(type: "INTEGER", nullable: false),
                    LearnedSkillsSkillId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CharacterPlayerSkill", x => new { x.CharacterId, x.LearnedSkillsSkillId });
                    table.ForeignKey(
                        name: "FK_CharacterPlayerSkill_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "CharacterId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CharacterPlayerSkill_PlayerSkills_LearnedSkillsSkillId",
                        column: x => x.LearnedSkillsSkillId,
                        principalTable: "PlayerSkills",
                        principalColumn: "SkillId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CharacterPlayerSkill_LearnedSkillsSkillId",
                table: "CharacterPlayerSkill",
                column: "LearnedSkillsSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_ClassId",
                table: "Characters",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_UserId",
                table: "Characters",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MonsterMonsterSkill_SkillsSkillId",
                table: "MonsterMonsterSkill",
                column: "SkillsSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSkills_ClassId",
                table: "PlayerSkills",
                column: "ClassId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_NormalizedEmail",
                table: "Users",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_NormalizedUsername",
                table: "Users",
                column: "NormalizedUsername",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CharacterPlayerSkill");

            migrationBuilder.DropTable(
                name: "MonsterMonsterSkill");

            migrationBuilder.DropTable(
                name: "Characters");

            migrationBuilder.DropTable(
                name: "PlayerSkills");

            migrationBuilder.DropTable(
                name: "MonsterSkills");

            migrationBuilder.DropTable(
                name: "Monsters");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Classes");
        }
    }
}
