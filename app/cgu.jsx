import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CGU() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Conditions Générales d'Utilisation</Text>
      <Text style={styles.intro}>
        En vous inscrivant sur CESIZen, vous acceptez les présentes Conditions Générales d'Utilisation.
        Veuillez les lire attentivement.
      </Text>

      <Section titre="1. Présentation du service">
        <Line>CESIZen est une application de bien-être mental proposant des articles informatifs, des exercices de respiration, un tracker d'émotions et un diagnostic de stress.</Line>
        <Line>Cette application est développée dans un cadre pédagogique à CESI École d'Ingénieurs et ne constitue pas un service médical.</Line>
      </Section>

      <Section titre="2. Accès au service">
        <Line>L'inscription est ouverte à toute personne majeure.</Line>
        <Line>L'utilisateur s'engage à fournir des informations exactes lors de son inscription.</Line>
        <Line>Chaque compte est strictement personnel et ne peut être partagé.</Line>
        <Line>L'utilisateur est responsable de la confidentialité de ses identifiants.</Line>
      </Section>

      <Section titre="3. Utilisation acceptable">
        <Line>L'utilisateur s'engage à :</Line>
        <Line>• Ne pas utiliser le service à des fins illicites ou malveillantes</Line>
        <Line>• Ne pas tenter d'accéder aux comptes d'autres utilisateurs</Line>
        <Line>• Ne pas publier de contenus offensants, faux ou trompeurs (pour les rédacteurs)</Line>
        <Line>• Respecter les autres utilisateurs et les administrateurs</Line>
      </Section>

      <Section titre="4. Avertissement médical">
        <Line>⚠️ CESIZen n'est pas un service médical ou thérapeutique.</Line>
        <Line>Les contenus et exercices proposés sont à visée informative et de bien-être uniquement.</Line>
        <Line>En cas de détresse psychologique, contactez immédiatement le 3114 (numéro national de prévention du suicide, disponible 24h/24).</Line>
        <Line>Ne substituez pas CESIZen à une consultation professionnelle de santé mentale.</Line>
      </Section>

      <Section titre="5. Données personnelles">
        <Line>Le traitement de vos données est régi par notre Politique de Confidentialité, conforme au RGPD.</Line>
        <Line>Vous pouvez supprimer votre compte et toutes vos données à tout moment depuis votre profil.</Line>
      </Section>

      <Section titre="6. Suspension de compte">
        <Line>L'administrateur se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU, sans préavis.</Line>
      </Section>

      <Section titre="7. Modification des CGU">
        <Line>Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés des modifications significatives.</Line>
        <Line>L'utilisation continue du service après modification vaut acceptation des nouvelles CGU.</Line>
      </Section>

      <Section titre="8. Droit applicable">
        <Line>Les présentes CGU sont soumises au droit français.</Line>
        <Line>Tout litige relatif à l'utilisation de CESIZen sera soumis aux tribunaux compétents français.</Line>
      </Section>

      <Text style={styles.date}>Version en vigueur : mars 2026</Text>
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
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 12 },
  intro: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 24, fontStyle: 'italic' },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#1e5c1e' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e5c1e', marginBottom: 10 },
  text: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 4 },
  date: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
});
