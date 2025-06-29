/**
 * Page d'authentification avec connexion et inscription
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "../hooks/useAuth-simple";
import { Redirect } from "wouter";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "nurse" | "establishment";
  // Champs spécifiques aux infirmiers
  rppsNumber?: string;
  adeliNumber?: string;
  specialization?: string;
  experience?: string;
  // Champs spécifiques aux établissements
  establishmentName?: string;
  establishmentType?: string;
  siretNumber?: string;
  address?: string;
  contactPhone?: string;
}

export default function AuthPage() {
  const { user, isAuthenticated, login, register, isLoginLoading, isRegisterLoading } = useAuth();
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });

  // Gestion du thème depuis localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (savedTheme === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "nurse",
    // Champs infirmiers
    rppsNumber: "",
    adeliNumber: "",
    specialization: "",
    experience: "",
    // Champs établissements
    establishmentName: "",
    establishmentType: "",
    siretNumber: "",
    address: "",
    contactPhone: ""
  });
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      return;
    }
    login(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      return;
    }
    if (registerData.password.length < 6) {
      return;
    }
    register(registerData);
  };

  // Redirection si déjà connecté
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* Section Hero */}
        <div className="text-center md:text-left space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              NurseLink AI
            </h1>
            <p className="text-xl text-gray-600">
              La plateforme intelligente qui connecte les infirmiers aux établissements de santé
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">✓</span>
              </div>
              <span className="text-gray-700">Matching intelligent basé sur l'IA</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <span className="text-gray-700">Contrats générés automatiquement</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">✓</span>
              </div>
              <span className="text-gray-700">Gestion simplifiée des missions</span>
            </div>
          </div>
        </div>

        {/* Section Authentification */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Authentification</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              
              {/* Formulaire de connexion */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Formulaire d'inscription */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-firstname">Prénom</Label>
                      <Input
                        id="register-firstname"
                        placeholder="Prénom"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-lastname">Nom</Label>
                      <Input
                        id="register-lastname"
                        placeholder="Nom"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-role">Vous êtes</Label>
                    <Select value={registerData.role} onValueChange={(value: "nurse" | "establishment") => setRegisterData({ ...registerData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nurse">Infirmier(ère)</SelectItem>
                        <SelectItem value="establishment">Établissement de santé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Champs spécifiques aux infirmiers */}
                  {registerData.role === "nurse" && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900">Informations professionnelles</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rpps-number">Numéro RPPS</Label>
                          <Input
                            id="rpps-number"
                            placeholder="12345678901"
                            value={registerData.rppsNumber}
                            onChange={(e) => setRegisterData({ ...registerData, rppsNumber: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="adeli-number">Numéro ADELI</Label>
                          <Input
                            id="adeli-number"
                            placeholder="123456789"
                            value={registerData.adeliNumber}
                            onChange={(e) => setRegisterData({ ...registerData, adeliNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="specialization">Spécialisation</Label>
                        <Select value={registerData.specialization} onValueChange={(value) => setRegisterData({ ...registerData, specialization: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre spécialisation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Soins généraux</SelectItem>
                            <SelectItem value="urgences">Urgences</SelectItem>
                            <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                            <SelectItem value="geriatrie">Gériatrie</SelectItem>
                            <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                            <SelectItem value="chirurgie">Chirurgie</SelectItem>
                            <SelectItem value="reanimation">Réanimation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience">Années d'expérience</Label>
                        <Select value={registerData.experience} onValueChange={(value) => setRegisterData({ ...registerData, experience: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez votre expérience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 an</SelectItem>
                            <SelectItem value="2-5">2-5 ans</SelectItem>
                            <SelectItem value="6-10">6-10 ans</SelectItem>
                            <SelectItem value="10+">Plus de 10 ans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Champs spécifiques aux établissements */}
                  {registerData.role === "establishment" && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-gray-900">Informations établissement</h4>
                      <div>
                        <Label htmlFor="establishment-name">Nom de l'établissement</Label>
                        <Input
                          id="establishment-name"
                          placeholder="CHU de Lyon"
                          value={registerData.establishmentName}
                          onChange={(e) => setRegisterData({ ...registerData, establishmentName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="establishment-type">Type d'établissement</Label>
                        <Select value={registerData.establishmentType} onValueChange={(value) => setRegisterData({ ...registerData, establishmentType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hospital">Hôpital public</SelectItem>
                            <SelectItem value="clinic">Clinique privée</SelectItem>
                            <SelectItem value="ehpad">EHPAD</SelectItem>
                            <SelectItem value="maison_retraite">Maison de retraite</SelectItem>
                            <SelectItem value="center_dialysis">Centre de dialyse</SelectItem>
                            <SelectItem value="home_care">Soins à domicile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="siret-number">Numéro SIRET</Label>
                        <Input
                          id="siret-number"
                          placeholder="12345678901234"
                          value={registerData.siretNumber}
                          onChange={(e) => setRegisterData({ ...registerData, siretNumber: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Adresse</Label>
                        <Input
                          id="address"
                          placeholder="123 Rue de la Santé, 69000 Lyon"
                          value={registerData.address}
                          onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-phone">Téléphone de contact</Label>
                        <Input
                          id="contact-phone"
                          placeholder="04 12 34 56 78"
                          value={registerData.contactPhone}
                          onChange={(e) => setRegisterData({ ...registerData, contactPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}