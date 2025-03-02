import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Switch, Image, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { auth } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';

const Profile = () => {
  const navigation = useNavigation();
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const user = auth.currentUser;
  console.log('Profile User Data:', user); // Debug log

  const joinDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const stats = [
    { icon: "trophy-outline", value: "0", label: "Wins" },
    { icon: "cash-outline", value: "$0", label: "Total won" },
    { icon: "golf-outline", value: "$0", label: "Top win" },
  ];

  const handleEditProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photos to change profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        try {
          // Here you would typically:
          // 1. Upload the image to Firebase Storage
          // 2. Get the URL
          // 3. Update the user's photoURL
          await updateProfile(auth.currentUser, {
            photoURL: result.assets[0].uri // This is temporary, should use Firebase Storage URL
          });
          Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
          console.error('Error updating profile picture:', error);
          Alert.alert('Error', 'Failed to update profile picture');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Reauthentication helper
  const reauthenticate = async (password) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  // Update profile function
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (newDisplayName !== user.displayName) {
        await updateProfile(user, { displayName: newDisplayName });
      }

      if (newEmail !== user.email) {
        setPendingAction('email');
        setShowReauthModal(true);
        return;
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle email update after reauthentication
  const handleEmailUpdate = async () => {
    try {
      await updateEmail(auth.currentUser, newEmail);
      Alert.alert('Success', 'Email updated successfully!');
      setShowReauthModal(false);
      setIsEditMode(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Delete account function
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPendingAction('delete');
            setShowReauthModal(true);
          }
        }
      ]
    );
  };

  // Perform account deletion after reauthentication
  const handleConfirmedDelete = async () => {
    try {
      await deleteUser(auth.currentUser);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Reauthentication modal
  const ReauthModal = () => (
    <Modal
      visible={showReauthModal}
      transparent
      animationType="fade"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Please enter your password</Text>
          <TextInput
            style={styles.input}
            placeholder="Current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowReauthModal(false);
                setCurrentPassword('');
                setPendingAction(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]}
              onPress={async () => {
                try {
                  await reauthenticate(currentPassword);
                  if (pendingAction === 'email') {
                    await handleEmailUpdate();
                  } else if (pendingAction === 'delete') {
                    await handleConfirmedDelete();
                  }
                } catch (error) {
                  Alert.alert('Error', error.message);
                }
                setCurrentPassword('');
                setShowReauthModal(false);
                setPendingAction(null);
              }}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleEditProfilePicture}
          >
            <Image
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.joinDate}>Joined {joinDate}</Text>

          <View style={styles.privacyToggle}>
            <Text style={styles.privacyText}>Private Profile</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
            />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity style={[styles.tabButton, styles.activeTabButton]}>
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Stats</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabButton}>
              <Text style={styles.tabButtonText}>Open Matches</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Ionicons name={stat.icon} size={24} color="#94a3b8" style={styles.statIcon} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Favorite Courses */}
        <View style={styles.favoritesSection}>
          <Text style={styles.sectionTitle}>Favorite courses</Text>
          <View style={styles.courseGrid}>
            {/* Example courses - replace with real data */}
            <View style={styles.courseCard}>
              <Ionicons name="flag-outline" size={32} color="#fff" />
              <Text style={styles.courseName}>Augusta</Text>
              <Text style={styles.courseType}>PGA</Text>
            </View>
            {/* Add more course cards as needed */}
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Add some bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />

        {/* Delete Account Button */}
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Reauthentication Modal */}
      <ReauthModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#171717',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#171717',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 16,
    color: '#94a3b8',
  },
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statsContainer: {
    backgroundColor: '#171717',
    marginTop: 12,
    padding: 16,
    marginHorizontal: 12,
  },
  tabButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  favoritesSection: {
    padding: 16,
    backgroundColor: '#171717',
    marginTop: 12,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  courseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  courseCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
  courseType: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#171717',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  }
});

export default Profile; 