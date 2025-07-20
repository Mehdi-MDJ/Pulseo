const { Database } = require('better-sqlite3');
const path = require('path');

// Connexion à la base de données
const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new Database(dbPath);

console.log('🔧 Test de création de candidature et génération de contrat');

try {
  // 1. Créer un utilisateur infirmier
  console.log('1. Création utilisateur infirmier...');
  const nurseUser = db.prepare(`
    INSERT INTO users (id, email, firstName, lastName, role, cguAccepted, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'user-marie-candidat',
    'marie.candidat@test.fr',
    'Marie',
    'Candidat',
    'nurse',
    true,
    new Date().toISOString()
  );
  console.log('✅ Utilisateur infirmier créé');

  // 2. Créer un profil infirmier
  console.log('2. Création profil infirmier...');
  const nurseProfile = db.prepare(`
    INSERT INTO nurseProfiles (userId, firstName, lastName, specializations, experience, hourlyRateMin, hourlyRateMax, address, city, postalCode, phone, certifications, isAvailable, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'user-marie-candidat',
    'Marie',
    'Candidat',
    JSON.stringify(['cardiology']),
    5,
    25,
    35,
    'Paris',
    'Paris',
    '75001',
    '06 12 34 56 78',
    JSON.stringify(['Diplôme d\'État infirmier']),
    true,
    new Date().toISOString()
  );
  console.log('✅ Profil infirmier créé');

  // 3. Créer une candidature
  console.log('3. Création candidature...');
  const application = db.prepare(`
    INSERT INTO missionApplications (missionId, nurseId, status, coverLetter, appliedAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    1, // missionId
    nurseProfile.lastInsertRowid, // nurseId
    'pending',
    'Je suis très intéressée par cette mission en cardiologie. J\'ai 5 ans d\'expérience et je suis disponible immédiatement.',
    new Date().toISOString(),
    new Date().toISOString(),
    new Date().toISOString()
  );
  console.log('✅ Candidature créée avec ID:', application.lastInsertRowid);

  // 4. Accepter la candidature
  console.log('4. Acceptation de la candidature...');
  const updatedApplication = db.prepare(`
    UPDATE missionApplications
    SET status = ?, updatedAt = ?
    WHERE id = ?
  `).run('accepted', new Date().toISOString(), application.lastInsertRowid);
  console.log('✅ Candidature acceptée');

  // 5. Créer un contrat
  console.log('5. Création du contrat...');
  const contract = db.prepare(`
    INSERT INTO contracts (
      missionId, nurseId, establishmentId, contractNumber, title,
      startDate, endDate, hourlyRate, totalHours, totalAmount,
      contractContent, status, generatedAt, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    1, // missionId
    nurseProfile.lastInsertRowid, // nurseId
    2, // establishmentId (profil établissement existant)
    `CONTRACT-${Date.now()}`, // contractNumber
    'Contrat Mission Test Contrat', // title
    new Date('2025-07-15').getTime(), // startDate
    new Date('2025-07-20').getTime(), // endDate
    26, // hourlyRate
    40, // totalHours (5 jours * 8h)
    1040, // totalAmount (40h * 26€)
    JSON.stringify({
      terms: {
        hourlyRate: 26,
        startDate: '2025-07-15',
        endDate: '2025-07-20',
        shift: 'day',
        location: 'Paris',
        responsibilities: ['Soins infirmiers en cardiologie', 'Surveillance des patients'],
        requirements: ['Diplôme d\'État infirmier', 'Formation en cardiologie']
      },
      legalClauses: {
        confidentiality: true,
        insurance: true,
        compliance: true
      },
      signatures: {}
    }), // contractContent
    'generated', // status
    new Date().getTime(), // generatedAt
    new Date().getTime(), // createdAt
    new Date().getTime() // updatedAt
  );
  console.log('✅ Contrat créé avec ID:', contract.lastInsertRowid);

  console.log('\n🎉 Test terminé avec succès !');
  console.log('📋 Résumé:');
  console.log('- Utilisateur infirmier: user-marie-candidat');
  console.log('- Profil infirmier ID:', nurseProfile.lastInsertRowid);
  console.log('- Candidature ID:', application.lastInsertRowid);
  console.log('- Contrat ID:', contract.lastInsertRowid);

} catch (error) {
  console.error('❌ Erreur lors du test:', error.message);
  console.error(error);
} finally {
  db.close();
}
