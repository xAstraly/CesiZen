import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../constants/api';

const INTENSITY_LABELS = {
  1: 'Très légère', 2: 'Légère', 3: 'Modérée', 4: 'Assez forte', 5: 'Forte',
  6: 'Assez intense', 7: 'Intense', 8: 'Très intense', 9: 'Extrême', 10: 'Maximale',
};

const CATEGORY_COLORS = {
  'Joie': '#1e7e34',
  'Tristesse': '#6c757d',
  'Peur': '#856404',
  'Colère': '#dc3545',
  'Surprise': '#0077cc',
  'Dégoût': '#6f42c1',
  'Confiance': '#000091',
  'Anticipation': '#e07800',
};

export default function Emotions() {
  const { user, token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return <Redirect href="/login" />;

  useEffect(() => {
    fetch(`${API_URL}/emotions`)
      .then((r) => r.json())
      .then((emotions) => {
        fetch(`${API_URL}/emotions/categories`)
          .then((r) => r.json())
          .then((cats) => {
            const categoriesWithEmotions = cats.map((cat) => ({
              ...cat,
              emotions: emotions.filter((e) => e.category_id === cat.id),
            }));
            setCategories(categoriesWithEmotions);
            setLoading(false);
          });
      })
      .catch(() => {
        setError('Impossible de charger les émotions.');
        setLoading(false);
      });
  }, []);

  const handleCatSelect = (cat) => {
    setSelectedCat(cat);
    setSelectedEmotion(null);
  };

  const handleSubmit = async () => {
    if (!selectedEmotion) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/emotions/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emotion_id: selectedEmotion.id,
          note,
          commentaire: commentaire.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Erreur lors de l'enregistrement");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedCat(null);
    setSelectedEmotion(null);
    setNote(5);
    setCommentaire('');
    setSuccess(false);
    setError(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000091" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (success) {
    const color = CATEGORY_COLORS[selectedCat?.label] || '#000091';
    return (
      <View style={styles.centered}>
        <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={[styles.successTitle, { color }]}>Émotion enregistrée</Text>
          <Text style={styles.successEmotion}>
            <Text style={{ fontWeight: '700' }}>{selectedEmotion.label}</Text> ({selectedCat.label})
          </Text>
          <Text style={styles.successNote}>
            Intensité : {note}/10 — {INTENSITY_LABELS[note]}
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleReset}>
            <Text style={styles.btnPrimaryText}>Enregistrer une autre émotion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tracker d'émotions</Text>
      <Text style={styles.subtitle}>Comment vous sentez-vous en ce moment ?</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Étape 1 : Catégorie */}
      <View style={styles.card}>
        <Text style={styles.stepLabel}>1. Choisissez une famille d'émotions</Text>
        <View style={styles.chipRow}>
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.label] || '#000091';
            const isActive = selectedCat?.id === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCatSelect(cat)}
                style={[
                  styles.chip,
                  { borderColor: color },
                  isActive && { backgroundColor: color },
                ]}
              >
                <Text style={[styles.chipText, { color: isActive ? '#fff' : color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Étape 2 : Émotion spécifique */}
      {selectedCat && (
        <View style={styles.card}>
          <Text style={styles.stepLabel}>2. Précisez l'émotion</Text>
          <View style={styles.chipRow}>
            {selectedCat.emotions.map((em) => {
              const isActive = selectedEmotion?.id === em.id;
              const color = CATEGORY_COLORS[selectedCat.label] || '#000091';
              return (
                <TouchableOpacity
                  key={em.id}
                  onPress={() => setSelectedEmotion(em)}
                  style={[
                    styles.chipSmall,
                    { borderColor: isActive ? color : '#ccc' },
                    isActive && { backgroundColor: color },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isActive ? '#fff' : '#333' }]}>
                    {em.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Étape 3 : Intensité + commentaire */}
      {selectedEmotion && (
        <View style={styles.card}>
          <Text style={styles.stepLabel}>3. Intensité de l'émotion</Text>

          {/* Slider maison avec boutons +/- */}
          <View style={styles.sliderRow}>
            <TouchableOpacity
              style={styles.sliderBtn}
              onPress={() => setNote((n) => Math.max(1, n - 1))}
            >
              <Text style={styles.sliderBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.sliderValue}>
              <Text style={styles.sliderValueText}>{note}/10</Text>
              <Text style={styles.sliderLabel}>{INTENSITY_LABELS[note]}</Text>
            </View>
            <TouchableOpacity
              style={styles.sliderBtn}
              onPress={() => setNote((n) => Math.min(10, n + 1))}
            >
              <Text style={styles.sliderBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Barre visuelle */}
          <View style={styles.barContainer}>
            {Array.from({ length: 10 }, (_, i) => {
              const color = CATEGORY_COLORS[selectedCat?.label] || '#000091';
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setNote(i + 1)}
                  style={[
                    styles.barSegment,
                    { backgroundColor: i < note ? color : '#e0e0e0' },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabelText}>1 — Très légère</Text>
            <Text style={styles.barLabelText}>10 — Maximale</Text>
          </View>

          <Text style={styles.inputLabel}>
            Commentaire <Text style={styles.optional}>(facultatif)</Text>
          </Text>
          <TextInput
            value={commentaire}
            onChangeText={setCommentaire}
            placeholder="Qu'est-ce qui a déclenché cette émotion ?"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={3}
            maxLength={500}
            style={styles.textarea}
          />

          <TouchableOpacity
            style={[styles.btnPrimary, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.btnPrimaryText}>
              {submitting ? 'Enregistrement...' : 'Enregistrer cette émotion'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 20 },
  centered: { flex: 1, backgroundColor: '#eef0f8', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000091', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  loadingText: { marginTop: 12, color: '#666' },
  errorText: { color: '#dc3545', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, backgroundColor: 'transparent' },
  chipSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, backgroundColor: 'transparent' },
  chipText: { fontSize: 14, fontWeight: '500' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sliderBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eef0f8', alignItems: 'center', justifyContent: 'center' },
  sliderBtnText: { fontSize: 24, color: '#000091', fontWeight: '300' },
  sliderValue: { alignItems: 'center' },
  sliderValueText: { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  sliderLabel: { fontSize: 13, color: '#666', marginTop: 2 },
  barContainer: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  barSegment: { flex: 1, height: 10, borderRadius: 5 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  barLabelText: { fontSize: 11, color: '#999' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  optional: { fontWeight: '400', color: '#aaa' },
  textarea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, color: '#333', backgroundColor: '#fafafa', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  btnPrimary: { backgroundColor: '#000091', borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
  successIcon: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  successEmotion: { fontSize: 15, color: '#444', textAlign: 'center', marginBottom: 4 },
  successNote: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 },
});
