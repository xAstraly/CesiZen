import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MyHeader = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuVisibleProfil, setMenuVisibleProfil] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    setMenuVisibleProfil(false);
  };

  const toggleMenuProfil = () => {
    setMenuVisibleProfil(!menuVisibleProfil);
    setMenuVisible(false);
  };

  if (isDesktop) {
    return (
      <View style={[styles.DesktopHeader, { paddingTop: insets.top }]}>
        <Image style={styles.logo} source={require('../assets/images/logo.png')} resizeMode="contain" />
        <Pressable style={({ hovered, pressed }) => [styles.navLink,hovered && styles.navLinkHovered,]}>
          <Text style={styles.navLinkText}>Articles</Text>
        </Pressable>
        <Pressable style={({ hovered, pressed }) => [styles.navLink,hovered && styles.navLinkHovered,]}>
          <Text style={styles.navLinkText}>Respiration</Text>
        </Pressable>
        <Pressable style={({ hovered, pressed }) => [styles.navLink,hovered && styles.navLinkHovered,]}>
          <Text style={styles.navLinkText}>Emotions</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.hamburgerButton} onPress={toggleMenu}>
          <Text style={styles.hamburgerIcon}>{menuVisible ? '✕' : '☰'}</Text>
        </TouchableOpacity>

        <Image style={styles.logo} source={require('../assets/images/logo.png')} />

        <TouchableOpacity style={styles.profilButton} onPress={toggleMenuProfil}>
          <Ionicons name="person-circle-outline" size={32} color="#1a2060" />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
            <Text style={styles.menuItemText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
            <Text style={styles.menuItemText}>Respiration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
            <Text style={styles.menuItemText}>Émotions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
            <Text style={styles.menuItemText}>Articles</Text>
          </TouchableOpacity>
        </View>
      )}

      {menuVisibleProfil && (
        <View style={styles.menuProfil}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisibleProfil(false)}>
            <Text style={styles.menuItemText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisibleProfil(false)}>
            <Text style={styles.menuItemText}>Paramètres</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1a2060',
  },
  ArticleHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    
  },
  hamburgerButton: {
    position: 'absolute',
    left: 16,
    bottom: 12,
  },
  hamburgerIcon: {
    color: '#1a2060',
    fontSize: 28,
  },
  profilButton: {
    position: 'absolute',
    right: 16,
    bottom: 12,
  },
  profilButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  logo: {
    width: 100,
    height: 40,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menu: {
    backgroundColor: '#1a2060',
    paddingVertical: 8,
  },
  menuProfil: {
    backgroundColor: '#1a2060',
    paddingVertical: 8,
    alignSelf: 'flex-end',
    minWidth: 160,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3080',
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  LogoHeader: {
    backgroundColor: '#2a3068',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navLink: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 6,
  },
navLinkHovered: {
  backgroundColor: 'rgba(124, 112, 112, 0.15)', // légère surbrillance
},
navLinkText: {
  color: '#000000',
  fontSize: 15,
  fontWeight: '500',
},

  DesktopHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#1a2060',
    paddingHorizontal: 24,
    paddingVertical: 0,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
  }
});

export default MyHeader;
