/**
 * ==============================================================================
 * Script de Correction de Cohérence - NurseLinkAI
 * ==============================================================================
 *
 * Ce script corrige automatiquement les incohérences d'IDs dans la base de données
 * et génère des données de test valides si nécessaire.
 * ==============================================================================
 */

const Database = require('better-sqlite3');

// Connexion à la base de données
const db = new Database('dev.db');

console.log('🔧 SCRIPT DE CORRECTION DE COHÉRENCE - NurseLinkAI');
console.log('=' .repeat(60));

// Fonction pour afficher les actions
function logAction(action, details = '') {
  console.log(`   🔧 ${action}${details ? `: ${details}` : ''}`);
}

// Fonction pour générer un ID unique
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 1. Nettoyage des données orphelines
console.log('\n1️⃣ NETTOYAGE DES DONNÉES ORPHELINES');

// Supprimer les utilisateurs sans profil
const orphanUsers = db.prepare(`
  SELECT u.id, u.email, u.role
  FROM users u
  LEFT JOIN nurse_profiles np ON u.id = np.user_id
  LEFT JOIN establishment_profiles ep ON u.id = ep.user_id
  WHERE np.user_id IS NULL AND ep.user_id IS NULL
`).all();

if (orphanUsers.length > 0) {
  logAction(`Suppression de ${orphanUsers.length} utilisateur(s) orphelin(s)`);
  orphanUsers.forEach(user => {
    db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    logAction(`Supprimé`, `${user.id} (${user.email})`);
  });
}

// Supprimer les profils orphelins
const orphanNurseProfiles = db.prepare(`
  SELECT np.id, np.user_id
  FROM nurse_profiles np
  LEFT JOIN users u ON np.user_id = u.id
  WHERE u.id IS NULL
`).all();

if (orphanNurseProfiles.length > 0) {
  logAction(`Suppression de ${orphanNurseProfiles.length} profil(s) infirmier(s) orphelin(s)`);
  orphanNurseProfiles.forEach(profile => {
    db.prepare('DELETE FROM nurse_profiles WHERE id = ?').run(profile.id);
    logAction(`Supprimé`, `profil infirmier ${profile.user_id}`);
  });
}

const orphanEstablishmentProfiles = db.prepare(`
  SELECT ep.id, ep.user_id
  FROM establishment_profiles ep
  LEFT JOIN users u ON ep.user_id = u.id
  WHERE u.id IS NULL
`).all();

if (orphanEstablishmentProfiles.length > 0) {
  logAction(`Suppression de ${orphanEstablishmentProfiles.length} profil(s) établissement orphelin(s)`);
  orphanEstablishmentProfiles.forEach(profile => {
    db.prepare('DELETE FROM establishment_profiles WHERE id = ?').run(profile.id);
    logAction(`Supprimé`, `profil établissement ${profile.user_id}`);
  });
}

// Supprimer les missions orphelines
const orphanMissions = db.prepare(`
  SELECT m.id, m.title
  FROM missions m
  LEFT JOIN establishment_profiles ep ON m.establishment_id = ep.id
  WHERE ep.id IS NULL
`).all();

if (orphanMissions.length > 0) {
  logAction(`Suppression de ${orphanMissions.length} mission(s) orpheline(s)`);
  orphanMissions.forEach(mission => {
    db.prepare('DELETE FROM missions WHERE id = ?').run(mission.id);
    logAction(`Supprimé`, `mission ${mission.id} (${mission.title})`);
  });
}

// Supprimer les candidatures orphelines
const orphanApplications = db.prepare(`
  SELECT ma.id
  FROM mission_applications ma
  LEFT JOIN missions m ON ma.mission_id = m.id
  LEFT JOIN nurse_profiles np ON ma.nurse_id = np.id
  WHERE m.id IS NULL OR np.id IS NULL
`).all();

if (orphanApplications.length > 0) {
  logAction(`Suppression de ${orphanApplications.length} candidature(s) orpheline(s)`);
  orphanApplications.forEach(app => {
    db.prepare('DELETE FROM mission_applications WHERE id = ?').run(app.id);
    logAction(`Supprimé`, `candidature ${app.id}`);
  });
}

// Supprimer les contrats orphelins
const orphanContracts = db.prepare(`
  SELECT c.id
  FROM contracts c
  LEFT JOIN missions m ON c.mission_id = m.id
  LEFT JOIN users u1 ON c.nurse_id = u1.id
  LEFT JOIN users u2 ON c.establishment_id = u2.id
  WHERE m.id IS NULL OR u1.id IS NULL OR u2.id IS NULL
`).all();

if (orphanContracts.length > 0) {
  logAction(`Suppression de ${orphanContracts.length} contrat(s) orphelin(s)`);
  orphanContracts.forEach(contract => {
    db.prepare('DELETE FROM contracts WHERE id = ?').run(contract.id);
    logAction(`Supprimé`, `contrat ${contract.id}`);
  });
}

// 2. Génération de données de test valides si nécessaire
console.log('\n2️⃣ GÉNÉRATION DE DONNÉES DE TEST');

// Vérifier s'il y a suffisamment d'utilisateurs
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount < 3) {
  logAction('Génération d\'utilisateurs de test supplémentaires');

  const testUsers = [
    { id: 'user-test-nurse-1', email: 'test.nurse1@email.com', firstName: 'Test', lastName: 'Nurse1', role: 'nurse' },
    { id: 'user-test-nurse-2', email: 'test.nurse2@email.com', firstName: 'Test', lastName: 'Nurse2', role: 'nurse' },
    { id: 'user-test-establishment-1', email: 'test.establishment1@email.com', firstName: 'Test', lastName: 'Establishment1', role: 'establishment' }
  ];

  testUsers.forEach(user => {
    try {
      db.prepare(`
        INSERT INTO users (id, email, first_name, last_name, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(user.id, user.email, user.firstName, user.lastName, user.role);
      logAction(`Créé`, `utilisateur ${user.id}`);
    } catch (error) {
      if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') {
        logAction(`Erreur`, `création utilisateur ${user.id}: ${error.message}`);
      }
    }
  });
}

// Vérifier s'il y a suffisamment de missions
const missionCount = db.prepare('SELECT COUNT(*) as count FROM missions').get().count;
if (missionCount < 2) {
  logAction('Génération de missions de test supplémentaires');

  const establishmentProfiles = db.prepare('SELECT id FROM establishment_profiles LIMIT 1').all();
  if (establishmentProfiles.length > 0) {
    const establishmentId = establishmentProfiles[0].id;

    const testMissions = [
      { title: 'Mission Test 1', description: 'Mission de test 1', establishmentId },
      { title: 'Mission Test 2', description: 'Mission de test 2', establishmentId }
    ];

    testMissions.forEach(mission => {
      try {
        db.prepare(`
          INSERT INTO missions (title, description, establishment_id, start_date, end_date, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          mission.title,
          mission.description,
          mission.establishmentId,
          '2025-08-01',
          '2025-08-05',
          'published'
        );
        logAction(`Créé`, `mission ${mission.title}`);
      } catch (error) {
        logAction(`Erreur`, `création mission ${mission.title}: ${error.message}`);
      }
    });
  }
}

// 3. Vérification finale
console.log('\n3️⃣ VÉRIFICATION FINALE');

// Vérifier les contraintes FK
try {
  const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
  if (fkCheck.length === 0) {
    console.log('   ✅ Toutes les contraintes FK sont valides');
  } else {
    console.log('   ❌ Erreurs de contraintes FK restantes:');
    fkCheck.forEach(fk => {
      console.log(`      - ${fk.table}: ${fk.rowid}`);
    });
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification des FK:', error.message);
}

// Statistiques finales
const finalStats = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM nurse_profiles) as nurse_profiles_count,
    (SELECT COUNT(*) FROM establishment_profiles) as establishment_profiles_count,
    (SELECT COUNT(*) FROM missions) as missions_count,
    (SELECT COUNT(*) FROM mission_applications) as applications_count,
    (SELECT COUNT(*) FROM contracts) as contracts_count
`).get();

console.log('\n📊 STATISTIQUES FINALES:');
console.log(`   👥 Utilisateurs: ${finalStats.users_count}`);
console.log(`   👩‍⚕️ Profils infirmiers: ${finalStats.nurse_profiles_count}`);
console.log(`   🏥 Profils établissement: ${finalStats.establishment_profiles_count}`);
console.log(`   📋 Missions: ${finalStats.missions_count}`);
console.log(`   📝 Candidatures: ${finalStats.applications_count}`);
console.log(`   📄 Contrats: ${finalStats.contracts_count}`);

console.log('\n' + '=' .repeat(60));
console.log('✅ Correction terminée avec succès !');

db.close();
