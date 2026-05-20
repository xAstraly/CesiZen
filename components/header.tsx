import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MyHeader = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuVisibleProfil, setMenuVisibleProfil] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    refreshUser();
  }, [pathname]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    setMenuVisibleProfil(false);
  };

  const toggleMenuProfil = () => {
    setMenuVisibleProfil(!menuVisibleProfil);
    setMenuVisible(false);
  };

  const navLinkStyle = (path: string) => ({ hovered }: { hovered: boolean }) => [
    styles.navLink,
    hovered && styles.navLinkHovered,
    isActive(path) && styles.navLinkActive,
  ];

  if (isDesktop) {
    return (
      <View style={[styles.desktopHeader, { paddingTop: insets.top }]}>
        {/* Logo */}
        <Pressable onPress={() => router.push('/')} style={navLinkStyle('/__index')}>
          <Image style={styles.logo} source={require('../assets/images/logo.png')} resizeMode="contain" />
        </Pressable>

        {/* Liens publics */}
        <Pressable onPress={() => router.push('/articles')} style={navLinkStyle('/articles')}>
          <Text style={[styles.navLinkText, isActive('/articles') && styles.navLinkTextActive]}>Articles</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/respiration')} style={navLinkStyle('/respiration')}>
          <Text style={[styles.navLinkText, isActive('/respiration') && styles.navLinkTextActive]}>Respiration</Text>
        </Pressable>

        {/* Liens réservés aux connectés */}
        {user && (
          <Pressable onPress={() => router.push('/stress' as any)} style={navLinkStyle('/stress')}>
            <Text style={[styles.navLinkText, isActive('/stress') && styles.navLinkTextActive]}>Stress</Text>
          </Pressable>
        )}
        {user && (
          <Pressable onPress={() => router.push('/emotions')} style={navLinkStyle('/emotions')}>
            <Text style={[styles.navLinkText, isActive('/emotions') && styles.navLinkTextActive]}>Émotions</Text>
          </Pressable>
        )}
        {user && (
          <Pressable onPress={() => router.push('/detente' as any)} style={navLinkStyle('/detente')}>
            <Text style={[styles.navLinkText, isActive('/detente') && styles.navLinkTextActive]}>Détente</Text>
          </Pressable>
        )}

        {/* Liens admin / writer */}
        {user && (user.is_writer || user.is_admin) && (
          <Pressable onPress={() => router.push('/admin' as any)} style={navLinkStyle('/admin')}>
            <Text style={[styles.navLinkText, isActive('/admin') && styles.navLinkTextActive]}>Rédaction</Text>
          </Pressable>
        )}
        {user && user.is_admin && (
          <Pressable onPress={() => router.push('/admin/users' as any)} style={navLinkStyle('/admin/users')}>
            <Text style={[styles.navLinkText, isActive('/admin/users') && styles.navLinkTextActive]}>Utilisateurs</Text>
          </Pressable>
        )}

        {/* Auth */}
        {user ? (
          <View style={styles.authRow}>
            <Pressable onPress={() => router.push('/profile' as any)} style={({ hovered }) => [styles.navLink, hovered && styles.navLinkHovered]}>
              <Text style={styles.navLinkText}>
                {user.prenom && user.nom ? `${user.prenom} ${user.nom.toUpperCase()}` : user.email}
              </Text>
            </Pressable>
            <Pressable onPress={logout} style={({ hovered }) => [styles.logoutBtn, hovered && styles.logoutBtnHovered]}>
              <Text style={styles.logoutBtnText}>Déconnexion</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.authRow}>
            <Pressable onPress={() => router.push('/login')} style={({ hovered }) => [styles.navLink, hovered && styles.navLinkHovered]}>
              <Text style={styles.navLinkText}>Connexion</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/signup' as any)} style={({ hovered }) => [styles.navLinkSignup, hovered && styles.navLinkHovered]}>
              <Text style={styles.navLinkSignupText}>Inscription</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Mobile
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
          <TouchableOpacity style={[styles.menuItem, isActive('/') && styles.menuItemActive]} onPress={() => { router.push('/'); setMenuVisible(false); }}>
            <Text style={styles.menuItemText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, isActive('/articles') && styles.menuItemActive]} onPress={() => { router.push('/articles'); setMenuVisible(false); }}>
            <Text style={styles.menuItemText}>Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, isActive('/respiration') && styles.menuItemActive]} onPress={() => { router.push('/respiration'); setMenuVisible(false); }}>
            <Text style={styles.menuItemText}>Respiration</Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity style={[styles.menuItem, isActive('/stress') && styles.menuItemActive]} onPress={() => { router.push('/stress' as any); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Stress</Text>
            </TouchableOpacity>
          )}
          {user && (
            <TouchableOpacity style={[styles.menuItem, isActive('/emotions') && styles.menuItemActive]} onPress={() => { router.push('/emotions'); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Émotions</Text>
            </TouchableOpacity>
          )}
          {user && (
            <TouchableOpacity style={[styles.menuItem, isActive('/detente') && styles.menuItemActive]} onPress={() => { router.push('/detente' as any); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Détente</Text>
            </TouchableOpacity>
          )}
          {user && (user.is_writer || user.is_admin) && (
            <TouchableOpacity style={[styles.menuItem, isActive('/admin') && styles.menuItemActive]} onPress={() => { router.push('/admin' as any); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Rédaction</Text>
            </TouchableOpacity>
          )}
          {user && user.is_admin && (
            <TouchableOpacity style={[styles.menuItem, isActive('/admin/users') && styles.menuItemActive]} onPress={() => { router.push('/admin/users' as any); setMenuVisible(false); }}>
              <Text style={styles.menuItemText}>Utilisateurs</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {menuVisibleProfil && (
        <View style={styles.menuProfil}>
          {user ? (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/profile' as any); setMenuVisibleProfil(false); }}>
                <Text style={styles.menuItemText}>
                  {user.prenom && user.nom ? `${user.prenom} ${user.nom.toUpperCase()}` : user.email}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { logout(); setMenuVisibleProfil(false); }}>
                <Text style={styles.menuItemText}>Déconnexion</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/login'); setMenuVisibleProfil(false); }}>
                <Text style={styles.menuItemText}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { router.push('/signup' as any); setMenuVisibleProfil(false); }}>
                <Text style={styles.menuItemText}>Inscription</Text>
              </TouchableOpacity>
            </>
          )}
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  hamburgerButton: {
    position: 'absolute',
    left: 16,
    bottom: 12,
  },
  hamburgerIcon: {
    color: '#1a2060',
    fontSize: 38,
  },
  profilButton: {
    position: 'absolute',
    right: 16,
    bottom: 12,
  },
  logo: {
    width: 100,
    height: 40,
  },
  menu: {
    backgroundColor: '#1a2060',
    paddingVertical: 8,
  },
  menuProfil: {
    backgroundColor: '#1a2060',
    paddingVertical: 8,
    alignSelf: 'flex-end',
    minWidth: 180,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3080',
  },
  menuItemActive: {
    borderLeftWidth: 3,
    borderLeftColor: '#f0b429',
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  desktopHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 0,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  authRow: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
    gap: 8,
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navLinkHovered: {
    backgroundColor: 'rgba(0, 0, 145, 0.07)',
  },
  navLinkActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000091',
    borderRadius: 0,
  },
  navLinkText: {
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: '500',
  },
  navLinkTextActive: {
    color: '#000091',
    fontWeight: '700',
  },
  navLinkSignup: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#000091',
  },
  navLinkSignupText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  logoutBtnHovered: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  logoutBtnText: {
    color: '#333',
    fontSize: 14,
  },
});

export default MyHeader;
