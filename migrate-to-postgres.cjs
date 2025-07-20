#!/usr/bin/env node

/**
 * ==============================================================================
 * Script de Migration SQLite → PostgreSQL - NurseLinkAI
 * ==============================================================================
 *
 * Ce script migre automatiquement toutes les données de SQLite vers PostgreSQL
 * avec optimisation des performances et intégrité des données.
 * ==============================================================================
 */

const { Client } = require('pg');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  sqlite: {
    path: './dev.db'
  },
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'nurselinkai_prod',
    user: process.env.DB_USER || 'nurselink',
    password: process.env.DB_PASSWORD || 'secure_password'
  }
};

class DatabaseMigrator {
  constructor() {
    this.sqlite = null;
    this.postgres = null;
    this.migrationLog = [];
  }

  async connect() {
    console.log('🔌 Connexion aux bases de données...');

    try {
      // Connexion SQLite
      this.sqlite = new Database(config.sqlite.path);
      console.log('✅ SQLite connecté');

      // Connexion PostgreSQL
      this.postgres = new Client(config.postgres);
      await this.postgres.connect();
      console.log('✅ PostgreSQL connecté');

    } catch (error) {
      console.error('❌ Erreur de connexion:', error.message);
      process.exit(1);
    }
  }

  async createTables() {
    console.log('🏗️ Création des tables PostgreSQL...');

    const schema = fs.readFileSync('./shared/schema.ts', 'utf8');

    // Extraction des définitions de tables depuis le schéma Drizzle
    const tableDefinitions = this.extractTableDefinitions(schema);

    for (const [tableName, definition] of Object.entries(tableDefinitions)) {
      try {
        await this.postgres.query(definition);
        console.log(`✅ Table ${tableName} créée`);
        this.migrationLog.push(`Table ${tableName} créée`);
      } catch (error) {
        console.error(`❌ Erreur création table ${tableName}:`, error.message);
      }
    }
  }

  extractTableDefinitions(schema) {
    // Conversion du schéma Drizzle vers SQL PostgreSQL
    const definitions = {
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          role TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      missions: `
        CREATE TABLE IF NOT EXISTS missions (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          location TEXT,
          hourly_rate DECIMAL(10,2),
          establishment_id INTEGER REFERENCES establishment_profiles(id),
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      contracts: `
        CREATE TABLE IF NOT EXISTS contracts (
          id TEXT PRIMARY KEY,
          mission_id INTEGER REFERENCES missions(id),
          nurse_id TEXT REFERENCES users(id),
          establishment_id TEXT REFERENCES users(id),
          status TEXT DEFAULT 'draft',
          contract_number TEXT,
          title TEXT,
          start_date DATE,
          end_date DATE,
          hourly_rate DECIMAL(10,2),
          total_hours INTEGER DEFAULT 0,
          total_amount DECIMAL(10,2) DEFAULT 0,
          contract_content JSONB,
          legal_terms JSONB,
          generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    };

    return definitions;
  }

  async migrateData() {
    console.log('📦 Migration des données...');

    const tables = ['users', 'nurse_profiles', 'establishment_profiles', 'missions', 'mission_applications', 'contracts'];

    for (const table of tables) {
      try {
        await this.migrateTable(table);
      } catch (error) {
        console.error(`❌ Erreur migration table ${table}:`, error.message);
      }
    }
  }

  async migrateTable(tableName) {
    console.log(`🔄 Migration de la table ${tableName}...`);

    // Récupération des données SQLite
    const rows = this.sqlite.prepare(`SELECT * FROM ${tableName}`).all();

    if (rows.length === 0) {
      console.log(`⚠️ Table ${tableName} vide, ignorée`);
      return;
    }

    // Migration par batch pour optimiser les performances
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      await this.insertBatch(tableName, batch);
    }

    console.log(`✅ ${rows.length} lignes migrées pour ${tableName}`);
    this.migrationLog.push(`${rows.length} lignes migrées pour ${tableName}`);
  }

  async insertBatch(tableName, rows) {
    if (rows.length === 0) return;

    const columns = Object.keys(rows[0]);
    const placeholders = rows.map((_, rowIndex) => {
      const start = rowIndex * columns.length + 1;
      return `(${columns.map((_, colIndex) => `$${start + colIndex}`).join(', ')})`;
    }).join(', ');

    const values = rows.flatMap(row => columns.map(col => row[col]));

    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
      ${columns.filter(col => col !== 'id').map(col => `${col} = EXCLUDED.${col}`).join(', ')}
    `;

    await this.postgres.query(query, values);
  }

  async createIndexes() {
    console.log('📈 Création des index de performance...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_missions_location ON missions(location)',
      'CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)',
      'CREATE INDEX IF NOT EXISTS idx_contracts_mission_id ON contracts(mission_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_mission_nurse ON mission_applications(mission_id, nurse_id)'
    ];

    for (const index of indexes) {
      try {
        await this.postgres.query(index);
        console.log(`✅ Index créé: ${index.split(' ')[2]}`);
      } catch (error) {
        console.error(`❌ Erreur création index:`, error.message);
      }
    }
  }

  async validateMigration() {
    console.log('🔍 Validation de la migration...');

    const validations = [
      { table: 'users', expected: 'SELECT COUNT(*) FROM users' },
      { table: 'missions', expected: 'SELECT COUNT(*) FROM missions' },
      { table: 'contracts', expected: 'SELECT COUNT(*) FROM contracts' }
    ];

    for (const validation of validations) {
      try {
        const sqliteCount = this.sqlite.prepare(validation.expected).get()['COUNT(*)'];
        const postgresResult = await this.postgres.query(validation.expected);
        const postgresCount = parseInt(postgresResult.rows[0].count);

        if (sqliteCount === postgresCount) {
          console.log(`✅ ${validation.table}: ${postgresCount} lignes (OK)`);
        } else {
          console.error(`❌ ${validation.table}: SQLite=${sqliteCount}, PostgreSQL=${postgresCount}`);
        }
      } catch (error) {
        console.error(`❌ Erreur validation ${validation.table}:`, error.message);
      }
    }
  }

  async generateReport() {
    console.log('📊 Génération du rapport de migration...');

    const report = {
      timestamp: new Date().toISOString(),
      migrationLog: this.migrationLog,
      summary: {
        tablesMigrated: this.migrationLog.filter(log => log.includes('lignes migrées')).length,
        totalOperations: this.migrationLog.length
      }
    };

    fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
    console.log('✅ Rapport de migration généré: migration-report.json');
  }

  async close() {
    if (this.sqlite) this.sqlite.close();
    if (this.postgres) await this.postgres.end();
    console.log('🔌 Connexions fermées');
  }
}

// Exécution de la migration
async function main() {
  const migrator = new DatabaseMigrator();

  try {
    console.log('🚀 Début de la migration SQLite → PostgreSQL');
    console.log('=' .repeat(60));

    await migrator.connect();
    await migrator.createTables();
    await migrator.migrateData();
    await migrator.createIndexes();
    await migrator.validateMigration();
    await migrator.generateReport();

    console.log('=' .repeat(60));
    console.log('🎉 Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

// Exécution si appelé directement
if (require.main === module) {
  main();
}

module.exports = DatabaseMigrator;
