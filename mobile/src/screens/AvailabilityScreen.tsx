import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

export default function AvailabilityScreen() {
  const navigation = useNavigation();
  const [selectedDates, setSelectedDates] = useState<{[key: string]: any}>({});
  const [availabilityType, setAvailabilityType] = useState<'available' | 'partial' | 'unavailable'>('available');
  const [timeSlots, setTimeSlots] = useState({
    morning: true,
    afternoon: true,
    evening: true,
    night: false,
  });

  const availabilityTypes = [
    {
      id: 'available',
      label: 'Disponible',
      color: '#10b981',
      icon: 'checkmark-circle',
    },
    {
      id: 'partial',
      label: 'Partiellement disponible',
      color: '#f59e0b',
      icon: 'time',
    },
    {
      id: 'unavailable',
      label: 'Indisponible',
      color: '#ef4444',
      icon: 'close-circle',
    },
  ];

  const timeSlotOptions = [
    { id: 'morning', label: 'Matin (6h-12h)', icon: 'sunny' },
    { id: 'afternoon', label: 'Après-midi (12h-18h)', icon: 'partly-sunny' },
    { id: 'evening', label: 'Soirée (18h-22h)', icon: 'moon' },
    { id: 'night', label: 'Nuit (22h-6h)', icon: 'bed' },
  ];

  const handleDayPress = (day: DateData) => {
    const dateString = day.dateString;
    const newSelectedDates = { ...selectedDates };

    if (newSelectedDates[dateString]) {
      delete newSelectedDates[dateString];
    } else {
      newSelectedDates[dateString] = {
        selected: true,
        selectedColor: availabilityTypes.find(t => t.id === availabilityType)?.color,
        marked: true,
        dotColor: availabilityTypes.find(t => t.id === availabilityType)?.color,
      };
    }

    setSelectedDates(newSelectedDates);
  };

  const handleSave = () => {
    const selectedDatesCount = Object.keys(selectedDates).length;
    if (selectedDatesCount === 0) {
      Alert.alert('Attention', 'Veuillez sélectionner au moins une date');
      return;
    }

    Alert.alert(
      'Disponibilités sauvegardées',
      `${selectedDatesCount} jour(s) configuré(s) avec succès`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mes disponibilités</Text>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvailabilityTypes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Type de disponibilité</Text>
      <View style={styles.availabilityTypesContainer}>
        {availabilityTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.availabilityTypeButton,
              availabilityType === type.id && styles.availabilityTypeButtonActive,
              { borderColor: type.color }
            ]}
            onPress={() => setAvailabilityType(type.id as any)}
          >
            <Ionicons
              name={type.icon as any}
              size={20}
              color={availabilityType === type.id ? '#ffffff' : type.color}
            />
            <Text style={[
              styles.availabilityTypeText,
              availabilityType === type.id && styles.availabilityTypeTextActive,
              { color: availabilityType === type.id ? '#ffffff' : type.color }
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeSlots = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Créneaux horaires</Text>
      <View style={styles.timeSlotsContainer}>
        {timeSlotOptions.map((slot) => (
          <View key={slot.id} style={styles.timeSlotItem}>
            <View style={styles.timeSlotInfo}>
              <Ionicons name={slot.icon as any} size={20} color="#6b7280" />
              <Text style={styles.timeSlotLabel}>{slot.label}</Text>
            </View>
            <Switch
              value={timeSlots[slot.id as keyof typeof timeSlots]}
              onValueChange={(value) =>
                setTimeSlots(prev => ({ ...prev, [slot.id]: value }))
              }
              trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
              thumbColor={timeSlots[slot.id as keyof typeof timeSlots] ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        ))}
      </View>
    </View>
  );

  const renderCalendar = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Calendrier</Text>
      <Text style={styles.sectionSubtitle}>
        Sélectionnez vos jours disponibles
      </Text>
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={selectedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#1f2937',
            selectedDayBackgroundColor: availabilityTypes.find(t => t.id === availabilityType)?.color,
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#2563eb',
            dayTextColor: '#1f2937',
            textDisabledColor: '#d1d5db',
            dotColor: availabilityTypes.find(t => t.id === availabilityType)?.color,
            selectedDotColor: '#ffffff',
            arrowColor: '#2563eb',
            monthTextColor: '#1f2937',
            indicatorColor: '#2563eb',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            // Logique pour marquer tous les week-ends
            Alert.alert('Action rapide', 'Tous les week-ends marqués comme disponibles');
          }}
        >
          <Ionicons name="calendar" size={20} color="#2563eb" />
          <Text style={styles.quickActionText}>Week-ends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            // Logique pour marquer tous les jours de semaine
            Alert.alert('Action rapide', 'Tous les jours de semaine marqués comme disponibles');
          }}
        >
          <Ionicons name="business" size={20} color="#2563eb" />
          <Text style={styles.quickActionText}>Jours ouvrés</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setSelectedDates({});
            Alert.alert('Action rapide', 'Toutes les sélections effacées');
          }}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
          <Text style={[styles.quickActionText, { color: '#ef4444' }]}>Effacer tout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderAvailabilityTypes()}
        {renderTimeSlots()}
        {renderCalendar()}
        {renderQuickActions()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  availabilityTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  availabilityTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 4,
  },
  availabilityTypeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  availabilityTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  availabilityTypeTextActive: {
    color: '#ffffff',
  },
  timeSlotsContainer: {
    gap: 12,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  timeSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  calendarContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 8,
  },
});
