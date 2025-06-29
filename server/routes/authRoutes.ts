/**
 * ==============================================================================
 * NurseLink AI - Routes d'Authentification
 * ==============================================================================
 *
 * Routes dédiées à l'authentification et gestion des utilisateurs
 * Utilise le service d'authentification modulaire
 * ==============================================================================
 */

import { Router } from "express";
import { requireAuthentication, getUserFromRequest } from "../services/authService";
import { storage } from "../services/storageService";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * Schéma de validation pour l'inscription
 */
const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["nurse", "establishment"]),
  // Champs optionnels pour les établissements
  establishmentName: z.string().optional(),
  establishmentType: z.string().optional(),
  siretNumber: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
});

/**
 * Schéma de validation pour l'acceptation des CGU
 */
const acceptCGUSchema = z.object({
  role: z.enum(["nurse", "establishment"]),
});

/**
 * Route d'inscription
 */
router.post("/register", async (req, res) => {
  try {
    // Validation des données
    const validatedData = registerSchema.parse(req.body);

    // Vérifier si l'email existe déjà
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(409).json({
        error: "Un compte avec cet email existe déjà",
        code: "EMAIL_ALREADY_EXISTS"
      });
    }

    // Vérifier l'unicité du SIRET si fourni pour un établissement
    if (validatedData.role === "establishment" && validatedData.siretNumber) {
      const existingEstablishment = await storage.getEstablishmentBySiret(validatedData.siretNumber);
      if (existingEstablishment) {
        return res.status(409).json({
          error: "Un établissement avec ce numéro SIRET existe déjà",
          code: "SIRET_ALREADY_EXISTS"
        });
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Créer l'utilisateur
    const userData = {
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
      cguAccepted: false, // Sera mis à true lors de l'acceptation des CGU
    };

    const newUser = await storage.createUser(userData);

    // Si c'est un établissement, créer le profil établissement
    if (validatedData.role === "establishment" && (
      validatedData.establishmentName ||
      validatedData.establishmentType ||
      validatedData.siretNumber
    )) {
      const establishmentProfile = {
        userId: newUser.id,
        name: validatedData.establishmentName || `${validatedData.firstName} ${validatedData.lastName}`,
        type: validatedData.establishmentType || "Non spécifié",
        siret: validatedData.siretNumber || "",
        address: validatedData.address || "",
        phone: validatedData.contactPhone || "",
        contactPerson: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.email,
      };

      await storage.createOrUpdateEstablishmentProfile(establishmentProfile);
    }

    // Générer le token de session
    const sessionToken = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    // Retourner la réponse sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "Inscription réussie",
      user: userWithoutPassword,
      sessionToken,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    console.error("Erreur inscription:", error);
    res.status(500).json({
      error: "Erreur serveur lors de l'inscription",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * Route pour récupérer les informations de l'utilisateur connecté
 */
router.get("/user", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({
        error: "Utilisateur non authentifié",
        code: "UNAUTHORIZED"
      });
    }

    const user = await storage.getUser(userInfo.userId);
    if (!user) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      });
    }

    // Ne pas retourner le mot de passe
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Erreur récupération utilisateur:", error);
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * Route pour accepter les CGU et définir le rôle
 */
router.post("/accept-cgu", requireAuthentication, async (req: any, res) => {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) {
      return res.status(401).json({
        error: "Utilisateur non authentifié",
        code: "UNAUTHORIZED"
      });
    }

    // Validation des données
    const { role } = acceptCGUSchema.parse(req.body);

    // Mise à jour de l'utilisateur
    const updatedUser = await storage.acceptCGU(userInfo.userId, role);

    res.json({
      message: "CGU acceptées avec succès",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Données invalides",
        code: "VALIDATION_ERROR",
        details: error.errors,
      });
    }

    console.error("Erreur acceptation CGU:", error);
    res.status(500).json({
      error: "Erreur serveur",
      code: "INTERNAL_ERROR"
    });
  }
});

/**
 * Route de vérification du statut d'authentification
 */
router.get("/status", (req, res) => {
  const userInfo = getUserFromRequest(req);

  res.json({
    authenticated: !!userInfo,
    userId: userInfo?.userId || null,
  });
});

export default router;
