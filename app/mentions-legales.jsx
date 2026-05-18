import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MentionsLegales() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Mentions légales</Text>

      <Section titre="Éditeur de l'application">
        <Line>Cette application a été développée dans le cadre d'un projet pédagogique individuel à CESI École d'Ingénieurs.</Line>
        <Line>Établissement : CESI École d'Ingénieurs</Line>
        <Line>Projet : CESIZen — Application de santé mentale</Line>
      </Section>

      <Section titre="Hébergement">
        <Line>L'application est hébergée localement dans le cadre du projet scolaire.</Line>
        <Line>La base de données est gérée sur un serveur PostgreSQL interne.</Line>
      </Section>

      <Section titre="Propriété intellectuelle">
        <Line>L'ensemble des contenus présents sur CESIZen (textes, articles, exercices) sont la propriété de leurs auteurs respectifs.</Line>
        <Line>Toute reproduction sans autorisation est interdite.</Line>
      </Section>

      <Section titre="Responsabilité">
        <Line>CESIZen est une application à visée informative et bien-être. Elle ne remplace en aucun cas un avis médical ou un suivi professionnel de santé mentale.</Line>
        <Line>En cas de détresse psychologique, veuillez contacter le 3114 (numéro national de prévention du suicide).</Line>
      </Section>

      <Section titre="Contact">
        <Line>Pour toute question relative à l'application, vous pouvez contacter l'équipe via la messagerie interne CESI.</Line>
      </Section>
    </ScrollView>
  );
}

const Section = ({ titre, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{titre}</Text>
    {children}
  </View>
);

const Line = ({ children }) => (
  <Text style={styles.text}>{children}</Text>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#eef0f8', padding: 20, paddingBottom: 40 },
  back: { color: '#000091', fontWeight: '600', fontSize: 14, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 24 },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#000091' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000091', marginBottom: 10 },
  text: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 6 },
});
