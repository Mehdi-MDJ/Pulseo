/**
 * ==============================================================================
 * Audit de Cohérence des IDs - NurseLinkAI
 * ==============================================================================
 *
 * Ce script vérifie la cohérence des IDs et des relations FK dans toute la base
 * de données pour s'assurer qu'il n'y a pas de données orphelines ou incohérentes.
 * ==============================================================================
 */

const Database = require('better-sqlite3');

// Connexion à la base de données
const db = new Database('dev.db');

console.log('🔍 AUDIT DE COHÉRENCE DES IDs - NurseLinkAI');
console.log('=' .repeat(60));

// Fonction pour afficher les résultats
function displayResults(title, results, isError = false) {
  console.log(`\n📋 ${title}:`);
  if (results.length === 0) {
    console.log('   ✅ Aucun problème détecté');
  } else {
    results.forEach((result, index) => {
      const prefix = isError ? '❌' : '⚠️';
      console.log(`   ${prefix} ${result}`);
    });
  }
}

// 1. Vérification des utilisateurs orphelins
console.log('\n1️⃣ VÉRIFICATION DES UTILISATEURS');
const orphanUsers = db.prepare(`
  SELECT u.id, u.email, u.role
  FROM users u
  LEFT JOIN nurse_profiles np ON u.id = np.user_id
  LEFT JOIN establishment_profiles ep ON u.id = ep.user_id
  WHERE np.user_id IS NULL AND ep.user_id IS NULL
`).all();

displayResults('Utilisateurs sans profil', orphanUsers.map(u => `${u.id} (${u.email}) - ${u.role}`));

// 2. Vérification des profils infirmiers orphelins
console.log('\n2️⃣ VÉRIFICATION DES PROFILS INFIRMIERS');
const orphanNurseProfiles = db.prepare(`
  SELECT np.id, np.user_id, np.first_name, np.last_name
  FROM nurse_profiles np
  LEFT JOIN users u ON np.user_id = u.id
  WHERE u.id IS NULL
`).all();

displayResults('Profils infirmiers orphelins', orphanNurseProfiles.map(p => `${p.user_id} (${p.first_name} ${p.last_name})`));

// 3. Vérification des profils établissement orphelins
console.log('\n3️⃣ VÉRIFICATION DES PROFILS ÉTABLISSEMENT');
const orphanEstablishmentProfiles = db.prepare(`
  SELECT ep.id, ep.user_id, ep.name
  FROM establishment_profiles ep
  LEFT JOIN users u ON ep.user_id = u.id
  WHERE u.id IS NULL
`).all();

displayResults('Profils établissement orphelins', orphanEstablishmentProfiles.map(p => `${p.user_id} (${p.name})`));

// 4. Vérification des missions orphelines
console.log('\n4️⃣ VÉRIFICATION DES MISSIONS');
const orphanMissions = db.prepare(`
  SELECT m.id, m.title, m.establishment_id
  FROM missions m
  LEFT JOIN establishment_profiles ep ON m.establishment_id = ep.id
  WHERE ep.id IS NULL
`).all();

displayResults('Missions orphelines', orphanMissions.map(m => `ID: ${m.id} - ${m.title} (établissement: ${m.establishment_id})`));

// 5. Vérification des candidatures orphelines
console.log('\n5️⃣ VÉRIFICATION DES CANDIDATURES');
const orphanApplications = db.prepare(`
  SELECT ma.id, ma.mission_id, ma.nurse_id
  FROM mission_applications ma
  LEFT JOIN missions m ON ma.mission_id = m.id
  LEFT JOIN nurse_profiles np ON ma.nurse_id = np.id
  WHERE m.id IS NULL OR np.id IS NULL
`).all();

displayResults('Candidatures orphelines', orphanApplications.map(a => `ID: ${a.id} - Mission: ${a.mission_id}, Infirmier: ${a.nurse_id}`));

// 6. Vérification des contrats orphelins
console.log('\n6️⃣ VÉRIFICATION DES CONTRATS');
const orphanContracts = db.prepare(`
  SELECT c.id, c.mission_id, c.nurse_id, c.establishment_id
  FROM contracts c
  LEFT JOIN missions m ON c.mission_id = m.id
  LEFT JOIN users u1 ON c.nurse_id = u1.id
  LEFT JOIN users u2 ON c.establishment_id = u2.id
  WHERE m.id IS NULL OR u1.id IS NULL OR u2.id IS NULL
`).all();

displayResults('Contrats orphelins', orphanContracts.map(c => `ID: ${c.id} - Mission: ${c.mission_id}, Infirmier: ${c.nurse_id}, Établissement: ${c.establishment_id}`));

// 7. Statistiques générales
console.log('\n7️⃣ STATISTIQUES GÉNÉRALES');
const stats = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM nurse_profiles) as nurse_profiles_count,
    (SELECT COUNT(*) FROM establishment_profiles) as establishment_profiles_count,
    (SELECT COUNT(*) FROM missions) as missions_count,
    (SELECT COUNT(*) FROM mission_applications) as applications_count,
    (SELECT COUNT(*) FROM contracts) as contracts_count
`).get();

console.log(`   👥 Utilisateurs: ${stats.users_count}`);
console.log(`   👩‍⚕️ Profils infirmiers: ${stats.nurse_profiles_count}`);
console.log(`   🏥 Profils établissement: ${stats.establishment_profiles_count}`);
console.log(`   📋 Missions: ${stats.missions_count}`);
console.log(`   📝 Candidatures: ${stats.applications_count}`);
console.log(`   📄 Contrats: ${stats.contracts_count}`);

// 8. Vérification des types d'IDs
console.log('\n8️⃣ VÉRIFICATION DES TYPES D\'IDs');
const idTypes = db.prepare(`
  SELECT
    'users' as table_name, typeof(id) as id_type, COUNT(*) as count
  FROM users
  GROUP BY typeof(id)
  UNION ALL
  SELECT
    'missions' as table_name, typeof(id) as id_type, COUNT(*) as count
  FROM missions
  GROUP BY typeof(id)
  UNION ALL
  SELECT
    'contracts' as table_name, typeof(id) as id_type, COUNT(*) as count
  FROM contracts
  GROUP BY typeof(id)
`).all();

displayResults('Types d\'IDs par table', idTypes.map(t => `${t.table_name}: ${t.id_type} (${t.count} enregistrements)`));

// 9. Vérification des contraintes FK
console.log('\n9️⃣ VÉRIFICATION DES CONTRAINTES FK');
try {
  const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
  if (fkCheck.length === 0) {
    console.log('   ✅ Toutes les contraintes FK sont valides');
  } else {
    displayResults('Erreurs de contraintes FK', fkCheck.map(fk => `${fk.table}: ${fk.rowid}`), true);
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification des FK:', error.message);
}

// 10. Recommandations
console.log('\n🔧 RECOMMANDATIONS');
const totalIssues = orphanUsers.length + orphanNurseProfiles.length + orphanEstablishmentProfiles.length +
                   orphanMissions.length + orphanApplications.length + orphanContracts.length;

if (totalIssues === 0) {
  console.log('   ✅ Base de données en excellent état !');
  console.log('   ✅ Tous les IDs sont cohérents');
  console.log('   ✅ Aucune donnée orpheline détectée');
} else {
  console.log(`   ⚠️ ${totalIssues} problème(s) détecté(s)`);
  console.log('   🔧 Actions recommandées:');
  if (orphanUsers.length > 0) {
    console.log('      - Supprimer les utilisateurs sans profil ou créer leurs profils');
  }
  if (orphanNurseProfiles.length > 0 || orphanEstablishmentProfiles.length > 0) {
    console.log('      - Supprimer les profils orphelins ou restaurer les utilisateurs');
  }
  if (orphanMissions.length > 0) {
    console.log('      - Supprimer les missions orphelines ou restaurer les établissements');
  }
  if (orphanApplications.length > 0) {
    console.log('      - Supprimer les candidatures orphelines');
  }
  if (orphanContracts.length > 0) {
    console.log('      - Supprimer les contrats orphelins');
  }
}

console.log('\n' + '=' .repeat(60));
console.log('🏁 Audit terminé');

db.close();
