import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/api';

const ACTIVITIES = [
  {
    id: 'meditation',
    label: 'Méditation guidée',
    emoji: '🧘',
    description: 'Fermez les yeux, concentrez-vous sur votre respiration. Laissez vos pensées passer sans les retenir.',
    duration: 300,
    color: '#6f42c1',
    bg: '#f5f0ff',
  },
  {
    id: 'scan_corporel',
    label: 'Scan corporel',
    emoji: '🌊',
    description: 'Parcourez mentalement chaque partie de votre corps, des pieds à la tête, en relâchant les tensions.',
    duration: 240,
    color: '#0077cc',
    bg: '#e8f4fd',
  },
  {
    id: 'visualisation',
    label: 'Visualisation positive',
    emoji: '☀️',
    description: 'Imaginez un endroit calme et sécurisant. Visualisez chaque détail : les couleurs, les sons, les odeurs.',
    duration: 180,
    color: '#e07800',
    bg: '#fff8e1',
  },
  {
    id: 'etirements',
    label: 'Étirements doux',
    emoji: '🤸',
    description: 'Étirez doucement vos épaules, votre cou et votre dos. Maintenez chaque posture 20 secondes.',
    duration: 300,
    color: '#1e7e34',
    bg: '#f0fff4',
  },
  {
    id: 'pleine_conscience',
    label: 'Pleine conscience',
    emoji: '🍃',
    description: 'Observez ce qui vous entoure : 5 choses que vous voyez, 4 que vous entendez, 3 que vous touchez.',
    duration: 120,
    color: '#1e5c1e',
    bg: '#e8f5e9',
  },
  {
    id: 'relaxation_musculaire',
    label: 'Relaxation musculaire',
    emoji: '💆',
    description: 'Contractez et relâchez chaque groupe musculaire pendant 5 secondes, en commençant par les pieds.',
    duration: 420,
    color: '#856404',
    bg: '#fffbea',
  },
];

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Detente() {
  const { user, token } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [done, setDone] = useState(null);
  const intervalRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const active = ACTIVITIES.find((a) => a.id === activeId);

  const stop = (completed = false) => {
    clearInterval(intervalRef.current);
    if (completed && active && user) {
      const elapsed = active.duration - remaining;
      fetch(`${API_URL}/detente/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activity_name: active.label, duration_seconds: elapsed }),
      }).catch(() => {});
      setDone(active);
    }
    setRunning(false);
    setRemaining(0);
    progressAnim.setValue(0);
  };

  const start = (activity) => {
    if (running) stop(false);
    setActiveId(activity.id);
    setDone(null);
    setRemaining(activity.duration);
    setRunning(true);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: activity.duration * 1000,
      useNativeDriver: false,
    }).start();

    let rem = activity.duration - 1;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (rem <= 0) {
        clearInterval(intervalRef.current);
        setRunning(false);
        setRemaining(0);
        if (user) {
          fetch(`${API_URL}/detente/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ activity_name: activity.label, duration_seconds: activity.duration }),
          }).catch(() => {});
        }
        setDone(activity);
        progressAnim.setValue(1);
      } else {
        setRemaining(rem--);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  if (done) {
    return (
      <View style={[styles.centered, { backgroundColor: done.bg }]}>
        <Text style={styles.doneEmoji}>{done.emoji}</Text>
        <Text style={[styles.doneTitle, { color: done.color }]}>Activité terminée !</Text>
        <Text style={styles.doneName}>{done.label}</Text>
        {user && <Text style={styles.doneSaved}>✓ Enregistrée dans votre historique</Text>}
        <TouchableOpacity style={[styles.doneBtn, { backgroundColor: done.color }]} onPress={() => { setDone(null); setActiveId(null); }}>
          <Text style={styles.doneBtnText}>Choisir une autre activité</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Activités de détente</Text>
      <Text style={styles.subtitle}>Choisissez une activité et accordez-vous un moment de calme.</Text>

      {/* Timer actif */}
      {running && active && (
        <View style={[styles.timerCard, { borderLeftColor: active.color }]}>
          <Text style={[styles.timerEmoji]}>{active.emoji}</Text>
          <Text style={[styles.timerName, { color: active.color }]}>{active.label}</Text>
          <Text style={styles.timerDesc}>{active.description}</Text>
          <View style={styles.timerBarBg}>
            <Animated.View
              style={[
                styles.timerBarFill,
                {
                  backgroundColor: active.color,
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                },
              ]}
            />
          </View>
          <Text style={[styles.timerCountdown, { color: active.color }]}>{formatDuration(remaining)}</Text>
          <TouchableOpacity style={[styles.stopBtn, { borderColor: active.color }]} onPress={() => stop(true)}>
            <Text style={[styles.stopBtnText, { color: active.color }]}>■ Terminer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grille des activités */}
      {ACTIVITIES.map((activity) => {
        const isActive = activeId === activity.id && running;
        return (
          <TouchableOpacity
            key={activity.id}
            style={[styles.card, { backgroundColor: activity.bg, borderLeftColor: activity.color }, isActive && styles.cardActive]}
            onPress={() => start(activity)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardEmoji}>{activity.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: activity.color }]}>{activity.label}</Text>
                <Text style={styles.cardDuration}>{Math.floor(activity.duration / 60)} min</Text>
              </View>
              {isActive && <View style={[styles.activeDot, { backgroundColor: activity.color }]} />}
            </View>
            <Text style={styles.cardDesc}>{activity.description}</Text>
            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: activity.color }]}
              onPress={() => start(activity)}
            >
              <Text style={styles.startBtnText}>{isActive ? '▶ En cours...' : '▶ Commencer'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },

  timerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, alignItems: 'center' },
  timerEmoji: { fontSize: 40, marginBottom: 8 },
  timerName: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  timerDesc: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#eee', borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  timerBarFill: { height: 8, borderRadius: 4 },
  timerCountdown: { fontSize: 48, fontWeight: '200', marginBottom: 16 },
  stopBtn: { borderWidth: 2, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  stopBtnText: { fontSize: 15, fontWeight: '600' },

  card: { borderRadius: 12, padding: 16, marginBottom: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardActive: { opacity: 0.7 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardEmoji: { fontSize: 28 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDuration: { fontSize: 12, color: '#888', marginTop: 2 },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  cardDesc: { fontSize: 13, color: '#555', lineHeight: 18, marginBottom: 12 },
  startBtn: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  doneEmoji: { fontSize: 72, marginBottom: 16 },
  doneTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  doneName: { fontSize: 16, color: '#555', marginBottom: 8 },
  doneSaved: { fontSize: 13, color: '#1e7e34', fontWeight: '600', marginBottom: 24 },
  doneBtn: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 28 },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
