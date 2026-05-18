import { router } from 'expo-router';
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

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/articles`)
      .then((r) => r.json())
      .then((data) => setArticles(data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            <Text style={{ color: '#2d8c2d' }}>CESI</Text>
            <Text style={{ color: '#f0b429' }}>Zen</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Votre espace dédié au bien-être mental — ressources, exercices de respiration et conseils pratiques.
          </Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/respiration')}>
              <Text style={styles.btnPrimaryText}>🫁 Exercice de respiration</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/articles')}>
              <Text style={styles.btnOutlineText}>📚 Tous les articles</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dernières ressources</Text>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#1e5c1e" />
            </View>
          ) : articles.length === 0 ? (
            <Text style={styles.emptyText}>Aucun article disponible pour le moment.</Text>
          ) : (
            articles.map((art) => (
              <TouchableOpacity
                key={art.id}
                style={styles.articleCard}
                onPress={() => router.push(`/articles/${art.id}`)}
              >
                <Text style={styles.articleTitle}>{art.titre}</Text>
                <Text style={styles.articleContent}>
                  {art.contenu?.slice(0, 120)}{art.contenu?.length > 120 ? '…' : ''}
                </Text>
                {art.categorie && (
                  <Text style={styles.articleCategory}>Catégorie : {art.categorie}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef0f8' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },

  // Hero
  hero: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  heroTitle: { fontSize: 48, fontWeight: 'bold', marginBottom: 12 },
  heroSubtitle: { fontSize: 16, color: '#555', textAlign: 'center', maxWidth: 360, marginBottom: 28, lineHeight: 24 },
  heroBtns: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#1e5c1e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnOutline: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: '#1e5c1e' },
  btnOutlineText: { color: '#1e5c1e', fontSize: 15, fontWeight: '600' },

  // Section articles
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  loaderContainer: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { color: '#999', fontStyle: 'italic' },

  // Article card
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#1e5c1e',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  articleTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e5c1e', marginBottom: 6 },
  articleContent: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  articleCategory: { fontSize: 12, color: '#888' },
});
