import { useAuth } from '@/context/AuthContext';
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

export default function SignupPage() {
  const { login } = useAuth();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cguAccepted, setCguAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!prenom.trim() || !nom.trim() || !email.trim() || !password.trim()) {
      setError('Tous les champs sont requis.');
      return;
    }
    if (!cguAccepted) {
      setError('Vous devez accepter les CGU pour vous inscrire.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, nom, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Erreur lors de l'inscription");
        return;
      }
      await login(data.token, data.user);
      router.push('/');
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Créer un compte</Text>

          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Prénom"
              placeholderTextColor="#aaa"
              value={prenom}
              onChangeText={setPrenom}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nom"
              placeholderTextColor="#aaa"
              value={nom}
              onChangeText={setNom}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Adresse e-mail"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Case CGU */}
          <TouchableOpacity
            style={styles.cguRow}
            onPress={() => setCguAccepted(!cguAccepted)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: cguAccepted }}
          >
            <View style={[styles.checkbox, cguAccepted && styles.checkboxChecked]}>
              {cguAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.cguText}>
              J'ai lu et j'accepte les{' '}
              <Text style={styles.cguLink} onPress={() => router.push('/cgu' as any)}>
                Conditions Générales d'Utilisation
              </Text>
              {' '}et la{' '}
              <Text style={styles.cguLink} onPress={() => router.push('/politique-confidentialite' as any)}>
                Politique de confidentialité
              </Text>
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, (!cguAccepted || loading) && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={!cguAccepted || loading}
          >
            <Text style={styles.btnText}>{loading ? 'Inscription...' : "S'inscrire"}</Text>
          </TouchableOpacity>

          <Text style={styles.loginLink}>
            Déjà un compte ?{' '}
            <Text style={styles.loginLinkBold} onPress={() => router.push('/login')}>
              Se connecter
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', gap: 10 },
  input: { borderWidth: 1, borderColor: '#d0d5e8', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1a1a2e', backgroundColor: '#f8f9fc', marginBottom: 14 },
  cguRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: '#000091', borderColor: '#000091' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cguText: { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
  cguLink: { color: '#000091', fontWeight: '600', textDecorationLine: 'underline' },
  errorText: { color: '#c0392b', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  btn: { backgroundColor: '#000091', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loginLink: { textAlign: 'center', fontSize: 14, color: '#555' },
  loginLinkBold: { color: '#000091', fontWeight: '600' },
});
