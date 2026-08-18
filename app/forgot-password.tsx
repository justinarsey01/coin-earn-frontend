import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { useRouter } from 'expo-router';

import { Colors } from '../constants/Colors';

export default function ForgotPasswordScreen() {

  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  // ==========================================
  // SEND RESET EMAIL
  // ==========================================

  const handleForgotPassword =
    async () => {

      if (!email.trim()) {

        Alert.alert(
          'Email Required',
          'Please enter your email address.'
        );

        return;
      }

      setLoading(true);

      try {

        const response =
          await fetch(
            'https://coin-earn-backend.onrender.com/api/auth/forgot-password',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          'Forgot password response:',
          data
        );

        if (!response.ok) {

          throw new Error(
            data.message ||
              'Unable to send password reset email.'
          );
        }

        Alert.alert(
          'Check Your Email',
          'If an account exists with this email, a password reset link has been sent.',
          [
            {
              text: 'OK',

              onPress: () => {
                router.back();
              },
            },
          ]
        );

      } catch (error: any) {

        console.error(
          'Forgot password error:',
          error
        );

        Alert.alert(
          'Error',
          error?.message ||
            'Unable to send password reset email.'
        );

      } finally {

        setLoading(false);

      }
    };

  // ==========================================
  // UI
  // ==========================================

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

          {/* BACK */}

          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            disabled={loading}
            style={styles.backButton}
          >

            <Text
              style={styles.backText}
            >
              ← Back
            </Text>

          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.title}>
            Forgot Password?
          </Text>

          <Text style={styles.subtitle}>
            Enter your email address and
            we'll send you a link to reset
            your password.
          </Text>

          {/* EMAIL */}

          <Text style={styles.label}>
            Email Address
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

          {/* SEND BUTTON */}

          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleForgotPassword
            }
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator
                color={Colors.white}
              />

            ) : (

              <Text
                style={styles.buttonText}
              >
                Send Reset Link
              </Text>

            )}

          </TouchableOpacity>

          {/* LOGIN */}

          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            disabled={loading}
          >

            <Text style={styles.loginText}>

              Remember your password?{' '}

              <Text
                style={
                  styles.loginBold
                }
              >
                Login
              </Text>

            </Text>

          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor:
      Colors.background,
  },

  keyboard: {
    flex: 1,

    justifyContent: 'center',
  },

  box: {
    padding: 24,
  },

  backButton: {
    marginBottom: 25,
  },

  backText: {
    color: Colors.primary,

    fontSize: 16,

    fontWeight: '700',
  },

  title: {
    fontSize: 28,

    fontWeight: '800',

    color: Colors.text,
  },

  subtitle: {
    fontSize: 15,

    color: Colors.gray,

    lineHeight: 22,

    marginTop: 8,

    marginBottom: 30,
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

    borderColor: '#E2E8F0',

    marginBottom: 20,
  },

  button: {
    backgroundColor:
      Colors.primary,

    borderRadius: 12,

    padding: 16,

    alignItems: 'center',

    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: Colors.white,

    fontSize: 16,

    fontWeight: '700',
  },

  loginText: {
    textAlign: 'center',

    color: Colors.gray,

    marginTop: 25,

    fontSize: 15,
  },

  loginBold: {
    color: Colors.primary,

    fontWeight: '700',
  },

});