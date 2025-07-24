/**
 * Routes d'authentification locale (email/mot de passe)
 */

import express from 'express';
import {
  localAuthMiddleware,
  createSession,
  removeSession,
  refreshSession,
  authenticateUser,
  getSessionStats
} from '../middleware/localAuthMiddleware';
import { storage } from '../services/storageService';

const router = express.Router();

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Authentifier l'utilisateur
    const user = authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Créer un profil établissement si nécessaire
    if (user.role === 'establishment') {
      const existingProfile = await storage.getEstablishmentProfile(user.id);
      if (!existingProfile) {
        await storage.createEstablishmentProfile({
          id: user.id,
          email: user.email,
          name: user.name || 'Établissement de test',
          createdAt: new Date(),
        });
      }
    }

    // Créer une nouvelle session
    const { token, expiresAt } = createSession(user);

    // Retourner les informations de session
    res.json({
      success: true,
      message: 'Connexion réussie',
      sessionToken: token,
      expiresAt: new Date(expiresAt).toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        establishmentId: user.establishmentId
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne lors de la connexion',
      code: 'LOGIN_ERROR'
    });
  }
});

// Route de déconnexion
router.post('/logout', localAuthMiddleware, (req: any, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      removeSession(token);
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur interne lors de la déconnexion',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Route pour renouveler une session
router.post('/refresh', (req: any, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Token manquant',
        code: 'MISSING_TOKEN'
      });
    }

    const result = refreshSession(token);

    if (!result.expiresAt) {
      return res.status(401).json({
        error: 'Session invalide',
        code: 'INVALID_SESSION'
      });
    }

    res.json({
      success: true,
      message: 'Session renouvelée',
      sessionToken: result.newToken || token,
      expiresAt: new Date(result.expiresAt).toISOString()
    });

  } catch (error) {
    console.error('Erreur lors du renouvellement de session:', error);
    res.status(500).json({
      error: 'Erreur interne lors du renouvellement',
      code: 'REFRESH_ERROR'
    });
  }
});

// Route pour obtenir les informations utilisateur
router.get('/user', localAuthMiddleware, (req: any, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération utilisateur:', error);
    res.status(500).json({
      error: 'Erreur interne',
      code: 'USER_FETCH_ERROR'
    });
  }
});

export default router;
