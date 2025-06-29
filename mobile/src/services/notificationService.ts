import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  date: Date;
  read: boolean;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  // Configurer les notifications
  async configure(): Promise<void> {
    try {
      // Configurer le comportement des notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Demander les permissions
      await this.requestPermissions();

      // Obtenir le token push (désactivé pour Expo Go)
      // await this.getExpoPushToken();

      // Configurer les listeners
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  }

  // Demander les permissions de notification
  async requestPermissions(): Promise<boolean> {
    try {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Permission de notification refusée');
          return false;
        }

        return true;
      } else {
        console.log('Notifications non disponibles sur l\'émulateur');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Obtenir le token Expo Push (désactivé pour Expo Go)
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (Device.isDevice) {
        // Pour Expo Go, on retourne null car les notifications push ne sont pas supportées
        console.log('Notifications push désactivées pour Expo Go');
        return null;

        // Code pour les development builds uniquement :
        // const token = await Notifications.getExpoPushTokenAsync({
        //   projectId: 'your-project-id', // Remplacez par votre Project ID Expo
        // });
        // this.expoPushToken = token.data;
        // console.log('Expo Push Token:', token.data);
        // return token.data;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token push:', error);
      return null;
    }
  }

  // Configurer les listeners de notification
  private setupNotificationListeners(): void {
    // Listener pour les notifications reçues
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification reçue:', notification);
        // Ici vous pouvez gérer la notification reçue
        // Par exemple, mettre à jour le badge, stocker la notification, etc.
      }
    );

    // Listener pour les notifications cliquées
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification cliquée:', response);
        // Ici vous pouvez gérer l'action quand l'utilisateur clique sur la notification
        // Par exemple, naviguer vers un écran spécifique
        this.handleNotificationResponse(response);
      }
    );
  }

  // Gérer la réponse à une notification
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;

    // Navigation basée sur le type de notification
    if (data?.type === 'mission_match') {
      // Naviguer vers les détails de la mission
      // navigation.navigate('MissionDetail', { missionId: data.missionId });
    } else if (data?.type === 'new_message') {
      // Naviguer vers le chat
      // navigation.navigate('Chat', { chatId: data.chatId });
    } else if (data?.type === 'payment_received') {
      // Naviguer vers les paiements
      // navigation.navigate('Payments');
    }
  }

  // Envoyer une notification locale
  async scheduleLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          priority: notification.priority || 'default',
          badge: notification.badge,
        },
        trigger: null, // Notification immédiate
      });

      return notificationId;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification locale:', error);
      throw error;
    }
  }

  // Programmer une notification locale
  async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound !== false,
          priority: notification.priority || 'default',
          badge: notification.badge,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Erreur lors de la programmation de la notification:', error);
      throw error;
    }
  }

  // Annuler une notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la notification:', error);
    }
  }

  // Annuler toutes les notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de toutes les notifications:', error);
    }
  }

  // Obtenir les notifications programmées
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }

  // Définir le badge
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Erreur lors de la définition du badge:', error);
    }
  }

  // Obtenir le badge actuel
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Erreur lors de la récupération du badge:', error);
      return 0;
    }
  }

  // Envoyer une notification push via votre serveur
  async sendPushNotification(
    expoPushToken: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      const message = {
        to: expoPushToken,
        sound: notification.sound !== false ? 'default' : undefined,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification push:', error);
      throw error;
    }
  }

  // Notifications spécifiques à l'application
  async sendMissionMatchNotification(missionId: string, matchScore: number): Promise<void> {
    const notification: NotificationData = {
      id: `mission_match_${missionId}`,
      title: 'Nouvelle mission parfaite ! 🎯',
      body: `Une mission correspond à ${matchScore}% à vos critères. Postulez maintenant !`,
      data: {
        type: 'mission_match',
        missionId,
        matchScore,
      },
      priority: 'high',
      sound: true,
    };

    await this.scheduleLocalNotification(notification);
  }

  async sendNewMessageNotification(senderName: string, messagePreview: string): Promise<void> {
    const notification: NotificationData = {
      id: `new_message_${Date.now()}`,
      title: `Nouveau message de ${senderName}`,
      body: messagePreview,
      data: {
        type: 'new_message',
        senderName,
      },
      priority: 'normal',
      sound: true,
    };

    await this.scheduleLocalNotification(notification);
  }

  async sendPaymentNotification(amount: number): Promise<void> {
    const notification: NotificationData = {
      id: `payment_${Date.now()}`,
      title: 'Paiement reçu ! 💰',
      body: `${amount}€ ont été ajoutés à votre compte.`,
      data: {
        type: 'payment_received',
        amount,
      },
      priority: 'high',
      sound: true,
    };

    await this.scheduleLocalNotification(notification);
  }

  async sendReminderNotification(missionTitle: string, startTime: string): Promise<void> {
    const notification: NotificationData = {
      id: `reminder_${Date.now()}`,
      title: 'Rappel de mission',
      body: `Votre mission "${missionTitle}" commence dans 1 heure.`,
      data: {
        type: 'mission_reminder',
        missionTitle,
        startTime,
      },
      priority: 'high',
      sound: true,
    };

    await this.scheduleLocalNotification(notification);
  }

  // Nettoyer les listeners
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Obtenir le token push
  getExpoPushTokenValue(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
