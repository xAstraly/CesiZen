import { useAuth } from '@/context/AuthContext';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../constants/api';

export default function AdminPanel() {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titre: '', contenu: '', categorie: '', lien: '' });
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState('');

  const load = () => {
    fetch(`${API_URL}/articles`)
      .then((r) => r.json())
      .then((data) => setItems(data || []))
      .catch(() => {});
  };

  const loadCategories = () => {
    fetch(`${API_URL}/articles/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(data || []))
      .catch(() => {});
  };

  useEffect(() => { load(); loadCategories(); }, []);

  // Protection accès (après les hooks)
  if (!user) return <Redirect href="/login" />;
  if (!user.is_writer && !user.is_admin) return <Redirect href="/" />;

  const handleEdit = (it) => {
    setEditing(it);
    setForm({ titre: it.titre, contenu: it.contenu, categorie: it.categorie || '', lien: it.lien || '' });
  };

  const handleDelete = (id) => {
    const doDelete = async () => {
      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        Platform.OS === 'web'
          ? window.alert(data.message || 'Impossible de supprimer.')
          : Alert.alert('Erreur', data.message || 'Impossible de supprimer.');
        return;
      }
      load();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer cet article ?')) doDelete();
    } else {
      Alert.alert('Supprimer', 'Supprimer cet article ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!form.titre.trim() || !form.contenu.trim()) {
      Alert.alert('Erreur', 'Le titre et le contenu sont requis.');
      return;
    }
    setSubmitting(true);
    try {
      const url = editing ? `${API_URL}/articles/${editing.id}` : `${API_URL}/articles`;
      const method = editing ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      setForm({ titre: '', contenu: '', categorie: '', lien: '' });
      setEditing(null);
      load();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ titre: '', contenu: '', categorie: '', lien: '' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rédaction — Articles</Text>

      {user?.is_admin && (
        <View style={styles.adminLinks}>
          <TouchableOpacity style={styles.adminLink} onPress={() => router.push('/admin/users')}>
            <Text style={styles.adminLinkText}>👥 Gérer les utilisateurs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminLink} onPress={() => router.push('/admin/stress-events')}>
            <Text style={styles.adminLinkText}>📋 Événements de stress</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Formulaire */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{editing ? 'Modifier l\'article' : 'Nouvel article'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Titre"
          placeholderTextColor="#aaa"
          value={form.titre}
          onChangeText={(v) => setForm({ ...form, titre: v })}
        />
        <Text style={styles.fieldLabel}>Catégorie</Text>
        <View style={styles.chipRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setForm({ ...form, categorie: form.categorie === cat.name ? '' : cat.name })}
              style={[styles.chip, form.categorie === cat.name && styles.chipActive]}
            >
              <Text style={[styles.chipText, form.categorie === cat.name && styles.chipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Lien source (facultatif)"
          placeholderTextColor="#aaa"
          value={form.lien}
          onChangeText={(v) => setForm({ ...form, lien: v })}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TextInput
          style={styles.textarea}
          placeholder="Contenu"
          placeholderTextColor="#aaa"
          value={form.contenu}
          onChangeText={(v) => setForm({ ...form, contenu: v })}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <View style={styles.formBtns}>
          <TouchableOpacity
            style={[styles.btnPrimary, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.btnPrimaryText}>
              {submitting ? 'Sauvegarde...' : editing ? 'Enregistrer' : 'Créer'}
            </Text>
          </TouchableOpacity>
          {editing && (
            <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
              <Text style={styles.btnCancelText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Gestion des catégories (admin uniquement) */}
      {user?.is_admin && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Gérer les catégories</Text>

          <View style={styles.catList}>
            {categories.map((cat) => (
              <View key={cat.id} style={styles.catRow}>
                <Text style={styles.catName}>{cat.name}</Text>
                <TouchableOpacity
                  style={styles.catDeleteBtn}
                  onPress={() => {
                    const doDelete = async () => {
                      await fetch(`${API_URL}/articles/categories/${cat.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (form.categorie === cat.name) setForm({ ...form, categorie: '' });
                      loadCategories();
                    };
                    if (Platform.OS === 'web') {
                      if (window.confirm(`Supprimer la catégorie "${cat.name}" ?`)) doDelete();
                    } else {
                      Alert.alert('Supprimer', `Supprimer la catégorie "${cat.name}" ?`, [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
                      ]);
                    }
                  }}
                >
                  <Text style={styles.catDeleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.catAddRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Nouvelle catégorie..."
              placeholderTextColor="#aaa"
              value={newCatName}
              onChangeText={(v) => { setNewCatName(v); setCatError(''); }}
            />
            <TouchableOpacity
              style={[styles.btnPrimary, { paddingHorizontal: 16 }, catSubmitting && styles.btnDisabled]}
              disabled={catSubmitting || !newCatName.trim()}
              onPress={async () => {
                setCatSubmitting(true);
                setCatError('');
                const res = await fetch(`${API_URL}/articles/categories`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ name: newCatName.trim() }),
                });
                const data = await res.json();
                if (!res.ok) { setCatError(data.message || 'Erreur'); }
                else { setNewCatName(''); loadCategories(); }
                setCatSubmitting(false);
              }}
            >
              <Text style={styles.btnPrimaryText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          {catError ? <Text style={styles.catError}>{catError}</Text> : null}
        </View>
      )}

      {/* Liste des articles */}
      <Text style={styles.sectionTitle}>Articles existants ({items.length})</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Aucun article.</Text>
      ) : (
        items.map((it) => (
          <View key={it.id} style={[styles.card, editing?.id === it.id && styles.cardEditing]}>
            <Text style={styles.cardTitle}>{it.titre}</Text>
            {it.categorie ? <Text style={styles.cardCategory}>{it.categorie}</Text> : null}
            <View style={styles.cardBtns}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => handleEdit(it)}>
                <Text style={styles.btnEditText}>✏️ Éditer</Text>
              </TouchableOpacity>
              {user?.is_admin && (
                <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(it.id)}>
                  <Text style={styles.btnDeleteText}>🗑 Supprimer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000091', marginBottom: 16 },

  adminLinks: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  adminLink: { borderWidth: 1, borderColor: '#000091', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  adminLinkText: { color: '#000091', fontSize: 13, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fafafa' },
  chipActive: { backgroundColor: '#000091', borderColor: '#000091' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10 },
  textarea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#333', backgroundColor: '#fafafa', marginBottom: 10, minHeight: 120 },
  formBtns: { flexDirection: 'row', gap: 10 },
  btnPrimary: { backgroundColor: '#000091', borderRadius: 8, paddingVertical: 11, paddingHorizontal: 20, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  btnCancel: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 11, paddingHorizontal: 16 },
  btnCancelText: { color: '#555', fontSize: 14 },

  catList: { marginBottom: 12, gap: 6 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f5f5f5', borderRadius: 6 },
  catName: { fontSize: 14, color: '#333' },
  catDeleteBtn: { padding: 4 },
  catDeleteText: { color: '#c0392b', fontSize: 14, fontWeight: '700' },
  catAddRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  catError: { color: '#c0392b', fontSize: 12, marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#555', marginBottom: 10 },
  emptyText: { color: '#999', fontStyle: 'italic' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#1e5c1e', elevation: 1 },
  cardEditing: { borderLeftColor: '#000091', backgroundColor: '#f0f0ff' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 2 },
  cardCategory: { fontSize: 12, color: '#888', marginBottom: 8 },
  cardBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btnEdit: { backgroundColor: '#e8f0fe', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  btnEditText: { color: '#000091', fontSize: 13, fontWeight: '500' },
  btnDelete: { backgroundColor: '#fdecea', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  btnDeleteText: { color: '#c0392b', fontSize: 13, fontWeight: '500' },
});
