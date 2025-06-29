/**
 * ==============================================================================
 * NurseLink AI - Routes de Test pour Démonstration Contrats
 * ==============================================================================
 * 
 * Routes spécifiques pour la démonstration du système de contrats automatiques
 * ==============================================================================
 */

import { Router } from "express";

const router = Router();

// Route pour créer une mission de test
router.post("/create-mission", async (req, res) => {
  try {
    const missionData = {
      establishmentId: 1,
      title: req.body.title || "Mission de test - Réanimation",
      description: req.body.description || "Mission de démonstration pour les contrats automatiques",
      specialization: req.body.specialization || "Réanimation",
      shift: req.body.shift || "nuit",
      hourlyRate: req.body.hourlyRate || 30,
      startDate: new Date(req.body.startDate || Date.now() + 86400000),
      endDate: new Date(req.body.endDate || Date.now() + (7 * 86400000)),
      status: "published"
    };

    const mission = { id: Math.floor(Math.random() * 1000), ...missionData };
    res.json(mission);
  } catch (error) {
    console.error("Erreur création mission test:", error);
    res.status(500).json({ error: "Erreur lors de la création de la mission de test" });
  }
});

// Route pour créer une candidature de test
router.post("/create-application", async (req, res) => {
  try {
    const applicationData = {
      id: Math.floor(Math.random() * 1000),
      missionId: req.body.missionId,
      nurseId: req.body.nurseId || "test-nurse-1",
      status: "pending",
      appliedAt: new Date()
    };

    res.json(applicationData);
  } catch (error) {
    console.error("Erreur création candidature test:", error);
    res.status(500).json({ error: "Erreur lors de la création de la candidature de test" });
  }
});

// Route pour accepter une candidature et générer un contrat
router.post("/accept-application", async (req, res) => {
  try {
    const applicationId = req.body.applicationId;
    
    const contractNumber = `CT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
    
    const contract = {
      id: Math.floor(Math.random() * 1000),
      contractNumber,
      title: "Contrat de mission - Réanimation",
      status: "generated",
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + (7 * 86400000)).toISOString(),
      hourlyRate: "30.00",
      totalHours: "168.00",
      totalAmount: "5040.00",
      generatedAt: new Date().toISOString(),
      contractContent: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="text-align: center; color: #2563eb;">CONTRAT DE MISSION TEMPORAIRE</h1>
          <h2 style="text-align: center;">CHU Lyon Test</h2>
          <p style="text-align: center;"><strong>Contrat N° ${contractNumber}</strong></p>
          
          <h3>Article 1 - Parties contractantes</h3>
          <p><strong>L'ÉTABLISSEMENT :</strong> CHU Lyon Test</p>
          <p><strong>L'INFIRMIER(E) :</strong> Marie Dupont Test</p>
          
          <h3>Article 2 - Objet de la mission</h3>
          <p><strong>Intitulé :</strong> Mission de test - Réanimation</p>
          <p><strong>Spécialisation :</strong> Réanimation</p>
          <p><strong>Service :</strong> Réanimation polyvalente</p>
          
          <h3>Article 3 - Durée de la mission</h3>
          <p><strong>Date de début :</strong> ${new Date(Date.now() + 86400000).toLocaleDateString('fr-FR')}</p>
          <p><strong>Date de fin :</strong> ${new Date(Date.now() + (7 * 86400000)).toLocaleDateString('fr-FR')}</p>
          <p><strong>Poste :</strong> Nuit</p>
          
          <h3>Article 4 - Rémunération</h3>
          <p><strong>Taux horaire :</strong> 30,00 € / heure</p>
          <p><strong>Volume horaire estimé :</strong> 168 heures</p>
          <p><strong>Montant total brut estimé :</strong> 5 040,00 €</p>
          
          <h3>Article 5 - Obligations</h3>
          <p>L'infirmier(e) s'engage à respecter les protocoles de soins de l'établissement et à maintenir la confidentialité des informations médicales.</p>
          
          <h3>Article 6 - Signatures électroniques</h3>
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div>
              <p><strong>L'ÉTABLISSEMENT</strong></p>
              <p>CHU Lyon Test</p>
              <p>_________________</p>
            </div>
            <div>
              <p><strong>L'INFIRMIER(E)</strong></p>
              <p>Marie Dupont Test</p>
              <p>_________________</p>
            </div>
          </div>
          
          <p style="margin-top: 40px; text-align: center; font-style: italic; color: #666;">
            Contrat généré automatiquement par NurseLink AI le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      `
    };

    const response = {
      application: { id: applicationId, status: "accepted" },
      contract: contract,
      message: "Candidature acceptée. Un contrat a été généré automatiquement."
    };

    res.json(response);
  } catch (error) {
    console.error("Erreur acceptation candidature test:", error);
    res.status(500).json({ error: "Erreur lors de l'acceptation de la candidature" });
  }
});

export default router;