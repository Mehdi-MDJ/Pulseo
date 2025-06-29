#!/usr/bin/env node

/**
 * Script de test pour valider les corrections apportées à NurseLink AI
 * Teste l'authentification, les routes API, la gestion d'erreurs, etc.
 */

const BASE_URL = 'http://localhost:3000/api';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, success, details = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    let data;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log('🧪 DÉBUT DES TESTS - VALIDATION DES CORRECTIONS', 'bold');
  log('='.repeat(60), 'blue');

  let sessionToken = null;
  let testResults = [];

  // Test 1: Connexion avec authentification améliorée
  log('\n🔐 Test 1: Authentification sécurisée', 'bold');

  const loginResult = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'simon@gmail.com',
      password: 'password123'
    })
  });

  if (loginResult.success && (loginResult.data.sessionToken || (loginResult.data.data && loginResult.data.data.sessionToken))) {
    sessionToken = loginResult.data.sessionToken || (loginResult.data.data && loginResult.data.data.sessionToken);
    logTest('Connexion réussie', true, `Token: ${sessionToken.substring(0, 8)}...`);
    testResults.push({ test: 'Authentification', success: true });
  } else {
    logTest('Connexion échouée', false, loginResult.data?.error || loginResult.data || 'Erreur inconnue');
    testResults.push({ test: 'Authentification', success: false });
  }

  // Test 2: Validation du token
  if (sessionToken) {
    log('\n🔍 Test 2: Validation du token', 'bold');

    const userResult = await makeRequest('/auth/user', {
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    });

    if (userResult.success && (userResult.data.id || (userResult.data.user && userResult.data.user.id))) {
      const email = userResult.data.email || (userResult.data.user && userResult.data.user.email);
      logTest('Token valide', true, `Utilisateur: ${email}`);
      testResults.push({ test: 'Validation Token', success: true });
    } else {
      logTest('Token invalide', false, userResult.data?.error || userResult.data || 'Erreur inconnue');
      testResults.push({ test: 'Validation Token', success: false });
    }
  }

  // Test 3: Gestion d'erreurs améliorée
  log('\n⚠️ Test 3: Gestion d\'erreurs', 'bold');

  // Test avec token invalide
  const invalidTokenResult = await makeRequest('/establishment/stats', {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });

  if (!invalidTokenResult.success && invalidTokenResult.status === 401) {
    logTest('Erreur 401 avec token invalide', true, 'Gestion d\'erreur correcte');
    testResults.push({ test: 'Erreur Token Invalide', success: true });
  } else {
    logTest('Erreur 401 avec token invalide', false, 'Réponse inattendue');
    testResults.push({ test: 'Erreur Token Invalide', success: false });
  }

  // Test sans token
  const noTokenResult = await makeRequest('/establishment/stats');

  if (!noTokenResult.success && noTokenResult.status === 401) {
    logTest('Erreur 401 sans token', true, 'Gestion d\'erreur correcte');
    testResults.push({ test: 'Erreur Sans Token', success: true });
  } else {
    logTest('Erreur 401 sans token', false, 'Réponse inattendue');
    testResults.push({ test: 'Erreur Sans Token', success: false });
  }

  // Test 4: Routes API d'établissement
  if (sessionToken) {
    log('\n🏥 Test 4: Routes API d\'établissement', 'bold');

    const routes = [
      { name: 'Statistiques', endpoint: '/establishment/stats' },
      { name: 'Missions', endpoint: '/establishment/missions' },
      { name: 'Candidatures', endpoint: '/establishment/candidates' },
      { name: 'Templates', endpoint: '/establishment/templates' },
      { name: 'Profil', endpoint: '/establishment/profile' }
    ];

    for (const route of routes) {
      const result = await makeRequest(route.endpoint, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (result.success) {
        logTest(`${route.name} accessible`, true, `Status: ${result.status}`);
        testResults.push({ test: `Route ${route.name}`, success: true });
      } else {
        logTest(`${route.name} inaccessible`, false, `Status: ${result.status} - ${result.data?.error || 'Erreur'}`);
        testResults.push({ test: `Route ${route.name}`, success: false });
      }
    }
  }

  // Test 5: Messages d'erreur informatifs
  log('\n💬 Test 5: Messages d\'erreur', 'bold');

  const errorTests = [
    {
      name: 'Route inexistante',
      endpoint: '/establishment/nonexistent',
      expectedStatus: 404
    },
    {
      name: 'Méthode non autorisée',
      endpoint: '/auth/login',
      method: 'GET',
      expectedStatus: 404
    }
  ];

  for (const errorTest of errorTests) {
    const result = await makeRequest(errorTest.endpoint, {
      method: errorTest.method || 'GET',
      headers: sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
    });

    if (result.status === errorTest.expectedStatus) {
      logTest(errorTest.name, true, `Status attendu: ${errorTest.expectedStatus}`);
      testResults.push({ test: `Erreur ${errorTest.name}`, success: true });
    } else {
      logTest(errorTest.name, false, `Status: ${result.status} (attendu: ${errorTest.expectedStatus})`);
      testResults.push({ test: `Erreur ${errorTest.name}`, success: false });
    }
  }

  // Test 6: Renouvellement de session
  if (sessionToken) {
    log('\n🔄 Test 6: Renouvellement de session', 'bold');
    log(`   Token utilisé: ${sessionToken.substring(0, 8)}...`, 'yellow');

    const refreshResult = await makeRequest('/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sessionToken}` }
    });

    if (refreshResult.success && (refreshResult.data.sessionToken || refreshResult.data.token)) {
      const newToken = refreshResult.data.sessionToken || refreshResult.data.token;
      logTest('Renouvellement réussi', true, 'Nouveau token généré');
      sessionToken = newToken;
      testResults.push({ test: 'Renouvellement Session', success: true });
    } else {
      logTest('Renouvellement échoué', false, refreshResult.data?.error || 'Erreur inconnue');
      testResults.push({ test: 'Renouvellement Session', success: false });
    }
  }

  // Résumé des tests
  log('\n📊 RÉSUMÉ DES TESTS', 'bold');
  log('=' * 60, 'blue');

  const successfulTests = testResults.filter(r => r.success).length;
  const totalTests = testResults.length;
  const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

  log(`Tests réussis: ${successfulTests}/${totalTests} (${successRate}%)`, successfulTests === totalTests ? 'green' : 'yellow');

  if (successfulTests === totalTests) {
    log('\n🎉 TOUTES LES CORRECTIONS SONT VALIDÉES !', 'green');
    log('✅ Authentification sécurisée', 'green');
    log('✅ Gestion d\'erreurs améliorée', 'green');
    log('✅ Routes API fonctionnelles', 'green');
    log('✅ Messages d\'erreur informatifs', 'green');
    log('✅ Renouvellement de session', 'green');
  } else {
    log('\n⚠️ CERTAINES CORRECTIONS NÉCESSITENT UNE ATTENTION', 'yellow');
    const failedTests = testResults.filter(r => !r.success);
    failedTests.forEach(test => {
      log(`❌ ${test.test}`, 'red');
    });
  }

  log('\n🏁 FIN DES TESTS', 'bold');
}

// Exécution des tests
runTests().catch(error => {
  log(`\n💥 Erreur lors de l'exécution des tests: ${error.message}`, 'red');
  process.exit(1);
});
