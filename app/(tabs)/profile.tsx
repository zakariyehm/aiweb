import useStreak from '@/hooks/useStreak';
import { auth, db, storage } from '@/lib/firebase';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UserProfile {
  firstName?: string;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  workouts?: string;
  goal?: string;
  desiredWeight?: string;
  specificGoal?: string;
  email?: string;
}

interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  goal: string;
  currentWeight: number;
  desiredWeight: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Get streak data from home screen
  const uid = auth.currentUser?.uid;
  const { count: streakCount, atRisk: streakAtRisk, broken: streakBroken } = useStreak(uid);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserProfile(data.profile || {});
          setNutritionPlan(data.plan || null);
          
          // Load profile image from Firebase Storage
          if (data.profileImageUrl) {
            setProfileImage(data.profileImageUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Firebase Storage with better error handling
  const uploadImageToFirebase = async (imageUri: string): Promise<string> => {
    try {
      // Convert image to blob
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      
      // Create unique filename
      const timestamp = Date.now();
      const imageRef = ref(storage, `profile-images/${uid}/${timestamp}.jpg`);
      
      // Upload with metadata
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedAt: timestamp.toString(),
          userId: uid || 'unknown'
        }
      };
      
      await uploadBytes(imageRef, blob, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          throw new Error('Storage access denied');
        } else if (error.message.includes('storage/quota-exceeded')) {
          throw new Error('Storage quota exceeded');
        } else if (error.message.includes('storage/network-request-failed')) {
          throw new Error('Network error during upload');
        }
      }
      
      throw new Error('Failed to upload image to Firebase Storage');
    }
  };

  // Update user profile with image URL
  const updateUserProfileImage = async (imageUrl: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          profileImageUrl: imageUrl,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw new Error('Failed to update profile');
    }
  };

  const getGoalEmoji = (goal: string) => {
    switch (goal) {
      case 'Lose Weight': return '📉';
      case 'Gain Weight': return '📈';
      case 'Maintain': return '⚖️';
      default: return '🎯';
    }
  };

  const getWorkoutEmoji = (workouts: string) => {
    switch (workouts) {
      case '0-2 times': return '🛋️';
      case '3-5 times': return '💪';
      case '6+ times': return '🏃‍♂️';
      default: return '🏋️‍♂️';
    }
  };

  const getDietEmoji = (diet: string) => {
    switch (diet) {
      case 'Vegetarian': return '🥦';
      case 'Vegan': return '🌱';
      case 'Keto': return '🥓';
      case 'Paleo': return '🍖';
      case 'Mediterranean': return '🫒';
      default: return '🍽️';
    }
  };

  const getNutritionColor = (type: string) => {
    switch (type) {
      case 'calories': return '#FF6B6B';
      case 'protein': return '#4ECDC4';
      case 'carbs': return '#45B7D1';
      case 'fat': return '#96CEB4';
      default: return '#FF6B6B';
    }
  };

  // Streak rewards system
  const getStreakReward = (days: number) => {
    if (days >= 180) return { emoji: '🏅', title: 'Legendary Badge', message: '6 MONTHS streak! You earned a legendary badge.' };
    if (days >= 150) return { emoji: '🌟', title: 'Shining Star', message: '5 months streak! You\'re inspiring others.' };
    if (days >= 120) return { emoji: '🥉', title: 'Bronze Medal', message: '4 months streak! You\'re unstoppable.' };
    if (days >= 90) return { emoji: '🥇', title: 'Gold Medal', message: '3 months streak! You\'re among the top users.' };
    if (days >= 60) return { emoji: '🏆', title: 'Trophy', message: '2 months streak! This is champion level.' };
    if (days >= 30) return { emoji: '💕', title: 'Heart', message: '1 month streak! You\'re building a healthy habit.' };
    if (days >= 14) return { emoji: '😍', title: 'Love Eyes', message: '2 weeks strong, we love your commitment.' };
    if (days >= 7) return { emoji: '🤪', title: 'Goofy', message: '1 week streak! Wow, keep it up!' };
    if (days >= 3) return { emoji: '✨', title: 'Spark', message: 'You\'re getting consistent!' };
    if (days >= 1) return { emoji: '🔥', title: 'Fire Start', message: 'You\'ve started your journey!' };
    return { emoji: '🌱', title: 'New Beginning', message: 'Start your healthy journey today!' };
  };

  const currentReward = getStreakReward(streakCount);

  const handleAvatarPress = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // Open gallery directly
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Keep using MediaTypeOptions for now
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        
        setUploading(true);
        
        try {
          // Upload to Firebase Storage
          const imageUrl = await uploadImageToFirebase(selectedImage);
          
          // Update Firestore profile
          await updateUserProfileImage(imageUrl);
          
          // Update local state
          setProfileImage(imageUrl);
          
          Alert.alert('Success', 'Profile image updated successfully!');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          
          // Better error handling for Firebase Storage
          if (uploadError instanceof Error) {
            if (uploadError.message.includes('storage/unauthorized')) {
              Alert.alert('Error', 'Storage access denied. Please check your Firebase rules.');
            } else if (uploadError.message.includes('storage/quota-exceeded')) {
              Alert.alert('Error', 'Storage quota exceeded. Please try a smaller image.');
            } else {
              Alert.alert('Error', 'Failed to upload image. Please try again.');
            }
          } else {
            Alert.alert('Error', 'Failed to upload image. Please try again.');
          }
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleImageChange = (option: 'camera' | 'gallery' | 'avatar') => {
    setShowImageModal(false);
    
    switch (option) {
      case 'camera':
        Alert.alert('Camera', 'Camera functionality will be implemented here');
        break;
      case 'gallery':
        handleAvatarPress(); // Direct gallery access
        break;
      case 'avatar':
        Alert.alert('Avatar', 'Avatar selection will be implemented here');
        break;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handleAvatarPress}
            disabled={uploading}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <FontAwesome name="user" size={40} color="#007AFF" />
              </View>
            )}
            <View style={styles.editOverlay}>
              {uploading ? (
                <Text style={styles.editText}>Uploading...</Text>
              ) : (
                <Text style={styles.editText}>Edit</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>
            {userProfile?.firstName || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {userProfile?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Basic Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{userProfile?.age || '--'} years</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>{userProfile?.height || '--'} cm</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{userProfile?.weight || '--'} kg</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Gender</Text>
              <Text style={styles.statValue}>{userProfile?.gender || '--'}</Text>
            </View>
          </View>
        </View>

        {/* Goals & Preferences */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Goals & Preferences</Text>
          <View style={styles.goalCards}>
            <View style={styles.goalCard}>
              <Text style={styles.goalEmoji}>
                {getGoalEmoji(userProfile?.goal || '')}
              </Text>
              <Text style={styles.goalTitle}>Primary Goal</Text>
              <Text style={styles.goalValue}>
                {userProfile?.goal || 'Not set'}
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalEmoji}>
                {getWorkoutEmoji(userProfile?.workouts || '')}
              </Text>
              <Text style={styles.goalTitle}>Workout Frequency</Text>
              <Text style={styles.goalValue}>
                {userProfile?.workouts || 'Not set'}
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalEmoji}>
                {getDietEmoji(userProfile?.specificGoal || '')}
              </Text>
              <Text style={styles.goalTitle}>Diet Preference</Text>
              <Text style={styles.goalValue}>
                {userProfile?.specificGoal || 'Not set'}
              </Text>
            </View>
          </View>
          {userProfile?.desiredWeight && (
            <View style={styles.targetWeightCard}>
              <Text style={styles.targetWeightLabel}>Target Weight</Text>
              <Text style={styles.targetWeightValue}>
                {userProfile.desiredWeight} kg
              </Text>
            </View>
          )}
        </View>

        {/* Daily Nutrition Targets */}
        {nutritionPlan && (
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
            <View style={styles.nutritionGrid}>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('calories') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="flame" size={24} color={getNutritionColor('calories')} />
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.calories}</Text>
                <Text style={styles.nutritionUnit}>kcal</Text>
              </View>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('protein') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="flash" size={24} color={getNutritionColor('protein')} />
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.protein}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('carbs') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="leaf" size={24} color={getNutritionColor('carbs')} />
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.carbs}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('fat') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="water" size={24} color={getNutritionColor('fat')} />
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.fat}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
            </View>
            
            {/* BMR & TDEE Info */}
            <View style={styles.metabolicInfo}>
              <View style={styles.metabolicCard}>
                <Text style={styles.metabolicLabel}>BMR</Text>
                <Text style={styles.metabolicValue}>{nutritionPlan.bmr} kcal/day</Text>
                <Text style={styles.metabolicDescription}>Basal Metabolic Rate</Text>
              </View>
              <View style={styles.metabolicCard}>
                <Text style={styles.metabolicLabel}>TDEE</Text>
                <Text style={styles.metabolicValue}>{nutritionPlan.tdee} kcal/day</Text>
                <Text style={styles.metabolicDescription}>Total Daily Energy Expenditure</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Tracking Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress Tracking</Text>
          
          {/* Streak Counter */}
          <View style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakTitle}>Current Streak</Text>
            </View>
            <Text style={styles.streakCount}>{streakCount} Days</Text>
            <Text style={styles.streakStatus}>
              {streakBroken ? 'Streak broken - start fresh!' : 
               streakAtRisk ? 'Keep going, don\'t break the streak!' : 
               'Amazing consistency!'}
            </Text>
          </View>

          {/* Current Reward */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardEmoji}>{currentReward.emoji}</Text>
              <Text style={styles.rewardTitle}>{currentReward.title}</Text>
            </View>
            <Text style={styles.rewardMessage}>{currentReward.message}</Text>
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyProgressCard}>
            <Text style={styles.weeklyTitle}>Weekly Progress</Text>
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>7</Text>
                <Text style={styles.weeklyStatLabel}>Days Logged</Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>85%</Text>
                <Text style={styles.weeklyStatLabel}>Goal Achievement</Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>+2.1</Text>
                <Text style={styles.weeklyStatLabel}>Weight Change (kg)</Text>
              </View>
            </View>
          </View>

          {/* Monthly Achievement */}
          <View style={styles.monthlyCard}>
            <Text style={styles.monthlyTitle}>Monthly Achievement</Text>
            <View style={styles.achievementRow}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🎯</Text>
                <Text style={styles.achievementText}>Calorie Goal</Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>💪</Text>
                <Text style={styles.achievementText}>Protein Target</Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🌱</Text>
                <Text style={styles.achievementText}>Healthy Eating</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Image Change Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.imageModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <View style={styles.placeholder} />
            </View>
            
            <View style={styles.imageOptions}>
              <TouchableOpacity 
                style={styles.imageOption}
                onPress={() => handleImageChange('camera')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera" size={32} color="#28a745" />
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imageOption}
                onPress={() => handleImageChange('gallery')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images" size={32} color="#28a745" />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.imageOption}
                onPress={() => handleImageChange('avatar')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="person-circle" size={32} color="#28a745" />
                </View>
                <Text style={styles.optionText}>Avatar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  userInfoSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  editText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    color: '#000',
    fontWeight: '600',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  goalsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  goalCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  targetWeightCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  targetWeightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  targetWeightValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  nutritionSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nutritionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  nutritionUnit: {
    fontSize: 12,
    color: '#666',
  },
  metabolicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metabolicCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metabolicLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metabolicValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  metabolicDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  streakCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  streakCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  streakStatus: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  rewardMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  weeklyProgressCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  weeklyStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  monthlyCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '80%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeModalButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  imageOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  imageOption: {
    alignItems: 'center',
    width: '30%',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});


