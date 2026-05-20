import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MyFooter = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => router.push('/mentions-legales' as any)}>
          <Text style={styles.link}>Mentions légales</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>·</Text>
        <TouchableOpacity onPress={() => router.push('/politique-confidentialite' as any)}>
          <Text style={styles.link}>Confidentialité</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>·</Text>
        <TouchableOpacity onPress={() => router.push('/cgu' as any)}>
          <Text style={styles.link}>CGU</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.text}>
        © {new Date().getFullYear()} CESIZen — Application de santé mentale — Tous droits réservés
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    fontSize: 12,
    color: '#000091',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 12,
    color: '#aaa',
  },
  text: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});

export default MyFooter;
