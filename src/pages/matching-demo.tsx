import React from 'react';

const MatchingDemo = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Démonstration du Matching IA</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">
          Cette page démontre les capacités de matching intelligent de NurseLink AI.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">Algorithme de Matching</h3>
            <p className="text-blue-600">
              Notre IA analyse les compétences, expériences et préférences pour
              proposer les meilleures correspondances.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800">Scoring Intelligent</h3>
            <p className="text-green-600">
              Chaque candidature reçoit un score basé sur de multiples critères
              pour optimiser les chances de succès.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-800">Recommandations</h3>
            <p className="text-purple-600">
              L'IA suggère automatiquement les meilleurs candidats pour chaque mission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingDemo;
