import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_URL } from '../constants/api';

export default function ArticlesList() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/articles`).then((r) => r.json()),
      fetch(`${API_URL}/articles/categories`).then((r) => r.json()),
    ])
      .then(([articles, cats]) => {
        setItems(articles || []);
        setCategories((cats || []).map((c) => c.name));
      })
      .catch(() => { setItems([]); setCategories([]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((it) => {
    const matchSearch =
      it.titre?.toLowerCase().includes(search.toLowerCase()) ||
      it.contenu?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || it.categorie === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Articles</Text>

      {/* Recherche + filtre sur une ligne */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        {categories.length > 0 && (
          <TouchableOpacity
            style={[styles.filterBtn, selectedCategory && styles.filterBtnActive]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.filterBtnText, selectedCategory && styles.filterBtnTextActive]} numberOfLines={1}>
              {selectedCategory || '⊟ Filtrer'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal sélection catégorie */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Catégorie</Text>
            <TouchableOpacity
              style={[styles.modalOption, !selectedCategory && styles.modalOptionActive]}
              onPress={() => { setSelectedCategory(''); setModalVisible(false); }}
            >
              <Text style={[styles.modalOptionText, !selectedCategory && styles.modalOptionTextActive]}>
                Toutes les catégories
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.modalOption, selectedCategory === cat && styles.modalOptionActive]}
                onPress={() => { setSelectedCategory(cat); setModalVisible(false); }}
              >
                <Text style={[styles.modalOptionText, selectedCategory === cat && styles.modalOptionTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Liste */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#1e5c1e" />
        </View>
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>
          {items.length === 0 ? 'Aucun article disponible.' : 'Aucun résultat.'}
        </Text>
      ) : (
        filtered.map((it) => (
          <TouchableOpacity
            key={it.id}
            style={styles.card}
            onPress={() => router.push(`/articles/${it.id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{it.titre}</Text>
                <Text style={styles.cardExcerpt}>
                  {it.contenu?.slice(0, 140)}{it.contenu?.length > 140 ? '…' : ''}
                </Text>
              </View>
              {it.categorie && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{it.categorie}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e5c1e', marginBottom: 16 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    maxWidth: 110,
  },
  filterBtnActive: { borderColor: '#1e5c1e', backgroundColor: '#e8f5e9' },
  filterBtnText: { fontSize: 13, color: '#888' },
  filterBtnTextActive: { color: '#1e5c1e', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, width: '80%', overflow: 'hidden' },
  modalTitle: { fontSize: 14, fontWeight: '700', color: '#555', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalOption: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOptionActive: { backgroundColor: '#e8f5e9' },
  modalOptionText: { fontSize: 15, color: '#333' },
  modalOptionTextActive: { color: '#1e5c1e', fontWeight: '600' },

  loaderContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontStyle: 'italic', marginTop: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1e5c1e',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e5c1e', marginBottom: 6 },
  cardExcerpt: { fontSize: 13, color: '#555', lineHeight: 19 },
  badge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    flexShrink: 0,
    marginTop: 2,
  },
  badgeText: { fontSize: 11, color: '#1e5c1e', fontWeight: '600' },
});
