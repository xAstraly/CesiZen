import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../constants/api';

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) { setError('Veuillez saisir votre email.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.dev_code) setDevCode(data.dev_code);
      setStep('code');
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!code.trim() || !newPassword) { setError('Tous les champs sont requis.'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (newPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Erreur.'); return; }
      setSuccess('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.icon}>✅</Text>
          <Text style={styles.title}>Mot de passe mis à jour</Text>
          <Text style={styles.successText}>{success}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/login')}>
            <Text style={styles.btnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>Mot de passe oublié</Text>

          {step === 'email' ? (
            <>
              <Text style={styles.hint}>
                Saisissez votre email. Un code de réinitialisation vous sera envoyé.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSendCode} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Envoi...' : 'Envoyer le code'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.hint}>
                Saisissez le code reçu et choisissez un nouveau mot de passe.
              </Text>

              {devCode ? (
                <View style={styles.devBanner}>
                  <Text style={styles.devLabel}>Mode développement — code :</Text>
                  <Text style={styles.devCode}>{devCode}</Text>
                </View>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Code à 6 chiffres"
                placeholderTextColor="#aaa"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#aaa"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#aaa"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleReset} disabled={loading}>
                <Text style={styles.btnText}>{loading ? 'Réinitialisation...' : 'Réinitialiser'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('email'); setError(''); setDevCode(''); }}>
                <Text style={styles.back}>← Changer d'email</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef0f8', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 16 },
  hint: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#d0d5e8', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a2e', backgroundColor: '#f8f9fc', marginBottom: 14 },
  btn: { backgroundColor: '#000091', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 14 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  back: { color: '#000091', fontSize: 14, textAlign: 'center', marginTop: 4, paddingVertical: 6 },
  error: { color: '#c0392b', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  successText: { color: '#1e7e34', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  devBanner: { backgroundColor: '#fff8e1', borderRadius: 8, padding: 12, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: '#f0b429' },
  devLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  devCode: { fontSize: 28, fontWeight: 'bold', color: '#000091', letterSpacing: 8 },
});
