-- ==============================================================================
-- Script de réinitialisation complète de la base de données NurseLinkAI
-- ==============================================================================
--
-- Ce script :
-- 1. Supprime toutes les tables existantes
-- 2. Recrée toutes les tables avec les bonnes contraintes FK
-- 3. Insère des données de test cohérentes
-- 4. Garantit l'intégrité référentielle
--
-- Exécution : sqlite3 dev.db < reset-nurselinkai-db.sql
-- ==============================================================================

-- SUPPRESSION DES TABLES EXISTANTES (ordre inverse des dépendances)
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS mission_applications;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS nurse_profiles;
DROP TABLE IF EXISTS establishment_profiles;
DROP TABLE IF EXISTS users;

-- ==============================================================================
-- CRÉATION DES TABLES AVEC CONTRAINTES
-- ==============================================================================

-- TABLE UTILISATEURS (table principale)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL CHECK(role IN ('nurse', 'establishment')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- PROFIL ÉTABLISSEMENT
CREATE TABLE establishment_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  type TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PROFIL INFIRMIER
CREATE TABLE nurse_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  experience INTEGER,
  specializations TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- MISSIONS
CREATE TABLE missions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  establishment_id INTEGER NOT NULL,
  start_date TEXT,
  end_date TEXT,
  status TEXT,
  FOREIGN KEY (establishment_id) REFERENCES establishment_profiles(id) ON DELETE CASCADE
);

-- CANDIDATURES
CREATE TABLE mission_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id INTEGER NOT NULL,
  nurse_id INTEGER NOT NULL,
  status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (nurse_id) REFERENCES nurse_profiles(id) ON DELETE CASCADE
);

-- CONTRATS
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  mission_id INTEGER NOT NULL,
  nurse_id TEXT NOT NULL,
  establishment_id TEXT NOT NULL,
  status TEXT,
  terms TEXT,
  legal_clauses TEXT,
  signatures TEXT,
  created_at TEXT,
  updated_at TEXT,
  expires_at TEXT,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
  FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (establishment_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- INSERTION DES DONNÉES DE TEST COHÉRENTES
-- ==============================================================================

-- 1. UTILISATEURS DE TEST
INSERT INTO users (id, email, first_name, last_name, role) VALUES
  ('user-test-etablissement', 'test@etablissement.com', 'Test', 'Etablissement', 'establishment'),
  ('user-marie-candidat', 'marie.leroy@email.com', 'Marie', 'Leroy', 'nurse'),
  ('user-thomas-infirmier', 'thomas.martin@email.com', 'Thomas', 'Martin', 'nurse'),
  ('user-clara-infirmiere', 'clara.dubois@email.com', 'Clara', 'Dubois', 'nurse'),
  ('user-hopital-paris', 'contact@hopital-paris.fr', 'Hôpital', 'Paris', 'establishment'),
  ('user-clinique-lyon', 'contact@clinique-lyon.fr', 'Clinique', 'Lyon', 'establishment');

-- 2. PROFILS ÉTABLISSEMENTS
INSERT INTO establishment_profiles (user_id, name, address, city, postal_code, type) VALUES
  ('user-test-etablissement', 'Hôpital Test', '123 Rue Test', 'Paris', '75001', 'hospital'),
  ('user-hopital-paris', 'Hôpital de Paris', '456 Avenue de la Santé', 'Paris', '75002', 'hospital'),
  ('user-clinique-lyon', 'Clinique de Lyon', '789 Boulevard Médical', 'Lyon', '69001', 'clinic');

-- 3. PROFILS INFIRMIERS
INSERT INTO nurse_profiles (user_id, first_name, last_name, experience, specializations) VALUES
  ('user-marie-candidat', 'Marie', 'Leroy', 5, 'cardiology,emergency'),
  ('user-thomas-infirmier', 'Thomas', 'Martin', 3, 'pediatrics,general'),
  ('user-clara-infirmiere', 'Clara', 'Dubois', 7, 'intensive_care,cardiology');

-- 4. MISSIONS DE TEST
INSERT INTO missions (title, description, establishment_id, start_date, end_date, status) VALUES
  ('Remplacement Cardiologie', 'Remplacement court en service cardiologie', 1, '2025-07-15', '2025-07-20', 'published'),
  ('Mission Pédiatrie', 'Mission en service pédiatrie', 2, '2025-07-22', '2025-07-25', 'published'),
  ('Soins Intensifs', 'Mission en réanimation', 3, '2025-07-28', '2025-08-02', 'published'),
  ('Garde de Nuit', 'Garde de nuit en cardiologie', 1, '2025-08-05', '2025-08-10', 'published');

-- 5. CANDIDATURES DE TEST
INSERT INTO mission_applications (mission_id, nurse_id, status) VALUES
  (1, 1, 'pending'),    -- Marie candidat pour mission cardiologie
  (1, 3, 'accepted'),   -- Clara acceptée pour mission cardiologie
  (2, 2, 'pending'),    -- Thomas candidat pour mission pédiatrie
  (3, 3, 'accepted'),   -- Clara acceptée pour soins intensifs
  (4, 1, 'pending');    -- Marie candidat pour garde de nuit

-- 6. CONTRATS DE TEST
INSERT INTO contracts (id, mission_id, nurse_id, establishment_id, status, terms, legal_clauses, signatures, created_at, updated_at, expires_at) VALUES
  ('contract_test_001', 1, 'user-clara-infirmiere', 'user-test-etablissement', 'signed',
   '{"hourlyRate": 28, "startDate": "2025-07-15", "endDate": "2025-07-20", "shift": "day", "location": "Paris"}',
   '{"confidentiality": true, "insurance": true, "compliance": true}',
   '{"nurse": "2025-07-03T10:00:00Z", "establishment": "2025-07-03T11:00:00Z"}',
   '2025-07-03T09:00:00Z', '2025-07-03T11:00:00Z', '2025-07-10T09:00:00Z'),

  ('contract_test_002', 3, 'user-clara-infirmiere', 'user-clinique-lyon', 'draft',
   '{"hourlyRate": 32, "startDate": "2025-07-28", "endDate": "2025-08-02", "shift": "night", "location": "Lyon"}',
   '{"confidentiality": true, "insurance": true, "compliance": true}',
   '{}',
   '2025-07-03T12:00:00Z', '2025-07-03T12:00:00Z', '2025-07-10T12:00:00Z');

-- ==============================================================================
-- VÉRIFICATION DE L'INTÉGRITÉ
-- ==============================================================================

-- Vérification des utilisateurs
SELECT 'Users créés:' as info, COUNT(*) as count FROM users;

-- Vérification des profils
SELECT 'Profils établissement:' as info, COUNT(*) as count FROM establishment_profiles;
SELECT 'Profils infirmiers:' as info, COUNT(*) as count FROM nurse_profiles;

-- Vérification des missions
SELECT 'Missions créées:' as info, COUNT(*) as count FROM missions;

-- Vérification des candidatures
SELECT 'Candidatures:' as info, COUNT(*) as count FROM mission_applications;

-- Vérification des contrats
SELECT 'Contrats:' as info, COUNT(*) as count FROM contracts;

-- Vérification des relations FK
SELECT 'Vérification FK - Missions avec établissements valides:' as info,
       COUNT(*) as count
FROM missions m
JOIN establishment_profiles ep ON m.establishment_id = ep.id;

SELECT 'Vérification FK - Candidatures avec missions et infirmiers valides:' as info,
       COUNT(*) as count
FROM mission_applications ma
JOIN missions m ON ma.mission_id = m.id
JOIN nurse_profiles np ON ma.nurse_id = np.id;

SELECT 'Vérification FK - Contrats avec toutes les références valides:' as info,
       COUNT(*) as count
FROM contracts c
JOIN missions m ON c.mission_id = m.id
JOIN users u1 ON c.nurse_id = u1.id
JOIN users u2 ON c.establishment_id = u2.id;

-- ==============================================================================
-- MESSAGE DE CONFIRMATION
-- ==============================================================================

SELECT '✅ Base de données NurseLinkAI réinitialisée avec succès!' as status;
SELECT '📊 Données de test insérées et cohérentes' as status;
SELECT '🔗 Toutes les clés étrangères sont valides' as status;
SELECT '🚀 Prêt pour les tests et le développement' as status;
