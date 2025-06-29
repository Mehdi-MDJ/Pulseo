import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";

// Variables pour simuler l'état de session et les données utilisateur
let isUserLoggedIn = true;
let currentUserData: any = null;
let userSchedule: any[] = [];
let savedProfiles: any[] = [];

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Route de santé du serveur
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NurseLink AI Server is running' });
  });

  // Routes d'authentification simplifiées pour le développement
  app.get('/api/auth/user', (req, res) => {
    if (!isUserLoggedIn) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Retourner les données utilisateur personnalisées si disponibles
    if (currentUserData) {
      return res.json(currentUserData);
    }
    
    // Simuler un utilisateur établissement par défaut pour le développement
    res.json({
      id: 'dev-establishment-1',
      email: 'hopital@nurselink.com',
      firstName: 'Dr. Marie',
      lastName: 'Dubois',
      role: 'establishment',
      cguAccepted: true,
      profile: {
        id: 1,
        name: 'Centre Hospitalier de Lyon',
        type: 'Hôpital public',
        siretNumber: '12345678901234',
        address: '59 Boulevard Pinel, 69500 Bron',
        contactPhone: '+33 4 72 11 20 00',
        contactEmail: 'rh@ch-lyon.fr',
        documentsVerified: true,
        totalBeds: 850,
        departments: ['Urgences', 'Cardiologie', 'Pédiatrie', 'Réanimation', 'Chirurgie'],
        certifications: ['HAS', 'ISO 9001']
      }
    });
  });

  app.post('/api/auth/accept-cgu', (req, res) => {
    const { role } = req.body;
    res.json({ 
      success: true, 
      message: `CGU accepted for role: ${role}` 
    });
  });

  // Routes pour les profils infirmières
  app.get('/api/nurse-profile', (req, res) => {
    res.json({
      id: 1,
      userId: 'dev-user-1',
      rppsNumber: '12345678901',
      adeliNumber: '987654321',
      specialization: 'Soins intensifs',
      experience: 5,
      location: { city: 'Paris', coordinates: [48.8566, 2.3522] },
      available: true,
      hourlyRate: '35',
      skills: ['Réanimation', 'Soins critiques', 'Urgences'],
      bio: 'Infirmière expérimentée en soins intensifs',
      languages: ['fr', 'en'],
      certifications: ['DU Soins intensifs', 'Formation réanimation'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-05-30')
    });
  });

  app.post('/api/nurse-profile', (req, res) => {
    console.log('Creating nurse profile:', req.body);
    res.json({ 
      success: true, 
      message: 'Profil infirmière créé avec succès',
      profile: { id: 1, ...req.body }
    });
  });

  // Routes pour les profils établissements
  app.get('/api/establishment-profile', (req, res) => {
    res.json({
      id: 1,
      userId: 'dev-user-1',
      name: 'Hôpital Général de Paris',
      type: 'Hôpital public',
      siretNumber: '12345678901234',
      address: '123 Rue de la Santé, 75014 Paris',
      contactPerson: 'Dr. Martin',
      contactPhone: '01.23.45.67.89',
      documentsVerified: true
    });
  });

  app.post('/api/establishment-profile', (req, res) => {
    console.log('Creating establishment profile:', req.body);
    res.json({ 
      success: true, 
      message: 'Profil établissement créé avec succès',
      profile: { id: 1, ...req.body }
    });
  });

  // Routes pour les missions
  app.get('/api/missions', (req, res) => {
    const sampleMissions = [
      {
        id: 1,
        title: 'Infirmière de nuit - Service de réanimation',
        establishmentId: 1,
        specialization: 'Soins intensifs',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-15'),
        hourlyRate: '38',
        status: 'open',
        location: { city: 'Paris', coordinates: [48.8566, 2.3522] },
        description: 'Mission de 2 semaines en service de réanimation pour gardes de nuit.',
        requirements: ['5 ans d\'expérience minimum', 'Spécialisation soins intensifs']
      },
      {
        id: 2,
        title: 'Infirmière de jour - Urgences',
        establishmentId: 1,
        specialization: 'Urgences',
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-06-20'),
        hourlyRate: '35',
        status: 'open',
        location: { city: 'Lyon', coordinates: [45.7640, 4.8357] },
        description: 'Remplacement aux urgences pour congés d\'été.',
        requirements: ['Expérience en urgences', 'Disponibilité de jour']
      }
    ];
    
    res.json({ missions: sampleMissions });
  });

  app.post('/api/missions', (req, res) => {
    console.log('Creating mission:', req.body);
    res.json({ 
      success: true, 
      message: 'Mission créée avec succès',
      mission: { id: Date.now(), ...req.body, status: 'open' }
    });
  });

  app.get('/api/missions/:id', (req, res) => {
    const { id } = req.params;
    res.json({
      id: parseInt(id),
      title: 'Mission détaillée',
      description: 'Détails de la mission...',
      status: 'open'
    });
  });

  // Routes pour les candidatures
  app.post('/api/missions/:id/apply', (req, res) => {
    const { id } = req.params;
    console.log(`Application to mission ${id}:`, req.body);
    res.json({ 
      success: true, 
      message: 'Candidature envoyée avec succès',
      applicationId: Date.now()
    });
  });

  // Routes pour les statistiques
  app.get('/api/nurse-stats', (req, res) => {
    res.json({
      completedMissions: 12,
      totalEarnings: 8400,
      averageRating: 4.8,
      totalHours: 240
    });
  });

  // Stats principales du dashboard
  app.get('/api/dashboard/stats', (req, res) => {
    res.json({
      activeStaff: 245,
      openMissions: 8,
      avgResponseTime: 1.2,
      satisfaction: 4.6,
      totalNurses: 320,
      missionsThisMonth: 45,
      averageHourlyRate: 32,
      budgetUtilization: 78,
      urgentMissions: 3,
      completedMissions: 156
    });
  });

  app.get('/api/establishment-stats', (req, res) => {
    res.json({
      activeMissions: 5,
      completedMissions: 23,
      totalNursesHired: 45,
      averageRating: 4.6
    });
  });

  // Routes pour les prévisions (sans IA pour l'instant)
  app.get('/api/absence-forecasts', (req, res) => {
    res.json({
      forecasts: [
        {
          id: 1,
          date: '2024-06-15',
          predictedAbsences: 3,
          department: 'Réanimation',
          confidence: 0.85
        }
      ]
    });
  });

  // Route de déconnexion simulée
  app.get('/api/logout', (req, res) => {
    // Marquer l'utilisateur comme déconnecté
    isUserLoggedIn = false;
    res.redirect('/');
  });

  // Route pour se reconnecter (pour les tests)
  app.get('/api/login', (req, res) => {
    res.redirect('/profile-selector');
  });

  // Routes pour la gestion des profils sauvegardés
  app.get('/api/saved-profiles', (req, res) => {
    res.json(savedProfiles);
  });

  app.post('/api/select-profile', (req, res) => {
    const { profileId } = req.body;
    const selectedProfile = savedProfiles.find(p => p.id === profileId);
    
    if (selectedProfile) {
      currentUserData = selectedProfile;
      isUserLoggedIn = true;
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  });

  app.get('/api/login-default', (req, res) => {
    currentUserData = null; // Reset pour utiliser les données par défaut
    isUserLoggedIn = true;
    res.json({ success: true });
  });

  // Route pour créer un profil infirmier de démonstration
  app.post('/api/create-demo-nurse', (req, res) => {
    currentUserData = {
      id: `demo-nurse-${Date.now()}`,
      email: 'demo.infirmier@nurselink.fr',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'nurse',
      cguAccepted: true,
      profile: {
        id: 1,
        userId: `demo-nurse-${Date.now()}`,
        rppsNumber: '10102030405',
        adeliNumber: '751234567',
        specialization: 'urgences',
        experience: 5,
        location: { city: 'Paris', coordinates: [48.8566, 2.3522] },
        available: true,
        hourlyRate: '35',
        skills: ['Réanimation', 'Pédiatrie', 'Gériatrie'],
        bio: 'Infirmière expérimentée spécialisée en soins d\'urgence avec 5 ans d\'expérience en milieu hospitalier.',
        languages: ['fr', 'en'],
        certifications: ['AFGSU 2', 'Formation Réanimation', 'Soins Palliatifs'],
        availability: 'temps-plein',
        documentsVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    
    // Ajouter quelques créneaux de démonstration
    userSchedule = [
      {
        id: 'demo-slot-1',
        date: new Date().toISOString().split('T')[0], // Aujourd'hui
        startTime: '08:00',
        endTime: '16:00',
        shift: 'jour',
        available: true
      },
      {
        id: 'demo-slot-2',
        date: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0], // Demain
        startTime: '14:00',
        endTime: '22:00',
        shift: 'apres-midi',
        available: true
      },
      {
        id: 'demo-slot-3',
        date: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0], // Après-demain
        startTime: '22:00',
        endTime: '06:00',
        shift: 'nuit',
        available: false
      }
    ];
    
    isUserLoggedIn = true;
    res.json({ success: true, user: currentUserData });
  });

  // Route pour créer un profil d'inscription
  app.post('/api/create-profile', (req, res) => {
    const { profileData, role } = req.body;
    
    if (role === 'nurse') {
      currentUserData = {
        id: `nurse-${Date.now()}`,
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: 'nurse',
        cguAccepted: true,
        profile: {
          id: 1,
          userId: `nurse-${Date.now()}`,
          rppsNumber: profileData.rppsNumber,
          adeliNumber: profileData.adeliNumber,
          specialization: profileData.specialization,
          experience: parseInt(profileData.experience.split('-')[0]) || 0,
          location: { city: profileData.location, coordinates: [48.8566, 2.3522] },
          available: true,
          hourlyRate: profileData.hourlyRate,
          skills: [],
          bio: profileData.bio,
          languages: ['fr'],
          certifications: profileData.certifications ? profileData.certifications.split(',').map(c => c.trim()) : [],
          availability: profileData.availability,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    } else if (role === 'establishment') {
      currentUserData = {
        id: `establishment-${Date.now()}`,
        email: profileData.contactEmail,
        firstName: profileData.contactPersonName.split(' ')[0] || 'Contact',
        lastName: profileData.contactPersonName.split(' ')[1] || 'Personne',
        role: 'establishment',
        cguAccepted: true,
        profile: {
          id: 1,
          userId: `establishment-${Date.now()}`,
          name: profileData.name,
          type: profileData.type,
          siretNumber: profileData.siretNumber,
          address: profileData.address,
          contactPhone: profileData.contactPhone,
          contactEmail: profileData.contactEmail,
          contactPersonName: profileData.contactPersonName,
          documentsVerified: false,
          totalBeds: parseInt(profileData.totalBeds) || 0,
          departments: profileData.departments || [],
          certifications: profileData.certifications ? profileData.certifications.split(',').map(c => c.trim()) : [],
          description: profileData.description,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    }
    
    // Sauvegarder le profil pour usage ultérieur
    savedProfiles.push({...currentUserData});
    
    isUserLoggedIn = true;
    res.json({ success: true, user: currentUserData });
  });

  // Route pour mettre à jour le profil
  app.put('/api/update-profile', (req, res) => {
    if (!currentUserData) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updates = req.body;
    
    // Mettre à jour les données utilisateur
    currentUserData.firstName = updates.firstName || currentUserData.firstName;
    currentUserData.lastName = updates.lastName || currentUserData.lastName;
    currentUserData.email = updates.email || currentUserData.email;
    
    // Mettre à jour le profil
    if (currentUserData.profile) {
      currentUserData.profile = {
        ...currentUserData.profile,
        ...updates,
        phone: updates.phone,
        bio: updates.bio,
        certifications: updates.certifications ? updates.certifications.split(',').map((c: string) => c.trim()) : currentUserData.profile.certifications,
        updatedAt: new Date()
      };
    }
    
    res.json({ success: true, user: currentUserData });
  });

  // Routes pour la gestion du planning
  app.get('/api/schedule', (req, res) => {
    res.json(userSchedule);
  });

  app.post('/api/schedule', (req, res) => {
    const newSlot = {
      id: `slot-${Date.now()}`,
      ...req.body
    };
    userSchedule.push(newSlot);
    res.json({ success: true, slot: newSlot });
  });

  app.delete('/api/schedule/:slotId', (req, res) => {
    const { slotId } = req.params;
    userSchedule = userSchedule.filter(slot => slot.id !== slotId);
    res.json({ success: true });
  });

  // Route pour tester la connectivité
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'NurseLink AI API is working',
      timestamp: new Date().toISOString(),
      environment: 'development'
    });
  });

  // Routes pour le test du système de matching IA
  app.post('/api/test/create-matching-scenario', async (req, res) => {
    try {
      const testNurses = [
        {
          id: "test-nurse-1",
          firstName: "Sophie",
          lastName: "Martin",
          specializations: ["urgences", "cardiologie"],
          experience: 5,
          rating: 4.8,
          location: { lat: 45.7640, lng: 4.8357 },
          certifications: ["BLS", "ATLS"],
          availability: true
        },
        {
          id: "test-nurse-2", 
          firstName: "Thomas",
          lastName: "Dubois",
          specializations: ["pediatrie", "urgences"],
          experience: 3,
          rating: 4.6,
          location: { lat: 45.7578, lng: 4.8320 },
          certifications: ["BLS"],
          availability: true
        },
        {
          id: "test-nurse-3",
          firstName: "Marie",
          lastName: "Leroy", 
          specializations: ["chirurgie", "traumatologie"],
          experience: 7,
          rating: 4.9,
          location: { lat: 45.7489, lng: 4.8467 },
          certifications: ["BLS", "ATLS", "ACLS"],
          availability: true
        },
        {
          id: "test-nurse-4",
          firstName: "Pierre",
          lastName: "Bernard",
          specializations: ["anesthesie", "reanimation"],
          experience: 2,
          rating: 4.3,
          location: { lat: 45.7711, lng: 4.8234 },
          certifications: ["BLS"],
          availability: true
        },
        {
          id: "test-nurse-5",
          firstName: "Claire",
          lastName: "Moreau",
          specializations: ["geriatrie", "soins_palliatifs"],
          experience: 4,
          rating: 4.5,
          location: { lat: 45.7311, lng: 4.8667 },
          certifications: ["BLS"],
          availability: true
        }
      ];

      const testMission = {
        id: "test-mission-ai",
        title: "Infirmier(ère) Urgences - CHU Lyon",
        establishmentName: "CHU Lyon Sud",
        department: "Service des Urgences",
        specializations: ["urgences", "traumatologie"],
        requiredCertifications: ["BLS"],
        preferredCertifications: ["ATLS"],
        location: { lat: 45.7640, lng: 4.8357 },
        address: "165 Chemin du Grand Revoyet, 69310 Pierre-Bénite",
        shift: "nuit",
        startDate: "2024-02-01",
        endDate: "2024-02-01",
        startTime: "20:00",
        endTime: "08:00",
        hourlyRate: 28,
        urgencyLevel: "high",
        description: "Recherche infirmier(ère) expérimenté(e) pour service d'urgences. Mission de nuit avec forte affluence prévue.",
        requirements: [
          "Minimum 3 ans d'expérience en urgences",
          "Certification BLS obligatoire",
          "Autonomie et gestion du stress"
        ],
        status: "open"
      };

      if (!(global as any).testScenarios) {
        (global as any).testScenarios = {};
      }
      
      (global as any).testScenarios.matching = {
        nurses: testNurses,
        mission: testMission,
        applications: [],
        matchingResults: null,
        notifications: []
      };

      console.log("✅ Scénario créé avec 5 infirmiers et 1 mission");
      
      res.json({
        success: true,
        message: "Scénario de test créé avec succès",
        data: {
          nursesCount: testNurses.length,
          mission: testMission,
          nurses: testNurses.map(n => ({
            id: n.id,
            name: `${n.firstName} ${n.lastName}`,
            specializations: n.specializations,
            rating: n.rating,
            experience: n.experience
          }))
        }
      });
    } catch (error) {
      console.error("❌ Erreur création scénario:", error);
      res.status(500).json({ error: "Erreur lors de la création du scénario" });
    }
  });

  app.post('/api/test/trigger-ai-matching', async (req, res) => {
    try {
      if (!(global as any).testScenarios?.matching) {
        return res.status(400).json({ error: "Aucun scénario de test trouvé. Créez d'abord un scénario." });
      }

      const { mission, nurses } = (global as any).testScenarios.matching;

      const results = nurses.map((nurse: any) => {
        let score = 0;
        const factors = [];

        if (nurse.specializations.some((spec: any) => mission.specializations.includes(spec))) {
          score += 40;
          factors.push("Spécialisation correspondante");
        }

        if (nurse.experience >= 3) {
          score += 25;
          factors.push("Expérience suffisante");
        }

        if (nurse.certifications.includes("BLS")) {
          score += 20;
          factors.push("Certification BLS");
        }

        if (nurse.certifications.includes("ATLS")) {
          score += 10;
          factors.push("Certification ATLS préférée");
        }

        score += Math.min(nurse.rating * 5, 5);

        return {
          nurseId: nurse.id,
          nurseName: `${nurse.firstName} ${nurse.lastName}`,
          score: Math.round(score),
          factors,
          selected: score >= 60
        };
      }).sort((a: any, b: any) => b.score - a.score);

      const selectedCandidates = results.filter((r: any) => r.selected).slice(0, 3);
      
      (global as any).testScenarios.matching.matchingResults = results;
      (global as any).testScenarios.matching.notifications = selectedCandidates.map((candidate: any, index: any) => ({
        nurseId: candidate.nurseId,
        nurseName: candidate.nurseName,
        sentAt: new Date(),
        message: `Nouvelle mission urgente disponible: ${mission.title}`,
        status: "sent"
      }));

      console.log(`✅ Matching terminé: ${selectedCandidates.length} candidats sélectionnés`);
      
      res.json({
        success: true,
        message: "Analyse IA terminée",
        data: {
          totalCandidates: results.length,
          selectedCandidates: selectedCandidates.length,
          results: results,
          notifications: (global as any).testScenarios.matching.notifications
        }
      });
    } catch (error) {
      console.error("❌ Erreur matching:", error);
      res.status(500).json({ error: "Erreur lors du matching" });
    }
  });

  app.post('/api/test/simulate-nurse-responses', async (req, res) => {
    try {
      if (!(global as any).testScenarios?.matching?.notifications) {
        return res.status(400).json({ error: "Aucune notification trouvée" });
      }

      const responses = [
        { nurseId: "test-nurse-1", response: "accepted", responseTime: 5 },
        { nurseId: "test-nurse-2", response: "declined", reason: "Indisponible" },
        { nurseId: "test-nurse-3", response: "accepted", responseTime: 12 }
      ];

      (global as any).testScenarios.matching.applications = responses.map((r: any, index: any) => ({
        id: `app-${index + 1}`,
        nurseId: r.nurseId,
        nurseName: (global as any).testScenarios.matching.nurses.find((n: any) => n.id === r.nurseId)?.firstName + " " + 
                   (global as any).testScenarios.matching.nurses.find((n: any) => n.id === r.nurseId)?.lastName,
        status: r.response,
        reason: r.reason || null,
        responseTime: r.responseTime || null,
        respondedAt: new Date()
      }));

      console.log(`✅ ${responses.length} réponses simulées`);
      
      res.json({
        success: true,
        message: "Réponses des infirmiers simulées",
        data: {
          responses: (global as any).testScenarios.matching.applications,
          acceptedCount: responses.filter(r => r.response === "accepted").length,
          declinedCount: responses.filter(r => r.response === "declined").length
        }
      });
    } catch (error) {
      console.error("❌ Erreur simulation:", error);
      res.status(500).json({ error: "Erreur lors de la simulation" });
    }
  });

  app.get('/api/test/matching-scenario-status', async (req, res) => {
    try {
      const scenario = (global as any).testScenarios?.matching;
      
      if (!scenario) {
        return res.json({ exists: false });
      }
      
      res.json({
        exists: true,
        mission: scenario.mission,
        nurses: scenario.nurses,
        matchingResults: scenario.matchingResults,
        notifications: scenario.notifications,
        applications: scenario.applications,
        status: {
          scenarioCreated: !!scenario.mission,
          matchingCompleted: !!scenario.matchingResults,
          notificationsSent: scenario.notifications?.length > 0,
          responsesReceived: scenario.applications?.length > 0
        }
      });
    } catch (error) {
      console.error("❌ Erreur récupération statut:", error);
      res.status(500).json({ error: "Erreur lors de la récupération du statut" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}