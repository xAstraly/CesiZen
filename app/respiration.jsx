import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/api';

const TECHNIQUES = {
  '4-4-4': {
    label: 'Cohérence cardiaque',
    description: 'Inspire 4s · Retiens 4s · Expire 4s',
    phases: [
      { name: 'Inspire', duration: 4, scale: 1.5 },
      { name: 'Retiens', duration: 4, scale: 1.5 },
      { name: 'Expire', duration: 4, scale: 1 },
    ],
  },
  '4-7-8': {
    label: '4-7-8 Anti-stress',
    description: 'Inspire 4s · Retiens 7s · Expire 8s',
    phases: [
      { name: 'Inspire', duration: 4, scale: 1.5 },
      { name: 'Retiens', duration: 7, scale: 1.5 },
      { name: 'Expire', duration: 8, scale: 1 },
    ],
  },
  'box': {
    label: 'Box Breathing',
    description: 'Inspire 4s · Retiens 4s · Expire 4s · Pause 4s',
    phases: [
      { name: 'Inspire', duration: 4, scale: 1.5 },
      { name: 'Retiens', duration: 4, scale: 1.5 },
      { name: 'Expire', duration: 4, scale: 1 },
      { name: 'Pause', duration: 4, scale: 1 },
    ],
  },
};

const PHASE_COLORS = {
  Inspire: '#1b5e20',
  Retiens: '#2e7d32',
  Expire: '#66bb6a',
  Pause: '#a5d6a7',
};

export default function Respiration() {
  const { user, token } = useAuth();
  const [techniqueKey, setTechniqueKey] = useState('4-4-4');
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [circleColor, setCircleColor] = useState('#e8f5e9');

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const countRef = useRef(null);

  const technique = TECHNIQUES[techniqueKey];
  const currentPhase = technique.phases[phaseIndex];

  const stop = () => {
    clearInterval(intervalRef.current);
    clearInterval(countRef.current);
    if (running && user) {
      fetch(`${API_URL}/breathing/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ exercise_name: TECHNIQUES[techniqueKey].label }),
      }).catch(() => {});
    }
    setRunning(false);
    setPhaseIndex(0);
    setCountdown(null);
    setCircleColor('#e8f5e9');
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const startPhase = (phases, idx) => {
    const phase = phases[idx];
    setPhaseIndex(idx);
    setCountdown(phase.duration);
    setCircleColor(PHASE_COLORS[phase.name]);
    Animated.timing(scaleAnim, {
      toValue: phase.scale,
      duration: phase.duration * 1000,
      useNativeDriver: true,
    }).start();

    let remaining = phase.duration - 1;
    clearInterval(countRef.current);
    countRef.current = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(countRef.current);
      } else {
        setCountdown(remaining--);
      }
    }, 1000);
  };

  const start = () => {
    const phases = TECHNIQUES[techniqueKey].phases;
    let currentIdx = 0;
    setRunning(true);
    startPhase(phases, currentIdx);

    let elapsed = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      elapsed++;
      if (elapsed >= phases[currentIdx].duration) {
        elapsed = 0;
        currentIdx = (currentIdx + 1) % phases.length;
        startPhase(phases, currentIdx);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countRef.current);
    };
  }, []);

  const handleTechniqueChange = (key) => {
    stop();
    setTechniqueKey(key);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Exercice de respiration</Text>
      <Text style={styles.subtitle}>Choisissez une technique et suivez le rythme.</Text>

      {/* Sélection technique */}
      <View style={styles.techniqueRow}>
        {Object.entries(TECHNIQUES).map(([key, tech]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleTechniqueChange(key)}
            style={[styles.techniqueBtn, techniqueKey === key && styles.techniqueBtnActive]}
          >
            <Text style={[styles.techniqueBtnText, techniqueKey === key && styles.techniqueBtnTextActive]}>
              {tech.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.description}>{technique.description}</Text>

      {/* Cercle animé */}
      <View style={styles.circleContainer}>
        <View style={styles.circleOuter} />
        <Animated.View style={[styles.circle, { backgroundColor: circleColor, transform: [{ scale: scaleAnim }] }]}>
          {running ? (
            <>
              <Text style={styles.phaseName}>{currentPhase?.name}</Text>
              <Text style={styles.phaseCount}>{countdown}</Text>
            </>
          ) : (
            <Text style={styles.readyText}>Prêt</Text>
          )}
        </Animated.View>
      </View>

      {/* Bouton start/stop */}
      <View style={styles.btnRow}>
        {!running ? (
          <TouchableOpacity style={styles.startBtn} onPress={start}>
            <Text style={styles.startBtnText}>▶ Démarrer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stop}>
            <Text style={styles.stopBtnText}>■ Arrêter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Légende phases */}
      <View style={styles.legend}>
        {technique.phases.map((p, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PHASE_COLORS[p.name] }]} />
            <Text style={styles.legendText}>{p.name} ({p.duration}s)</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', alignItems: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  techniqueRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 16 },
  techniqueBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#1b5e20', backgroundColor: '#fff' },
  techniqueBtnActive: { backgroundColor: '#1b5e20' },
  techniqueBtnText: { fontSize: 13, fontWeight: '600', color: '#1b5e20' },
  techniqueBtnTextActive: { color: '#fff' },
  description: { fontSize: 14, color: '#888', marginBottom: 40 },
  circleContainer: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  circleOuter: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: '#c8e6c9' },
  circle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  phaseName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  phaseCount: { color: '#fff', fontSize: 28, fontWeight: '300' },
  readyText: { color: '#1b5e20', fontSize: 14 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  startBtn: { paddingHorizontal: 36, paddingVertical: 14, backgroundColor: '#1b5e20', borderRadius: 30 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  stopBtn: { paddingHorizontal: 36, paddingVertical: 14, backgroundColor: '#fff', borderRadius: 30, borderWidth: 2, borderColor: '#1b5e20' },
  stopBtnText: { color: '#1b5e20', fontSize: 16, fontWeight: '600' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: '#666' },
});
