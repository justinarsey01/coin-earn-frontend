import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

import { useUser } from '../context/UserContext';
import { useRouter } from 'expo-router';

import { apiRequest } from '../services/api';
import { Colors } from '../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();

  // ====================================================
  // USER CONTEXT
  // ====================================================

  const { login } = useUser();

  // ====================================================
  // STATE
  // ====================================================

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // ====================================================
  // FORGOT PASSWORD
  // ====================================================

  const handleForgotPassword =
    async () => {
      if (!email.trim()) {
        Alert.alert(
          'Forgot Password',
          'Please enter your email address first.'
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await apiRequest(
            '/auth/forgot-password',
            {
              method: 'POST',

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),
              }),
            }
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Unable to send reset email'
          );
        }

        Alert.alert(
          'Check Your Email',
          'If an account exists with this email, a password reset link has been sent.'
        );
      } catch (error: any) {
        console.error(
          'Forgot password error:',
          error
        );

        Alert.alert(
          'Error',
          error?.message ||
            'Something went wrong'
        );
      } finally {
        setLoading(false);
      }
    };

  // ====================================================
  // LOGIN
  // ====================================================

  const handleLogin =
    async () => {
      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

      if (
        !email.trim() ||
        !password.trim()
      ) {
        Alert.alert(
          'Error',
          'Please enter email and password'
        );

        return;
      }

      try {
        setLoading(true);

        console.log(
          'Starting login...'
        );

        // ----------------------------------------------
        // LOGIN THROUGH USER CONTEXT
        // ----------------------------------------------

        const success =
          await login(
            email,
            password
          );

        console.log(
          'LOGIN RESULT:',
          success
        );

        // ----------------------------------------------
        // LOGIN FAILED
        // ----------------------------------------------

        if (!success) {
          Alert.alert(
            'Login Failed',
            'Invalid email or password. Please try again.'
          );

          return;
        }

        // ----------------------------------------------
        // LOGIN SUCCESSFUL
        // ----------------------------------------------

        Alert.alert(
          'Welcome Back!',
          'You have successfully logged in.',
          [
            {
              text: 'Continue',

              onPress: () => {
                router.replace(
                  '/(tabs)'
                );
              },
            },
          ]
        );
      } catch (error: any) {
        console.error(
          'Login error:',
          error
        );

        Alert.alert(
          'Login Failed',
          error?.message ||
            'Unable to login. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.keyboard}
      >
        <View style={styles.box}>

          {/* TITLE */}

          <Text
            style={styles.title}
          >
            Welcome Back
          </Text>

          <Text
            style={styles.subtitle}
          >
            Login to continue earning
          </Text>

          {/* EMAIL */}

          <Text
            style={styles.label}
          >
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="john@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          {/* PASSWORD */}

          <Text
            style={styles.label}
          >
            Password
          </Text>

          <View
            style={styles.passwordContainer}
          >
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={
                !showPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(
                  !showPassword
                )
              }
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={22}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* FORGOT PASSWORD */}

          <TouchableOpacity
            onPress={
              handleForgotPassword
            }
            disabled={loading}
          >
            <Text
              style={
                styles.forgotPassword
              }
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}

          <TouchableOpacity
            style={[
              styles.button,

              loading &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleLogin
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.white
                }
              />
            ) : (
              <Text
                style={
                  styles.buttonText
                }
              >
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* REGISTER */}

          <TouchableOpacity
            onPress={() =>
              router.push(
                '/register'
              )
            }
            disabled={loading}
          >
            <Text
              style={styles.link}
            >
              Don't have an account?{' '}
              <Text
                style={
                  styles.linkBold
                }
              >
                Register
              </Text>
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ====================================================
// STYLES
// ====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    keyboard: {
      flex: 1,
      justifyContent:
        'center',
    },

    box: {
      padding: 24,
    },

    title: {
      fontSize: 28,
      fontWeight: '800',
      color: Colors.text,
      textAlign: 'center',
    },

    subtitle: {
      fontSize: 15,
      color: Colors.gray,
      marginTop: 6,
      marginBottom: 30,
      textAlign: 'center',
    },

    label: {
      fontSize: 14,
      fontWeight: '600',
      color: Colors.text,
      marginBottom: 6,
    },

    input: {
      backgroundColor:
        Colors.white,

      borderRadius: 12,

      padding: 14,

      fontSize: 16,

      color: Colors.text,

      borderWidth: 1,

      borderColor:
        '#E2E8F0',

      marginBottom: 16,
    },

    // ==================================================
    // PASSWORD
    // ==================================================

    passwordContainer: {
      position: 'relative',
      marginBottom: 16,
    },

    passwordInput: {
      backgroundColor:
        Colors.white,

      borderRadius: 12,

      padding: 14,

      paddingRight: 50,

      fontSize: 16,

      color: Colors.text,

      borderWidth: 1,

      borderColor:
        '#E2E8F0',
    },

    eyeButton: {
      position: 'absolute',

      right: 14,

      top: 0,

      bottom: 0,

      justifyContent:
        'center',

      alignItems:
        'center',
    },

    // ==================================================
    // FORGOT PASSWORD
    // ==================================================

    forgotPassword: {
      textAlign: 'right',

      color:
        Colors.primary,

      fontSize: 14,

      fontWeight: '600',

      marginBottom: 10,
    },

    // ==================================================
    // LOGIN BUTTON
    // ==================================================

    button: {
      backgroundColor:
        Colors.primary,

      borderRadius: 12,

      padding: 16,

      alignItems: 'center',

      justifyContent:
        'center',

      minHeight: 52,

      marginTop: 10,
    },

    buttonDisabled: {
      opacity: 0.7,
    },

    buttonText: {
      color:
        Colors.white,

      fontSize: 16,

      fontWeight: '700',
    },

    // ==================================================
    // REGISTER LINK
    // ==================================================

    link: {
      textAlign: 'center',

      color:
        Colors.gray,

      marginTop: 24,

      fontSize: 15,
    },

    linkBold: {
      color:
        Colors.primary,

      fontWeight: '700',
    },
  });