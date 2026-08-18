import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';

import {
  Ionicons,
} from '@expo/vector-icons';

import { useUser } from '../context/UserContext';

import { Colors } from '../constants/Colors';

import { apiRequest } from '../services/api';

export default function EditProfileScreen() {
  const router =
    useRouter();

  const {
    user,
    refreshProfile,
  } = useUser();

  // ======================================================
  // FORM
  // ======================================================

  const [
    firstName,
    setFirstName,
  ] = useState(
    user?.firstName || ''
  );

  const [
    lastName,
    setLastName,
  ] = useState(
    user?.lastName || ''
  );

  const [
    phone,
    setPhone,
  ] = useState(
    user?.phone || ''
  );

  // ======================================================
  // IMAGE
  // ======================================================

  const [
    profileImage,
    setProfileImage,
  ] = useState<
    string | null
  >(null);

  // ======================================================
  // LOADING
  // ======================================================

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  // ======================================================
  // SELECT PROFILE IMAGE
  // ======================================================

  const selectProfileImage =
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            'Permission Required',
            'Please allow access to your photos to choose a profile picture.'
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ['images'],

              allowsEditing:
                true,

              aspect: [1, 1],

              quality: 0.8,
            }
          );

        if (
          result.canceled
        ) {
          return;
        }

        const uri =
          result.assets[0]
            ?.uri;

        if (uri) {
          setProfileImage(
            uri
          );
        }
      } catch (error) {
        console.log(
          'Image picker error:',
          error
        );

        Alert.alert(
          'Error',
          'Unable to select image.'
        );
      }
    };

  // ======================================================
  // SAVE PROFILE
  // ======================================================

  const saveProfile =
    async () => {
      if (
        !firstName.trim()
      ) {
        Alert.alert(
          'Error',
          'Please enter your first name.'
        );

        return;
      }

      if (
        !lastName.trim()
      ) {
        Alert.alert(
          'Error',
          'Please enter your last name.'
        );

        return;
      }

      if (
        !phone.trim()
      ) {
        Alert.alert(
          'Error',
          'Please enter your phone number.'
        );

        return;
      }

      setSaving(true);

      try {
        // ==================================================
        // UPDATE NAME + PHONE
        // ==================================================

        const response =
          await apiRequest(
            '/profile',
            {
              method: 'PATCH',

              body: JSON.stringify({
                firstName:
                  firstName.trim(),

                lastName:
                  lastName.trim(),

                phone:
                  phone.trim(),
              }),
            }
          );

        console.log(
          'PROFILE UPDATE RESPONSE:',
          response
        );

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              'Failed to update profile.'
          );
        }

// ==================================================
// UPLOAD PROFILE IMAGE
// ==================================================

if (profileImage) {

  setUploadingImage(true);

  try {

    console.log(
      '===================================='
    );

    console.log(
      'STARTING PROFILE IMAGE UPLOAD'
    );

    console.log(
      'IMAGE URI:',
      profileImage
    );

    // ==============================================
    // CREATE FORMDATA
    // ==============================================

    const formData =
      new FormData();

    formData.append(
      'avatar',
      {
        uri: profileImage,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any
    );

    console.log(
      'FORMDATA CREATED'
    );

    console.log(
      'UPLOADING TO:',
      '/profile/avatar'
    );

    // ==============================================
    // SEND IMAGE
    // ==============================================

    const imageResponse =
      await apiRequest(
        '/profile/avatar',
        {
          method: 'POST',

          body: formData,

          isFormData: true,
        }
      );

    console.log(
      '===================================='
    );

    console.log(
      'IMAGE UPLOAD RESPONSE:',
      imageResponse
    );

    console.log(
      '===================================='
    );

    // ==============================================
    // CHECK RESPONSE
    // ==============================================

    if (
      !imageResponse?.success
    ) {
      throw new Error(
        imageResponse?.message ||
          'Profile picture upload failed.'
      );
    }

    console.log(
      'PROFILE IMAGE UPLOAD SUCCESSFUL'
    );

  } finally {

    setUploadingImage(false);

  }
}

        // ==================================================
        // REFRESH PROFILE
        // ==================================================

        await refreshProfile();

        // ==================================================
        // SUCCESS
        // ==================================================

        Alert.alert(
          'Success',
          'Your profile has been updated successfully.',
          [
            {
              text: 'OK',

              onPress:
                () => {
                  router.back();
                },
            },
          ]
        );
      } catch (
        error: any
      ) {
        setUploadingImage(
          false
        );

        console.log(
          'Profile update error:',
          error
        );

        Alert.alert(
          'Update Failed',
          error?.message ||
            'Unable to update your profile.'
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  // ======================================================
  // UI
  // ======================================================

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                Colors.text
              }
            />
          </TouchableOpacity>

          <Text
            style={
              styles.title
            }
          >
            Edit Profile
          </Text>

          <View
            style={{
              width: 40,
            }}
          />
        </View>

        {/* PROFILE IMAGE */}

        <View
          style={
            styles.avatarContainer
          }
        >
          {profileImage ? (
            <Image
              source={{
                uri: profileImage,
              }}
              style={
                styles.avatar
              }
            />
          ) : user?.avatarUrl ? (
            <Image
              source={{
                uri: user.avatarUrl,
              }}
              style={
                styles.avatar
              }
            />
          ) : (
            <View
              style={
                styles.avatar
              }
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {firstName
                  ? firstName
                      .charAt(
                        0
                      )
                      .toUpperCase()
                  : 'U'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={
              styles.cameraButton
            }
            onPress={
              selectProfileImage
            }
            disabled={
              saving
            }
          >
            <Ionicons
              name="camera"
              size={20}
              color={
                Colors.white
              }
            />
          </TouchableOpacity>
        </View>

        <Text
          style={
            styles.changePhoto
          }
        >
          Tap the camera to
          change your photo
        </Text>

        {/* FIRST NAME */}

        <Text
          style={
            styles.label
          }
        >
          First Name
        </Text>

        <TextInput
          style={
            styles.input
          }
          placeholder="First name"
          placeholderTextColor="#94A3B8"
          value={
            firstName
          }
          onChangeText={
            setFirstName
          }
          editable={
            !saving
          }
        />

        {/* LAST NAME */}

        <Text
          style={
            styles.label
          }
        >
          Last Name
        </Text>

        <TextInput
          style={
            styles.input
          }
          placeholder="Last name"
          placeholderTextColor="#94A3B8"
          value={
            lastName
          }
          onChangeText={
            setLastName
          }
          editable={
            !saving
          }
        />

        {/* PHONE */}

        <Text
          style={
            styles.label
          }
        >
          Phone Number
        </Text>

        <TextInput
          style={
            styles.input
          }
          placeholder="+2348012345678"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={
            phone
          }
          onChangeText={
            setPhone
          }
          editable={
            !saving
          }
        />

        {/* EMAIL */}

        <Text
          style={
            styles.label
          }
        >
          Email
        </Text>

        <View
          style={
            styles.disabledInput
          }
        >
          <Text
            style={
              styles.disabledText
            }
          >
            {user?.email ||
              ''}
          </Text>
        </View>

        <Text
          style={
            styles.emailNote
          }
        >
          Email cannot be
          changed here.
        </Text>

        {/* SAVE */}

        <TouchableOpacity
          style={[
            styles.saveButton,

            saving &&
              styles.disabledButton,
          ]}
          onPress={
            saveProfile
          }
          disabled={
            saving
          }
        >
          {saving ? (
            <ActivityIndicator
              color={
                Colors.white
              }
            />
          ) : (
            <Text
              style={
                styles.saveText
              }
            >
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* PASSWORD */}

        <TouchableOpacity
          style={
            styles.passwordButton
          }
          onPress={() =>
            router.push(
              '/forgot-password'
            )
          }
          disabled={
            saving
          }
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={
              Colors.primary
            }
          />

          <Text
            style={
              styles.passwordText
            }
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {uploadingImage && (
          <Text
            style={
              styles.uploadingText
            }
          >
            Uploading profile
            picture...
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    scroll: {
      padding: 20,
      paddingBottom: 50,
    },

    header: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom: 25,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    title: {
      fontSize: 22,
      fontWeight: '800',
      color:
        Colors.text,
    },

    avatarContainer: {
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 8,
    },

    avatar: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor:
        Colors.primary,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    avatarText: {
      color:
        Colors.white,
      fontSize: 42,
      fontWeight:
        '800',
    },

    cameraButton: {
      position:
        'absolute',
      bottom: 0,
      right: '31%',
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        Colors.primary,
      alignItems:
        'center',
      justifyContent:
        'center',
      borderWidth: 3,
      borderColor:
        Colors.white,
    },

    changePhoto: {
      textAlign:
        'center',
      color:
        Colors.gray,
      fontSize: 13,
      marginBottom: 30,
    },

    label: {
      fontSize: 14,
      fontWeight:
        '600',
      color:
        Colors.text,
      marginBottom: 6,
    },

    input: {
      backgroundColor:
        Colors.white,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      color:
        Colors.text,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      marginBottom: 18,
    },

    disabledInput: {
      backgroundColor:
        '#E2E8F0',
      borderRadius: 12,
      padding: 14,
      marginBottom: 5,
    },

    disabledText: {
      fontSize: 16,
      color:
        '#64748B',
    },

    emailNote: {
      fontSize: 12,
      color:
        Colors.gray,
      marginBottom: 25,
    },

    saveButton: {
      backgroundColor:
        Colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems:
        'center',
      marginTop: 5,
    },

    disabledButton: {
      opacity: 0.7,
    },

    saveText: {
      color:
        Colors.white,
      fontSize: 16,
      fontWeight:
        '700',
    },

    passwordButton: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
      marginTop: 25,
      padding: 14,
    },

    passwordText: {
      color:
        Colors.primary,
      fontWeight:
        '700',
      fontSize: 15,
    },

    uploadingText: {
      textAlign:
        'center',
      color:
        Colors.gray,
      marginTop: 10,
    },
  });