import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface AddressData {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  fullAddress: string;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;

  // Demander les permissions de localisation
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Vérifier les permissions
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }

  // Obtenir la position actuelle
  async getCurrentLocation(): Promise<LocationData> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Permission de localisation refusée');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      this.currentLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Erreur lors de l\'obtention de la position:', error);
      throw new Error('Impossible d\'obtenir votre position');
    }
  }

  // Démarrer le suivi de position
  async startLocationTracking(
    onLocationUpdate: (location: LocationData) => void
  ): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Permission de localisation refusée');
        }
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Mise à jour toutes les 10 secondes
          distanceInterval: 50, // Mise à jour tous les 50 mètres
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: location.timestamp,
          };

          this.currentLocation = locationData;
          onLocationUpdate(locationData);
        }
      );
    } catch (error) {
      console.error('Erreur lors du démarrage du suivi:', error);
      throw new Error('Impossible de démarrer le suivi de position');
    }
  }

  // Arrêter le suivi de position
  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  // Obtenir l'adresse à partir des coordonnées
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<AddressData> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const addressData: AddressData = {
          street: result.street || '',
          city: result.city || '',
          postalCode: result.postalCode || '',
          country: result.country || '',
          fullAddress: [
            result.street,
            result.city,
            result.postalCode,
            result.country,
          ]
            .filter(Boolean)
            .join(', '),
        };

        return addressData;
      }

      throw new Error('Aucune adresse trouvée pour ces coordonnées');
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      throw new Error('Impossible de récupérer l\'adresse');
    }
  }

  // Obtenir les coordonnées à partir d'une adresse
  async getCoordinatesFromAddress(address: string): Promise<LocationData> {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        const result = results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
        };
      }

      throw new Error('Aucune coordonnée trouvée pour cette adresse');
    } catch (error) {
      console.error('Erreur lors de la récupération des coordonnées:', error);
      throw new Error('Impossible de récupérer les coordonnées');
    }
  }

  // Calculer la distance entre deux points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en kilomètres
    return distance;
  }

  // Convertir les degrés en radians
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Obtenir la position actuelle stockée
  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  // Vérifier si la localisation est activée
  async isLocationEnabled(): Promise<boolean> {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      return isEnabled;
    } catch (error) {
      console.error('Erreur lors de la vérification de la localisation:', error);
      return false;
    }
  }

  // Obtenir les missions proches
  async getNearbyMissions(
    missions: any[],
    maxDistance: number = 50
  ): Promise<any[]> {
    try {
      const currentLocation = await this.getCurrentLocation();

      return missions.filter((mission) => {
        if (!mission.latitude || !mission.longitude) return false;

        const distance = this.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          mission.latitude,
          mission.longitude
        );

        return distance <= maxDistance;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des missions proches:', error);
      return missions; // Retourner toutes les missions en cas d'erreur
    }
  }

  // Formater la distance pour l'affichage
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }
}

export const locationService = new LocationService();
