import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../../constants/api';

export default function ArticleDetail() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/articles/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setItem(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e5c1e" />
      </View>
    );
  }

  if (notFound || !item) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Article introuvable.</Text>
        <TouchableOpacity onPress={() => router.push('/articles')}>
          <Text style={styles.backLink}>← Retour aux articles</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/articles')}>
        <Text style={styles.backLink}>← Retour aux articles</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.titre}</Text>
          {item.categorie && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.categorie}</Text>
            </View>
          )}
        </View>
        <Text style={styles.content}>{item.contenu}</Text>

        {item.lien ? (
          <TouchableOpacity style={styles.lienBtn} onPress={() => Linking.openURL(item.lien)}>
            <Text style={styles.lienText}>🔗 Voir la source</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 16, paddingBottom: 32 },
  centered: { flex: 1, backgroundColor: '#eef0f8', justifyContent: 'center', alignItems: 'center', padding: 24 },
  backLink: { fontSize: 14, color: '#1e5c1e', fontWeight: '600', marginBottom: 16 },
  notFoundText: { color: '#999', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1e5c1e', marginBottom: 10 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, color: '#1e5c1e', fontWeight: '600' },
  content: { fontSize: 15, color: '#333', lineHeight: 24 },
  lienBtn: { marginTop: 20, borderWidth: 1, borderColor: '#1e5c1e', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  lienText: { color: '#1e5c1e', fontSize: 14, fontWeight: '600' },
});
