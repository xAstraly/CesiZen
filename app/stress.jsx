import { useAuth } from '@/context/AuthContext';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../constants/api';

const RISK_INFO = {
  faible: {
    label: 'Risque faible',
    color: '#1e7e34',
    bg: '#f0fff4',
    border: '#1e7e34',
    desc: 'Votre niveau de stress est dans la norme. Continuez à prendre soin de vous.',
  },
  modere: {
    label: 'Risque modéré',
    color: '#856404',
    bg: '#fffbea',
    border: '#ffc107',
    desc: 'Votre niveau de stress mérite attention. Des exercices de relaxation peuvent vous aider.',
  },
  eleve: {
    label: 'Risque élevé',
    color: '#721c24',
    bg: '#fff5f5',
    border: '#dc3545',
    desc: "Votre score indique un stress important. Il est recommandé de consulter un professionnel de santé.",
  },
};

export default function StressDiagnostic() {
  const { user, token } = useAuth();

  const [byCategory, setByCategory] = useState({});
  const [allEvents, setAllEvents] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!user) return <Redirect href="/login" />;

  useEffect(() => {
    fetch(`${API_URL}/stress/events`)
      .then((r) => r.json())
      .then((data) => {
        setAllEvents(data);
        const grouped = {};
        data.forEach((e) => {
          const cat = e.category || 'Général';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(e);
        });
        setByCategory(grouped);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger les événements.');
        setLoading(false);
      });
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const score = allEvents
    .filter((e) => selected.has(e.id))
    .reduce((sum, e) => sum + (e.points || 0), 0);

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/stress/diagnostics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_ids: Array.from(selected),
          total_score: score,
          risk_level: score >= 300 ? 'eleve' : score >= 150 ? 'modere' : 'faible',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Erreur lors de l'enregistrement");
        return;
      }
      setResult({ ...data, total_score: score, events_count: selected.size });
    } catch {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelected(new Set());
    setResult(null);
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

  if (result) {
    const riskLevel = score >= 300 ? 'eleve' : score >= 150 ? 'modere' : 'faible';
    const info = RISK_INFO[riskLevel];
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Résultat du diagnostic</Text>
        <Text style={styles.subtitle}>Échelle Holmes &amp; Rahe</Text>

        <View style={[styles.resultCard, { backgroundColor: info.bg, borderLeftColor: info.border }]}>
          <View style={styles.resultScoreRow}>
            <Text style={[styles.resultScore, { color: info.color }]}>{score}</Text>
            <Text style={[styles.resultLabel, { color: info.color }]}>{info.label}</Text>
          </View>
          <Text style={[styles.resultDesc, { color: info.color }]}>{info.desc}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.stepLabel}>Interprétation de l'échelle</Text>
          <View style={styles.tableRow}>
            <Text style={[styles.tableScore, { color: '#1e7e34' }]}>&lt; 150</Text>
            <Text style={styles.tableText}>Risque faible</Text>
          </View>
          <View style={[styles.tableRow, { backgroundColor: '#f8f8f8' }]}>
            <Text style={[styles.tableScore, { color: '#856404' }]}>150 – 299</Text>
            <Text style={styles.tableText}>Risque modéré</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableScore, { color: '#721c24' }]}>≥ 300</Text>
            <Text style={styles.tableText}>Risque élevé</Text>
          </View>
        </View>

        <Text style={styles.resultMeta}>
          {result.events_count} événement{result.events_count > 1 ? 's' : ''} sélectionné{result.events_count > 1 ? 's' : ''}. Ce résultat est enregistré dans votre historique.
        </Text>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleReset}>
          <Text style={styles.btnPrimaryText}>Refaire le diagnostic</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#eef0f8' }}>
      {/* Score sticky en haut */}
      <View style={styles.stickyHeader}>
        <Text style={styles.stickyScore}>
          Score : <Text style={{ color: score >= 300 ? '#dc3545' : score >= 150 ? '#856404' : '#1e7e34', fontSize: 20 }}>{score}</Text>
        </Text>
        <Text style={styles.stickyCount}>
          {selected.size} événement{selected.size > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Diagnostic de stress</Text>
        <Text style={styles.subtitle}>
          Échelle de Holmes & Rahe — Cochez les événements vécus au cours des{' '}
          <Text style={{ fontWeight: '700' }}>12 derniers mois</Text>.
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {Object.entries(byCategory).map(([cat, catEvents]) => (
          <View key={cat} style={styles.card}>
            <Text style={styles.catTitle}>{cat}</Text>
            {catEvents.map((ev) => {
              const isChecked = selected.has(ev.id);
              return (
                <TouchableOpacity
                  key={ev.id}
                  style={[styles.eventRow, isChecked && styles.eventRowChecked]}
                  onPress={() => toggle(ev.id)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.eventLabel}>{ev.label}</Text>
                  <Text style={styles.eventPoints}>{ev.points} pts</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Boutons en bas */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnPrimary, (submitting || selected.size === 0) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || selected.size === 0}
          >
            <Text style={styles.btnPrimaryText}>
              {submitting ? 'Enregistrement...' : 'Voir mon résultat'}
            </Text>
          </TouchableOpacity>
          {selected.size > 0 && (
            <TouchableOpacity style={styles.btnOutline} onPress={() => setSelected(new Set())}>
              <Text style={styles.btnOutlineText}>Tout décocher</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  centered: { flex: 1, backgroundColor: '#eef0f8', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666' },

  stickyHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stickyScore: { fontSize: 16, fontWeight: '600', color: '#333' },
  stickyCount: { fontSize: 13, color: '#888' },

  title: { fontSize: 24, fontWeight: 'bold', color: '#000091', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 20 },
  errorText: { color: '#dc3545', marginBottom: 12 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  catTitle: { fontSize: 13, fontWeight: '700', color: '#000091', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6, gap: 10 },
  eventRowChecked: { backgroundColor: 'rgba(0,0,145,0.05)' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#000091', borderColor: '#000091' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  eventLabel: { flex: 1, fontSize: 14, color: '#333' },
  eventPoints: { fontSize: 13, color: '#888', fontWeight: '600', minWidth: 40, textAlign: 'right' },

  footer: { gap: 10, marginTop: 8 },
  btnPrimary: { backgroundColor: '#000091', borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnOutline: { borderRadius: 8, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  btnOutlineText: { color: '#555', fontSize: 14 },
  btnDisabled: { opacity: 0.5 },

  // Résultat
  resultCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4 },
  resultScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 8 },
  resultScore: { fontSize: 48, fontWeight: '700', lineHeight: 56 },
  resultLabel: { fontSize: 18, fontWeight: '600' },
  resultDesc: { fontSize: 14, lineHeight: 20 },
  resultMeta: { fontSize: 13, color: '#888', marginBottom: 20 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, gap: 16 },
  tableScore: { fontWeight: '600', width: 80, fontSize: 14 },
  tableText: { fontSize: 14, color: '#333' },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 12 },
});
