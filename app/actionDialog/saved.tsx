import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SavedItem = {
  id: string;
  title: string;
  subtitle: string;
};

const mockData: SavedItem[] = [
  { id: '1', title: 'Grilled Chicken Bowl', subtitle: 'Saved Aug 2, 12:30 PM' },
  { id: '2', title: 'Veggie Salad', subtitle: 'Saved Aug 1, 8:15 PM' },
  { id: '3', title: 'Oatmeal & Berries', subtitle: 'Saved Jul 31, 9:10 AM' },
];

export default function SavedScreen() {
  const insets = useSafeAreaInsets();

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      {/* Header with close button */}
      <View style={styles.header}>
        <Text style={styles.title}>Food Saved</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>Your recently saved meals</Text>

      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardContent}>
              <View style={styles.cardIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No saved meals yet</Text>
            <Text style={styles.emptyDescription}>Scan or upload meals to save them for later.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    paddingHorizontal: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 16 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 14, 
    marginTop: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 6, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 3 
  },
  cardContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  cardIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#EEE' 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#000' 
  },
  cardSubtitle: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 40 
  },
  emptyTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 8 
  },
  emptyDescription: { 
    fontSize: 14, 
    color: '#666' 
  },
});


