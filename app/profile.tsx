import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/api';

const CATEGORY_COLORS: Record<string, string> = {
  'Joie': '#1e7e34',
  'Tristesse': '#6c757d',
  'Peur': '#856404',
  'Colère': '#dc3545',
  'Surprise': '#0077cc',
  'Dégoût': '#6f42c1',
  'Confiance': '#000091',
  'Anticipation': '#e07800',
};

function formatDate(iso: string) {
  const normalized = iso && !iso.endsWith('Z') && !iso.includes('+') ? iso + 'Z' : iso;
  const d = new Date(normalized);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const TABS = ['Informations', 'Historique', 'Sécurité', 'Supprimer mon compte'];

export default function Profile() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpQr, setTotpQr] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpStep, setTotpStep] = useState<'idle' | 'setup' | 'disable'>('idle');
  const [totpError, setTotpError] = useState('');
  const [totpSuccess, setTotpSuccess] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);

  const [emotionPeriod, setEmotionPeriod] = useState<'week'|'month'|'quarter'|'year'>('month');
  const [emotionHistory, setEmotionHistory] = useState<any[]>([]);
  const [emotionStats, setEmotionStats] = useState<any>(null);
  const [breathingHistory, setBreathingHistory] = useState<any[]>([]);
  const [stressHistory, setStressHistory] = useState<any[]>([]);
  const [detenteHistory, setDetenteHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => router.push('/login'), 100);
      return () => clearTimeout(timer);
    }
    if (token) {
      fetch(`${API_URL}/auth/2fa/status`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setTotpEnabled(d.totp_enabled || false))
        .catch(() => {});
    }
  }, [user]);

  const loadEmotions = (period: string) => {
    if (!token) return;
    Promise.all([
      fetch(`${API_URL}/emotions/history?period=${period}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/emotions/stats?period=${period}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([history, stats]) => {
      setEmotionHistory(Array.isArray(history) ? history : []);
      setEmotionStats(stats?.total !== undefined ? stats : null);
    }).catch(() => {});
  };

  useEffect(() => {
    if (tab !== 1 || !token) return;
    setHistoryLoading(true);
    Promise.all([
      fetch(`${API_URL}/breathing/history`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/stress/history`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/detente/history`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([breathing, stress, detente]) => {
        setBreathingHistory(Array.isArray(breathing) ? breathing : []);
        setStressHistory(Array.isArray(stress) ? stress : []);
        setDetenteHistory(Array.isArray(detente) ? detente : []);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
    loadEmotions(emotionPeriod);
  }, [tab]);

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
        <>
          {historyLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#1a2060" />
            </View>
          ) : (
            <>
              {/* Journal d'émotions */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Journal d'émotions</Text>

                {/* Sélecteur de période */}
                <View style={styles.periodRow}>
                  {([['week','Semaine'],['month','Mois'],['quarter','Trimestre'],['year','Année']] as const).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.periodBtn, emotionPeriod === key && styles.periodBtnActive]}
                      onPress={() => { setEmotionPeriod(key); loadEmotions(key); }}
                    >
                      <Text style={[styles.periodBtnText, emotionPeriod === key && styles.periodBtnTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Stats résumées */}
                {emotionStats && emotionStats.total > 0 && (
                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{emotionStats.total}</Text>
                      <Text style={styles.statLabel}>entrées</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{emotionStats.avg_note > 0 ? emotionStats.avg_note : '—'}</Text>
                      <Text style={styles.statLabel}>intensité moy.</Text>
                    </View>
                    <View style={[styles.statBox, { flex: 2 }]}>
                      <Text style={styles.statValue} numberOfLines={1}>
                        {emotionStats.top_emotions?.[0]?.label || '—'}
                      </Text>
                      <Text style={styles.statLabel}>émotion principale</Text>
                    </View>
                  </View>
                )}

                {/* Répartition par catégorie */}
                {emotionStats?.by_category?.length > 0 && (
                  <View style={styles.catStatsRow}>
                    {emotionStats.by_category.map((cat: any) => {
                      const color = CATEGORY_COLORS[cat.category_label] || '#1a2060';
                      return (
                        <View key={cat.category_label} style={[styles.catStatChip, { borderColor: color }]}>
                          <Text style={[styles.catStatText, { color }]}>{cat.category_label}</Text>
                          <Text style={[styles.catStatCount, { color }]}>{cat.count}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {emotionHistory.length === 0 ? (
                  <Text style={styles.empty}>Aucune émotion enregistrée sur cette période.</Text>
                ) : (
                  emotionHistory.map((entry: any) => {
                    const color = CATEGORY_COLORS[entry.category_label] || '#1a2060';
                    return (
                      <View key={entry.id} style={[styles.historyEntry, { borderLeftColor: color }]}>
                        <View style={styles.historyRow}>
                          <Text style={[styles.historyLabel, { color }]}>{entry.emotion_label}</Text>
                          <Text style={styles.historyBadge}>{entry.note}/10</Text>
                        </View>
                        <Text style={styles.historyMeta}>{entry.category_label} · {formatDate(entry.logged_at)}</Text>
                        {entry.commentaire ? <Text style={styles.historyComment}>"{entry.commentaire}"</Text> : null}
                      </View>
                    );
                  })
                )}
              </View>

              {/* Sessions de respiration */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Sessions de respiration</Text>
                {breathingHistory.length === 0 ? (
                  <Text style={styles.empty}>Aucune session enregistrée pour l'instant.</Text>
                ) : (
                  breathingHistory.map((entry: any) => (
                    <View key={entry.id} style={[styles.historyEntry, { borderLeftColor: '#1b5e20' }]}>
                      <View style={styles.historyRow}>
                        <Text style={[styles.historyLabel, { color: '#1b5e20' }]}>{entry.exercise_name}</Text>
                      </View>
                      <Text style={styles.historyMeta}>{formatDate(entry.completed_at)}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Activités de détente */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Activités de détente</Text>
                {detenteHistory.length === 0 ? (
                  <Text style={styles.empty}>Aucune activité enregistrée pour l'instant.</Text>
                ) : (
                  detenteHistory.map((entry: any) => (
                    <View key={entry.id} style={[styles.historyEntry, { borderLeftColor: '#6f42c1' }]}>
                      <View style={styles.historyRow}>
                        <Text style={[styles.historyLabel, { color: '#6f42c1' }]}>{entry.activity_name}</Text>
                        {entry.duration_seconds && (
                          <Text style={styles.historyBadge}>{Math.floor(entry.duration_seconds / 60)} min</Text>
                        )}
                      </View>
                      <Text style={styles.historyMeta}>{formatDate(entry.completed_at)}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Diagnostics de stress */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Diagnostics de stress</Text>
                {stressHistory.length === 0 ? (
                  <Text style={styles.empty}>Aucun diagnostic enregistré pour l'instant.</Text>
                ) : (
                  stressHistory.map((entry: any) => {
                    const riskColors: Record<string, string> = { faible: '#1e7e34', modere: '#856404', eleve: '#dc3545' };
                    const riskLabels: Record<string, string> = { faible: 'Risque faible', modere: 'Risque modéré', eleve: 'Risque élevé' };
                    const color = riskColors[entry.risk_level] || '#555';
                    return (
                      <View key={entry.id} style={[styles.historyEntry, { borderLeftColor: color }]}>
                        <View style={styles.historyRow}>
                          <Text style={[styles.historyLabel, { color }]}>{riskLabels[entry.risk_level] || entry.risk_level}</Text>
                          <Text style={styles.historyBadge}>{entry.total_score} pts</Text>
                        </View>
                        <Text style={styles.historyMeta}>{formatDate(entry.created_at)}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}
        </>
      )}

      {/* Onglet Sécurité */}
      {tab === 2 && (
        <>
          {/* Bloc d'information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>🔐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Qu'est-ce que l'A2F ?</Text>
              <Text style={styles.infoText}>
                L'authentification à deux facteurs (A2F) ajoute une couche de sécurité supplémentaire à votre compte.
                En plus de votre mot de passe, vous devrez saisir un code à 6 chiffres généré par une application comme{' '}
                <Text style={styles.infoLink}>Google Authenticator</Text> ou <Text style={styles.infoLink}>Authy</Text>.{'\n\n'}
                Même si quelqu'un obtient votre mot de passe, il ne pourra pas accéder à votre compte sans ce code.
              </Text>
            </View>
          </View>

          {/* Avertissement mobile */}
          {Platform.OS !== 'web' && !totpEnabled && (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Prérequis : utiliser un ordinateur</Text>
                <Text style={styles.warningText}>
                  L'activation de l'A2F nécessite de scanner un QR code avec votre téléphone.{'\n'}
                  Vous ne pouvez pas scanner un QR code affiché sur le même appareil.{'\n\n'}
                  Connectez-vous depuis un <Text style={{ fontWeight: '700' }}>ordinateur</Text> pour activer cette fonctionnalité.
                </Text>
              </View>
            </View>
          )}

          {/* Statut et gestion */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Authentification à deux facteurs</Text>

            <View style={styles.totpStatusRow}>
              <View style={[styles.totpBadge, totpEnabled ? styles.totpBadgeOn : styles.totpBadgeOff]}>
                <Text style={styles.totpBadgeText}>{totpEnabled ? 'Activée' : 'Désactivée'}</Text>
              </View>
              {totpStep === 'idle' && (
                <TouchableOpacity
                  style={[styles.btnSmall, totpEnabled ? styles.btnSmallDanger : styles.btnSmallPrimary, (!totpEnabled && Platform.OS !== 'web') && styles.btnSmallDisabled]}
                  onPress={() => {
                    setTotpError('');
                    setTotpSuccess('');
                    setTotpCode('');
                    if (totpEnabled) {
                      setTotpStep('disable');
                    } else {
                      setTotpLoading(true);
                      fetch(`${API_URL}/auth/2fa/setup`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      })
                        .then((r) => r.json())
                        .then((d) => { setTotpQr(d.qr_code_url); setTotpStep('setup'); })
                        .catch(() => setTotpError('Erreur lors de la configuration'))
                        .finally(() => setTotpLoading(false));
                    }
                  }}
                  disabled={totpLoading || (!totpEnabled && Platform.OS !== 'web')}
                >
                  <Text style={styles.btnSmallText}>{totpLoading ? '...' : totpEnabled ? 'Désactiver' : 'Activer'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {totpError ? <Text style={styles.errorText}>{totpError}</Text> : null}
            {totpSuccess ? <Text style={styles.successText}>{totpSuccess}</Text> : null}

            {/* Étape activation : QR code + saisie */}
            {totpStep === 'setup' && totpQr && (
              <View style={styles.totpSetup}>
                <Text style={styles.totpInstruction}>
                  1. Ouvrez <Text style={{ fontWeight: '700' }}>Google Authenticator</Text> ou <Text style={{ fontWeight: '700' }}>Authy</Text>{'\n'}
                  2. Scannez ce QR code{'\n'}
                  3. Saisissez le code à 6 chiffres affiché
                </Text>
                <Image source={{ uri: totpQr }} style={styles.qrCode} resizeMode="contain" />
                <TextInput
                  style={styles.codeInput}
                  placeholder="Code à 6 chiffres"
                  value={totpCode}
                  onChangeText={setTotpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <View style={styles.totpBtnRow}>
                  <TouchableOpacity
                    style={[styles.btnSmall, styles.btnSmallPrimary, totpLoading && { opacity: 0.6 }]}
                    disabled={totpLoading || totpCode.length !== 6}
                    onPress={() => {
                      setTotpLoading(true);
                      setTotpError('');
                      fetch(`${API_URL}/auth/2fa/activate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ code: totpCode }),
                      })
                        .then((r) => r.json())
                        .then((d) => {
                          if (d.message === '2FA activé avec succès') {
                            setTotpEnabled(true);
                            setTotpStep('idle');
                            setTotpQr(null);
                            setTotpSuccess('A2F activée avec succès !');
                          } else {
                            setTotpError(d.message || 'Code invalide');
                          }
                        })
                        .catch(() => setTotpError('Erreur réseau'))
                        .finally(() => setTotpLoading(false));
                    }}
                  >
                    <Text style={styles.btnSmallText}>Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnSmall, styles.btnSmallOutline]} onPress={() => { setTotpStep('idle'); setTotpQr(null); }}>
                    <Text style={styles.btnSmallOutlineText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Étape désactivation */}
            {totpStep === 'disable' && (
              <View style={styles.totpSetup}>
                <Text style={styles.totpInstruction}>Saisissez le code de votre application pour confirmer la désactivation.</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Code à 6 chiffres"
                  value={totpCode}
                  onChangeText={setTotpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <View style={styles.totpBtnRow}>
                  <TouchableOpacity
                    style={[styles.btnSmall, styles.btnSmallDanger, totpLoading && { opacity: 0.6 }]}
                    disabled={totpLoading || totpCode.length !== 6}
                    onPress={() => {
                      setTotpLoading(true);
                      setTotpError('');
                      fetch(`${API_URL}/auth/2fa/disable`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ code: totpCode }),
                      })
                        .then((r) => r.json())
                        .then((d) => {
                          if (d.message === '2FA désactivé') {
                            setTotpEnabled(false);
                            setTotpStep('idle');
                            setTotpSuccess('A2F désactivée.');
                          } else {
                            setTotpError(d.message || 'Code invalide');
                          }
                        })
                        .catch(() => setTotpError('Erreur réseau'))
                        .finally(() => setTotpLoading(false));
                    }}
                  >
                    <Text style={styles.btnSmallText}>Confirmer la désactivation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnSmall, styles.btnSmallOutline]} onPress={() => setTotpStep('idle')}>
                    <Text style={styles.btnSmallOutlineText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </>
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
  centered: { padding: 40, alignItems: 'center' },
  warningCard: { backgroundColor: '#fff8e1', borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', gap: 12, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  warningIcon: { fontSize: 22 },
  warningTitle: { fontSize: 14, fontWeight: '700', color: '#92400e', marginBottom: 6 },
  warningText: { fontSize: 13, color: '#78350f', lineHeight: 20 },
  btnSmallDisabled: { opacity: 0.4 },
  infoCard: { backgroundColor: '#eef4ff', borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', gap: 12, borderLeftWidth: 3, borderLeftColor: '#1a2060' },
  infoIcon: { fontSize: 24 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1a2060', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#444', lineHeight: 20 },
  infoLink: { color: '#1a2060', fontWeight: '600' },
  totpStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  totpBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  totpBadgeOn: { backgroundColor: '#d4edda' },
  totpBadgeOff: { backgroundColor: '#f0f0f0' },
  totpBadgeText: { fontSize: 13, fontWeight: '600', color: '#333' },
  btnSmall: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  btnSmallPrimary: { backgroundColor: '#1a2060' },
  btnSmallDanger: { backgroundColor: '#c0392b' },
  btnSmallOutline: { borderWidth: 1, borderColor: '#ccc' },
  btnSmallText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnSmallOutlineText: { color: '#555', fontSize: 13 },
  totpSetup: { marginTop: 12, gap: 12 },
  totpInstruction: { fontSize: 13, color: '#555', lineHeight: 20 },
  qrCode: { width: 180, height: 180, alignSelf: 'center', marginVertical: 8 },
  codeInput: { borderWidth: 1, borderColor: '#d0d5e8', borderRadius: 8, padding: 12, fontSize: 22, textAlign: 'center', letterSpacing: 8, color: '#1a1a2e', backgroundColor: '#f8f9fc' },
  totpBtnRow: { flexDirection: 'row', gap: 10 },
  errorText: { color: '#c0392b', fontSize: 13, marginTop: 4 },
  successText: { color: '#1e7e34', fontSize: 13, marginTop: 4, fontWeight: '600' },
  periodRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  periodBtn: { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#d0d5e8', alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#1a2060', borderColor: '#1a2060' },
  periodBtnText: { fontSize: 12, color: '#666' },
  periodBtnTextActive: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#f0f2fa', borderRadius: 8, padding: 10, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1a2060' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  catStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  catStatChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  catStatText: { fontSize: 11, fontWeight: '600' },
  catStatCount: { fontSize: 11, fontWeight: '700' },
  historyEntry: { borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLabel: { fontSize: 15, fontWeight: '700' },
  historyBadge: { fontSize: 13, fontWeight: '600', color: '#555', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  historyMeta: { fontSize: 12, color: '#999', marginTop: 3 },
  historyComment: { fontSize: 13, color: '#666', marginTop: 4, fontStyle: 'italic' },
  dangerCard: { borderLeftWidth: 4, borderLeftColor: '#c0392b' },
  dangerTitle: { fontSize: 16, fontWeight: '600', color: '#c0392b', marginBottom: 8 },
  dangerText: { fontSize: 14, color: '#4a4a6a', marginBottom: 16 },
  dangerBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#c0392b', borderRadius: 6, padding: 12, alignItems: 'center' },
  dangerBtnText: { color: '#c0392b', fontWeight: '600' },
});
