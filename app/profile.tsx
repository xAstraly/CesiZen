import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TABS = ['Informations', 'Historique', 'Sécurité', 'Supprimer mon compte'];

export default function Profile() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => router.push('/login'), 100);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>
      <Text style={styles.subtitle}>
        {user.prenom && user.nom ? `${user.prenom} ${user.nom.toUpperCase()}` : user.email}
      </Text>

      {/* Onglets */}
      <View style={styles.tabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setTab(i)} style={[styles.tab, tab === i && styles.tabActive]}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Onglet Informations */}
      {tab === 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.row}><Text style={styles.label}>Prénom</Text><Text style={styles.value}>{user.prenom || 'non renseigné'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Nom</Text><Text style={styles.value}>{user.nom?.toUpperCase() || 'non renseigné'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Email</Text><Text style={styles.value}>{user.email}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Rôle</Text><Text style={styles.value}>{user.is_admin ? 'Administrateur' : user.is_writer ? 'Rédacteur' : 'Utilisateur'}</Text></View>
        </View>
      )}

      {/* Onglet Historique */}
      {tab === 1 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Historique</Text>
          <Text style={styles.empty}>À venir — respiration, émotions, diagnostics</Text>
        </View>
      )}

      {/* Onglet Sécurité */}
      {tab === 2 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Authentification à deux facteurs (A2F)</Text>
          <Text style={styles.empty}>À venir</Text>
        </View>
      )}

      {/* Onglet Suppression */}
      {tab === 3 && (
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.dangerTitle}>Supprimer mon compte</Text>
          <Text style={styles.dangerText}>Cette action est irréversible. Toutes vos données seront supprimées.</Text>
          <TouchableOpacity style={styles.dangerBtn}>
            <Text style={styles.dangerBtnText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef0f8', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#4a4a6a', marginBottom: 24 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 2, borderBottomColor: '#d0d5e8', marginBottom: 20, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1a2060' },
  tabText: { fontSize: 14, color: '#4a4a6a' },
  tabTextActive: { fontWeight: '600', color: '#1a2060' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#4a4a6a', marginBottom: 16 },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { width: 100, fontSize: 14, color: '#888' },
  value: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a2e' },
  empty: { color: '#888', fontSize: 14, fontStyle: 'italic' },
  dangerCard: { borderLeftWidth: 4, borderLeftColor: '#c0392b' },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: '#c0392b', marginBottom: 8 },
  dangerText: { fontSize: 14, color: '#4a4a6a', marginBottom: 16 },
  dangerBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#c0392b', borderRadius: 6, padding: 12, alignItems: 'center' },
  dangerBtnText: { color: '#c0392b', fontWeight: '600' },
});
