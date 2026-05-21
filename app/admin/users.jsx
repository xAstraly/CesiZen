import { useAuth } from '@/context/AuthContext';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../constants/api';

export default function AdminUsers() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState(null);
  const savedTimer = useRef(null);

  const load = () => {
    fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setUsers(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (!user) return <Redirect href="/login" />;
  if (!user.is_admin) return <Redirect href="/" />;

  const updateUser = async (id, changes) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const updated = { ...target, ...changes };
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          is_admin: updated.is_admin,
          is_writer: updated.is_writer,
          is_active: updated.is_active,
        }),
      });
      const data = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? data : u)));
      setSavedId(id);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedId(null), 2000);
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour.');
    }
  };

  const handleDelete = (id, nom) => {
    Alert.alert('Supprimer', `Supprimer ${nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const res = await fetch(`${API_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) { Alert.alert('Erreur', data.message); return; }
          setUsers((prev) => prev.filter((u) => u.id !== id));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000091" />
      </View>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) =>
        `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q)
      )
    : users;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/admin')}>
        <Text style={styles.backLink}>← Retour à la rédaction</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Gestion des utilisateurs</Text>
      <Text style={styles.subtitle}>{users.length} utilisateur{users.length > 1 ? 's' : ''}</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, prénom ou email…"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity style={styles.searchClear} onPress={() => setSearch('')}>
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 && (
        <Text style={styles.emptyText}>Aucun utilisateur ne correspond à « {search} ».</Text>
      )}

      {filtered.map((u) => {
        const isSelf = u.id === user?.id;
        return (
          <View key={u.id} style={[styles.card, isSelf && styles.cardSelf]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  {u.prenom} {u.nom?.toUpperCase()}
                  {isSelf && <Text style={styles.selfBadge}> (vous)</Text>}
                </Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <View style={[styles.statusBadge, u.is_active ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, u.is_active ? styles.statusTextActive : styles.statusTextInactive]}>
                  {u.is_active ? 'Actif' : 'Inactif'}
                </Text>
              </View>
            </View>

            {/* Toggles */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Actif</Text>
                <Switch
                  value={!!u.is_active}
                  onValueChange={(val) => updateUser(u.id, { is_active: val })}
                  disabled={isSelf}
                  trackColor={{ true: '#1e7e34' }}
                />
              </View>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Rédacteur</Text>
                <Switch
                  value={!!u.is_writer}
                  onValueChange={(val) => updateUser(u.id, { is_writer: val })}
                  disabled={isSelf}
                  trackColor={{ true: '#000091' }}
                />
              </View>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Admin</Text>
                <Switch
                  value={!!u.is_admin}
                  onValueChange={(val) => updateUser(u.id, { is_admin: val })}
                  disabled={isSelf}
                  trackColor={{ true: '#dc3545' }}
                />
              </View>
            </View>

            {savedId === u.id && (
              <Text style={styles.savedText}>✓ Sauvegardé</Text>
            )}

            {!isSelf && (
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => handleDelete(u.id, `${u.prenom} ${u.nom}`)}
              >
                <Text style={styles.btnDeleteText}>🗑 Supprimer ce compte</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 16, paddingBottom: 40 },
  centered: { flex: 1, backgroundColor: '#eef0f8', justifyContent: 'center', alignItems: 'center' },
  backLink: { fontSize: 14, color: '#000091', fontWeight: '600', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000091', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardSelf: { borderWidth: 2, borderColor: '#000091' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  userName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  selfBadge: { fontSize: 13, color: '#000091', fontWeight: '400' },
  userEmail: { fontSize: 13, color: '#666' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  statusActive: { backgroundColor: '#e8f5e9' },
  statusInactive: { backgroundColor: '#fdecea' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextActive: { color: '#1e7e34' },
  statusTextInactive: { color: '#c0392b' },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  toggleItem: { alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 12, color: '#555', fontWeight: '500' },

  btnDelete: { backgroundColor: '#fdecea', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  btnDeleteText: { color: '#c0392b', fontSize: 13, fontWeight: '600' },
  savedText: { color: '#1e7e34', fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 8 },

  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 12, marginBottom: 16 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#333' },
  searchClear: { padding: 4 },
  searchClearText: { color: '#aaa', fontSize: 16 },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', marginBottom: 16 },
});
