
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const cards =[
  { titre: 'Article', description: 'Description de l\'article 1' },
  { titre: 'Exercices de respiration', description: 'Description des exercices de respiration' },
  { titre: 'Gestion des émotions', description: 'Description de la gestion des émotions' },
]


export default function App() {
  const { width, height } = useWindowDimensions();
  const isSmall = height < 700;

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.home}>
            <Text style={[styles.title]}>
              <Text style={{ color: '#2d8c2d' }}>Cesi</Text>
              <Text style={{ color: '#f0b429' }}>Zen</Text>
            </Text>
            <Text style={[styles.subtitle, { fontSize: Math.min(width * 0.04, 20) }]}>l'application de votre santé mentale</Text>
            <Text style={[styles.subtitle, { fontSize: Math.min(width * 0.035, 16) }]}>Retrouvez des ressources pour gérer votre bien-être avec des articles et exercices</Text>
            {!isSmall && <Ionicons name="chevron-down" size={48} color="#1e5c1e" style={{ marginTop: 24 }} />}
          </View>
          <View style={styles.cardsContainer}>
            {cards.map((card, index) => (
              <TouchableOpacity key={index} style={styles.card}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                <Text style={styles.cardTitre}>{card.titre}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <Text style={styles.cardLien}>En savoir plus →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef0f8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  home: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontSize: 50,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
},
card: {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 20,
  borderLeftWidth: 4,
  borderLeftColor: '#1e5c1e',
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
},
cardEmoji: {
  fontSize: 32,
  marginBottom: 8,
},
cardTitre: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1a1a2e',
  marginBottom: 6,
},
cardDescription: {
  fontSize: 14,
  color: '#4a4a6a',
  lineHeight: 20,
},
cardLien: {
  marginTop: 12,
  color: '#1e5c1e',
  fontWeight: '600',
},

});

