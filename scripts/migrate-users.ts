#!/usr/bin/env tsx

/**
 * ==============================================================================
 * NurseLink AI - Script de Migration Utilisateurs
 * ==============================================================================
 *
 * Migration des utilisateurs de l'ancien système vers NextAuth.js v5 + Prisma
 * Transfert sécurisé des données utilisateurs
 * ==============================================================================
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  errors: number;
}

/**
 * Fonction de migration des utilisateurs
 */
async function migrateUsers(): Promise<MigrationStats> {
  console.log("🔄 Début de la migration des utilisateurs...");

  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Pour l'instant, on crée des utilisateurs de test
    // TODO: Implémenter la vraie migration depuis l'ancienne base

    const testUsers = [
      {
        email: "nurse@nurselink.ai",
        name: "Marie Dubois",
        role: "NURSE" as const,
      },
      {
        email: "establishment@nurselink.ai",
        name: "Hôpital Saint-Joseph",
        role: "ESTABLISHMENT" as const,
      },
      {
        email: "admin@nurselink.ai",
        name: "Administrateur",
        role: "ADMIN" as const,
      },
    ];

    stats.total = testUsers.length;

    for (const testUser of testUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
          where: { email: testUser.email },
        });

        if (existingUser) {
          console.log(`⏭️  Utilisateur ${testUser.email} déjà existant, ignoré`);
          stats.skipped++;
          continue;
        }

        // Créer le nouvel utilisateur
        const newUser = await prisma.user.create({
          data: {
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            emailVerified: new Date(),
          },
        });

        console.log(`✅ Utilisateur créé: ${newUser.email} (${newUser.role})`);
        stats.migrated++;

        // Créer le profil correspondant selon le rôle
        if (newUser.role === "NURSE") {
          await prisma.nurseProfile.create({
            data: {
              userId: newUser.id,
              specializations: ["Urgences", "Cardiologie"],
              experience: 5,
              certifications: ["DEI", "BLS"],
              rating: 4.8,
              missionsCompleted: 127,
              level: 8,
              rank: "Expert",
            },
          });
          console.log(`👨‍⚕️  Profil infirmier créé pour: ${newUser.email}`);
        } else if (newUser.role === "ESTABLISHMENT") {
          await prisma.establishmentProfile.create({
            data: {
              userId: newUser.id,
              name: "Hôpital Saint-Joseph",
              type: "HOSPITAL",
              address: "123 Rue de la Santé, 75001 Paris",
              specialties: ["Cardiologie", "Neurologie", "Pédiatrie"],
              capacity: 500,
              description: "Établissement de santé de référence",
            },
          });
          console.log(`🏥 Profil établissement créé pour: ${newUser.email}`);
        }

      } catch (error) {
        console.error(`❌ Erreur création utilisateur ${testUser.email}:`, error);
        stats.errors++;
      }
    }

    console.log("\n📈 Statistiques de migration:");
    console.log(`   Total: ${stats.total}`);
    console.log(`   Créés: ${stats.migrated}`);
    console.log(`   Ignorés: ${stats.skipped}`);
    console.log(`   Erreurs: ${stats.errors}`);

    return stats;

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fonction de validation de la migration
 */
async function validateMigration(): Promise<void> {
  console.log("\n🔍 Validation de la migration...");

  const newUsers = await prisma.user.findMany({
    include: {
      nurseProfile: true,
      establishmentProfile: true,
    },
  });

  console.log(`✅ ${newUsers.length} utilisateurs dans la base`);

  // Vérifier les profils
  const nurses = newUsers.filter(u => u.role === "NURSE");
  const establishments = newUsers.filter(u => u.role === "ESTABLISHMENT");
  const admins = newUsers.filter(u => u.role === "ADMIN");

  console.log(`👨‍⚕️  Infirmiers: ${nurses.length}`);
  console.log(`🏥 Établissements: ${establishments.length}`);
  console.log(`👑 Admins: ${admins.length}`);

  // Vérifier les profils créés
  const nursesWithProfile = nurses.filter(n => n.nurseProfile);
  const establishmentsWithProfile = establishments.filter(e => e.establishmentProfile);

  console.log(`✅ Profils infirmiers créés: ${nursesWithProfile.length}/${nurses.length}`);
  console.log(`✅ Profils établissements créés: ${establishmentsWithProfile.length}/${establishments.length}`);
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log("🚀 Script de migration NurseLink AI");
    console.log("=====================================");

    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log("✅ Connexion à la base de données établie");

    // Effectuer la migration
    const stats = await migrateUsers();

    // Valider la migration
    await validateMigration();

    if (stats.errors === 0) {
      console.log("\n🎉 Migration terminée avec succès!");
    } else {
      console.log(`\n⚠️  Migration terminée avec ${stats.errors} erreurs`);
    }

  } catch (error) {
    console.error("❌ Erreur fatale lors de la migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
if (require.main === module) {
  main();
}
