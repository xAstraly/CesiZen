import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PolitiqueConfidentialite() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Politique de confidentialité</Text>
      <Text style={styles.intro}>
        Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679),
        CESIZen s'engage à protéger vos données personnelles.
      </Text>

      <Section titre="1. Responsable du traitement">
        <Line>Le responsable du traitement est l'étudiant développeur du projet CESIZen dans le cadre de CESI École d'Ingénieurs.</Line>
      </Section>

      <Section titre="2. Données collectées">
        <Line>Lors de votre inscription et utilisation, nous collectons :</Line>
        <Line>• Adresse e-mail (identifiant de connexion)</Line>
        <Line>• Prénom et nom</Line>
        <Line>• Mot de passe (stocké chiffré via bcrypt, non lisible)</Line>
        <Line>• Historique des exercices de respiration effectués</Line>
        <Line>• Journal des émotions enregistrées (émotion, intensité, commentaire)</Line>
        <Line>• Résultats des diagnostics de stress (score, niveau de risque)</Line>
      </Section>

      <Section titre="3. Finalité du traitement">
        <Line>Vos données sont utilisées exclusivement pour :</Line>
        <Line>• Gérer votre compte et votre authentification</Line>
        <Line>• Vous permettre de suivre votre historique de bien-être</Line>
        <Line>• Améliorer votre expérience au sein de l'application</Line>
        <Line>Aucune donnée n'est utilisée à des fins commerciales ou publicitaires.</Line>
      </Section>

      <Section titre="4. Stockage et sécurité">
        <Line>Vos données sont stockées sur une base de données PostgreSQL sécurisée.</Line>
        <Line>L'accès est protégé par authentification JWT (token d'accès à durée limitée de 7 jours).</Line>
        <Line>Le token est stocké localement sur votre appareil via AsyncStorage (équivalent du localStorage, pas de cookie).</Line>
        <Line>Aucune donnée n'est transmise à des tiers.</Line>
      </Section>

      <Section titre="5. Durée de conservation">
        <Line>Vos données sont conservées tant que votre compte est actif.</Line>
        <Line>En cas de suppression de votre compte, toutes vos données personnelles et historiques sont définitivement supprimés.</Line>
      </Section>

      <Section titre="6. Vos droits (RGPD)">
        <Line>Conformément au RGPD, vous disposez des droits suivants :</Line>
        <Line>• Droit d'accès : consulter vos données depuis votre profil</Line>
        <Line>• Droit de rectification : modifier vos informations depuis votre profil</Line>
        <Line>• Droit à l'effacement : supprimer votre compte depuis votre profil</Line>
        <Line>• Droit à la portabilité : contactez-nous pour obtenir une export de vos données</Line>
        <Line>• Droit d'opposition : vous pouvez cesser d'utiliser le service à tout moment</Line>
      </Section>

      <Section titre="7. Cookies">
        <Line>CESIZen n'utilise pas de cookies de traçage ou publicitaires.</Line>
        <Line>Seul le token de session est stocké localement sur votre appareil pour maintenir votre connexion.</Line>
      </Section>

      <Section titre="8. Contact">
        <Line>Pour exercer vos droits ou pour toute question relative à vos données, contactez l'équipe via la messagerie interne CESI.</Line>
        <Line>Vous pouvez également saisir la CNIL : www.cnil.fr</Line>
      </Section>

      <Text style={styles.date}>Dernière mise à jour : mars 2026</Text>
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
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#000091' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#000091', marginBottom: 10 },
  text: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 4 },
  date: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 8 },
});
