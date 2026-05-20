import { useAuth } from '@/context/AuthContext';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../../constants/api';

const CATEGORIES = ['Vie personnelle', 'Travail', 'Santé', 'Finances', 'Famille', 'Social', 'Général'];

export default function AdminStressEvents() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [byCategory, setByCategory] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: '', points: '', category: 'Général' });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <Redirect href="/login" />;
  if (!user.is_admin) return <Redirect href="/" />;

  const load = () => {
    fetch(`${API_URL}/stress/events`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data || []);
        const grouped = {};
        (data || []).forEach((e) => {
          const cat = e.category || 'Général';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(e);
        });
        setByCategory(grouped);
      })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.label.trim() || !form.points) return;
    setSubmitting(true);
    try {
      const url = editing ? `${API_URL}/stress/events/${editing.id}` : `${API_URL}/stress/events`;
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ label: form.label.trim(), points: parseInt(form.points), category: form.category }),
      });
      setForm({ label: '', points: '', category: 'Général' });
      setEditing(null);
      load();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ev) => {
    setEditing(ev);
    setForm({ label: ev.label, points: String(ev.points), category: ev.category || 'Général' });
  };

  const handleDelete = (id, label) => {
    const doDelete = async () => {
      await fetch(`${API_URL}/stress/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      load();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer "${label}" ?`)) doDelete();
    } else {
      Alert.alert('Supprimer', `Supprimer "${label}" ?`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/admin')}>
        <Text style={styles.backLink}>← Retour à la rédaction</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Événements de stress</Text>
      <Text style={styles.subtitle}>Échelle Holmes & Rahe — {events.length} événements</Text>

      {/* Formulaire */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{editing ? 'Modifier l\'événement' : 'Nouvel événement'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Libellé de l'événement"
          placeholderTextColor="#aaa"
          value={form.label}
          onChangeText={(v) => setForm({ ...form, label: v })}
        />
        <TextInput
          style={styles.input}
          placeholder="Points (ex: 73)"
          placeholderTextColor="#aaa"
          value={form.points}
          onChangeText={(v) => setForm({ ...form, points: v })}
          keyboardType="number-pad"
        />
        <Text style={styles.fieldLabel}>Catégorie</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setForm({ ...form, category: cat })}
              style={[styles.chip, form.category === cat && styles.chipActive]}
            >
              <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.formBtns}>
          <TouchableOpacity
            style={[styles.btnPrimary, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !form.label.trim() || !form.points}
          >
            <Text style={styles.btnPrimaryText}>{submitting ? 'Sauvegarde...' : editing ? 'Enregistrer' : 'Créer'}</Text>
          </TouchableOpacity>
          {editing && (
            <TouchableOpacity style={styles.btnCancel} onPress={() => { setEditing(null); setForm({ label: '', points: '', category: 'Général' }); }}>
              <Text style={styles.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste par catégorie */}
      {Object.entries(byCategory).map(([cat, evs]) => (
        <View key={cat} style={styles.catSection}>
          <Text style={styles.catTitle}>{cat}</Text>
          {evs.map((ev) => (
            <View key={ev.id} style={[styles.card, editing?.id === ev.id && styles.cardEditing]}>
              <View style={styles.cardTop}>
                <Text style={styles.cardLabel}>{ev.label}</Text>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>{ev.points} pts</Text>
                </View>
              </View>
              <View style={styles.cardBtns}>
                <TouchableOpacity style={styles.btnEdit} onPress={() => handleEdit(ev)}>
                  <Text style={styles.btnEditText}>✏️ Éditer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(ev.id, ev.label)}>
                  <Text style={styles.btnDeleteText}>🗑 Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 16, paddingBottom: 40 },
  backLink: { fontSize: 14, color: '#000091', fontWeight: '600', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000091', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fafafa' },
  chipActive: { backgroundColor: '#000091', borderColor: '#000091' },
  chipText: { fontSize: 12, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  formBtns: { flexDirection: 'row', gap: 10 },
  btnPrimary: { backgroundColor: '#000091', borderRadius: 8, paddingVertical: 11, paddingHorizontal: 20, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  btnCancel: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 11, paddingHorizontal: 16 },
  btnCancelText: { color: '#555', fontSize: 14 },
  catSection: { marginBottom: 16 },
  catTitle: { fontSize: 13, fontWeight: '700', color: '#000091', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#000091', elevation: 1 },
  cardEditing: { borderLeftColor: '#f0b429', backgroundColor: '#fffef0' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardLabel: { flex: 1, fontSize: 14, color: '#1a1a2e', fontWeight: '500', marginRight: 8 },
  pointsBadge: { backgroundColor: '#e8eaf6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  pointsText: { fontSize: 13, color: '#000091', fontWeight: '700' },
  cardBtns: { flexDirection: 'row', gap: 8 },
  btnEdit: { backgroundColor: '#e8f0fe', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10 },
  btnEditText: { color: '#000091', fontSize: 12, fontWeight: '500' },
  btnDelete: { backgroundColor: '#fdecea', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 10 },
  btnDeleteText: { color: '#c0392b', fontSize: 12, fontWeight: '500' },
});
