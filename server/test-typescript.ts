// Test TypeScript pour vérifier les types
import { handlers } from "./lib/auth"

// Simulation d'une requête Express
const mockReq = {
  headers: {},
  body: {},
  query: {},
  params: {}
} as any

// Test de la structure de retour de handlers.GET
async function testHandlers() {
  try {
    const response = await handlers.GET(mockReq)
    console.log("✅ handlers.GET retourne:", typeof response)
    console.log("✅ response.body existe:", !!response.body)

    if (response.body?.user) {
      console.log("✅ Session utilisateur trouvée")
    } else {
      console.log("ℹ️ Pas de session utilisateur (normal en test)")
    }
  } catch (error) {
    console.error("❌ Erreur dans handlers.GET:", error)
  }
}

testHandlers()
