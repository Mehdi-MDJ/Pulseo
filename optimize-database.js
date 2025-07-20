/**
 * Script d'optimisation de la base de données SQLite pour MVP
 * Ajoute des index pour améliorer les performances des requêtes fréquentes
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeDatabase() {
  console.log('🚀 Optimisation de la base de données SQLite...');

  const dbPath = path.join(__dirname, 'dev.db');
  const db = new Database(dbPath);

  try {
    // Activer les optimisations SQLite
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 10000');
    db.pragma('temp_store = MEMORY');

    console.log('✅ Optimisations SQLite activées');

    // Index pour les missions (requêtes fréquentes)
    const missionIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status)',
      'CREATE INDEX IF NOT EXISTS idx_missions_establishment ON missions(establishmentId)',
      'CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(createdAt DESC)',
      'CREATE INDEX IF NOT EXISTS idx_missions_location ON missions(location)',
      'CREATE INDEX IF NOT EXISTS idx_missions_service ON missions(service)'
    ];

    // Index pour les contrats
    const contractIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_contracts_nurse ON contracts(nurseId)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_establishment ON contracts(establishmentId)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(createdAt DESC)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_mission ON contracts(missionId)'
    ];

    // Index pour les utilisateurs
    const userIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt DESC)'
    ];

    // Index pour les candidatures
    const applicationIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_applications_mission ON mission_applications(missionId)',
      'CREATE INDEX IF NOT EXISTS idx_applications_nurse ON mission_applications(nurseId)',
      'CREATE INDEX IF NOT EXISTS idx_applications_status ON mission_applications(status)',
      'CREATE INDEX IF NOT EXISTS idx_applications_created_at ON mission_applications(createdAt DESC)'
    ];

    // Index pour les templates
    const templateIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_templates_establishment ON missionTemplates(establishmentId)',
      'CREATE INDEX IF NOT EXISTS idx_templates_created_at ON missionTemplates(createdAt DESC)'
    ];

    const allIndexes = [
      ...missionIndexes,
      ...contractIndexes,
      ...userIndexes,
      ...applicationIndexes,
      ...templateIndexes
    ];

    console.log('📊 Création des index...');

    for (const indexQuery of allIndexes) {
      try {
        db.exec(indexQuery);
        console.log(`✅ Index créé: ${indexQuery.split(' ')[2]}`);
      } catch (error) {
        console.log(`⚠️ Index déjà existant ou erreur: ${indexQuery.split(' ')[2]}`);
      }
    }

    // Analyser les tables pour optimiser les requêtes
    console.log('🔍 Analyse des tables...');
    db.exec('ANALYZE');

    // Vérifier les index créés
    console.log('\n📋 Index existants:');
    const indexes = db.prepare(`
      SELECT name, tbl_name, sql
      FROM sqlite_master
      WHERE type = 'index'
      ORDER BY tbl_name, name
    `).all();

    indexes.forEach(index => {
      console.log(`  - ${index.name} (${index.tbl_name})`);
    });

        // Statistiques de performance
    console.log('\n📊 Statistiques de base de données:');
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM missions) as missions_count,
        (SELECT COUNT(*) FROM contracts) as contracts_count,
        (SELECT COUNT(*) FROM mission_applications) as applications_count,
        (SELECT COUNT(*) FROM mission_templates) as templates_count
    `).get();

    console.log(`  👥 Utilisateurs: ${stats.users_count}`);
    console.log(`  🎯 Missions: ${stats.missions_count}`);
    console.log(`  📄 Contrats: ${stats.contracts_count}`);
    console.log(`  📝 Candidatures: ${stats.applications_count}`);
    console.log(`  📋 Templates: ${stats.templates_count}`);

    // Test de performance
    console.log('\n⚡ Test de performance...');
    const startTime = Date.now();

    // Test requête missions avec index
    const missions = db.prepare(`
      SELECT * FROM missions
      WHERE status = 'published'
      ORDER BY createdAt DESC
      LIMIT 10
    `).all();

    const queryTime = Date.now() - startTime;
    console.log(`  Temps requête missions: ${queryTime}ms`);
    console.log(`  Résultats: ${missions.length} missions`);

    console.log('\n✅ Optimisation terminée avec succès !');
    console.log('🚀 Votre base de données est maintenant optimisée pour de meilleures performances.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error.message);
  } finally {
    db.close();
  }
}

// Exécuter l'optimisation
optimizeDatabase();
