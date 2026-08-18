import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useUser } from '../context/UserContext';

export default function RegisterScreen() {
  const router = useRouter();

  const { register } = useUser();

  // ============================================
  // FORM STATES
  // ============================================

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [loading, setLoading] = useState(false);


  // ======================================================
// RECEIVE REFERRAL LINK
// ======================================================

useEffect(() => {
  const getReferralCode = async () => {
    try {
      const url = await Linking.getInitialURL();

      if (!url) {
        return;
      }

      console.log('INITIAL REFERRAL URL:', url);

      const parsed = Linking.parse(url);

      const ref =
        typeof parsed.queryParams?.ref === 'string'
          ? parsed.queryParams.ref
          : '';

      if (ref) {
        console.log('REFERRAL CODE RECEIVED:', ref);

        setReferralCode(ref.toUpperCase());
      }
    } catch (error) {
      console.error(
        'REFERRAL LINK ERROR:',
        error
      );
    }
  };

  getReferralCode();
}, []);
  
  // ============================================
  // REGISTER
  // ============================================

  const handleRegister = async () => {
    // --------------------------------------------
    // VALIDATE REQUIRED FIELDS
    // --------------------------------------------

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        'Error',
        'Please fill all required fields.'
      );
      return;
    }

    // --------------------------------------------
    // PASSWORD VALIDATION
    // --------------------------------------------

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters.'
      );
      return;
    }

    // --------------------------------------------
    // EMAIL VALIDATION
    // --------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        'Error',
        'Please enter a valid email address.'
      );
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // REGISTER THROUGH USER CONTEXT
      // ==========================================

      const success = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,

        // IMPORTANT:
        // This matches your backend controller:
        //
        // const {
        //   firstName,
        //   lastName,
        //   phone,
        //   email,
        //   password,
        //   referralCode,
        // } = req.body;

        referralCode: referralCode.trim()
          ? referralCode.trim().toUpperCase()
          : undefined,
      });

      console.log(
        'REGISTER RESULT:',
        success
      );

      // ==========================================
      // REGISTRATION FAILED
      // ==========================================

      if (!success) {
        throw new Error(
          'Registration failed.'
        );
      }

      // ==========================================
      // REGISTRATION SUCCESSFUL
      // ==========================================

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]
      );

    } catch (error: any) {
      console.error(
        'REGISTRATION ERROR:',
        error
      );

      Alert.alert(
        'Registration Failed',
        error?.message ||
          'Unable to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ================================== */}
          {/* TITLE */}
          {/* ================================== */}

          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join CoinEarn and start earning
          </Text>

          {/* ================================== */}
          {/* FIRST NAME */}
          {/* ================================== */}

          <Text style={styles.label}>
            First Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="John"
            placeholderTextColor="#94A3B8"
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
            autoCapitalize="words"
          />

          {/* ================================== */}
          {/* LAST NAME */}
          {/* ================================== */}

          <Text style={styles.label}>
            Last Name
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Doe"
            placeholderTextColor="#94A3B8"
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
            autoCapitalize="words"
          />

          {/* ================================== */}
          {/* PHONE */}
          {/* ================================== */}

          <Text style={styles.label}>
            Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="+234 801 234 5678"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
          />

          {/* ================================== */}
          {/* EMAIL */}
          {/* ================================== */}

          <Text style={styles.label}>
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

          {/* ================================== */}
          {/* REFERRAL CODE */}
          {/* ================================== */}

          <Text style={styles.label}>
            Referral Code (Optional)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter referral code"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            autoCorrect={false}
            value={referralCode}
            onChangeText={setReferralCode}
            editable={!loading}
          />

          <Text style={styles.referralHint}>
            Have a referral code? Enter it above.
          </Text>

          {/* ================================== */}
          {/* PASSWORD */}
          {/* ================================== */}

          <Text style={styles.label}>
            Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
            autoCapitalize="none"
          />

          {/* ================================== */}
          {/* REGISTER BUTTON */}
          {/* ================================== */}

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading
                ? 'Creating Account...'
                : 'Register'}
            </Text>
          </TouchableOpacity>

          {/* ================================== */}
          {/* LOGIN */}
          {/* ================================== */}

          <TouchableOpacity
            onPress={() =>
              router.push('/login')
            }
            disabled={loading}
          >
            <Text style={styles.link}>
              Already have an account?{' '}

              <Text style={styles.linkBold}>
                Login
              </Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scroll: {
    padding: 24,
    paddingBottom: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 20,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.gray,
    marginTop: 6,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },

  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },

  referralHint: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: -10,
    marginBottom: 16,
  },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  link: {
    textAlign: 'center',
    color: Colors.gray,
    marginTop: 24,
    fontSize: 15,
  },

  linkBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
});