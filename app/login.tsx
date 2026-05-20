
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { API_URL } from '../constants/api';


export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [tempToken, setTempToken] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const { login } = useAuth();

    const handleLogin = async () => {
        setError('');
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password: password }),
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Email ou mot de passe incorrect');
                return;
            }

            if (data.requires_2fa) {
                setTempToken(data.temp_token);
                setStep('2fa');
                return;
            }

            await login(data.token, data.user);
            router.push('/');
        } catch {
            setError('Impossible de contacter le serveur');
        }
    };

    const handle2FA = async () => {
        setError('');
        try {
            const response = await fetch(`${API_URL}/auth/2fa/verify-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temp_token: tempToken, code: totpCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Code invalide');
                return;
            }
            await login(data.token, data.user);
            router.push('/');
        } catch {
            setError('Impossible de contacter le serveur');
        }
    };
                



    if (step === '2fa') {
        return (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={style.overlayFormulaire}>
                    <View style={style.card}>
                        <Text style={style.Titre}>Vérification A2F</Text>
                        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
                            Ouvrez votre application d'authentification et saisissez le code à 6 chiffres.
                        </Text>
                        <TextInput
                            placeholder="000000"
                            value={totpCode}
                            onChangeText={setTotpCode}
                            style={[style.ChampFormulaire, { fontSize: 28, textAlign: 'center', letterSpacing: 10 }]}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        {error ? <Text style={style.errorText}>{error}</Text> : null}
                        <TouchableOpacity style={style.BtnConnection} onPress={handle2FA} disabled={totpCode.length !== 6}>
                            <Text style={style.BtnConnectionText}>Vérifier</Text>
                        </TouchableOpacity>
                        <Text style={{ textAlign: 'center', marginTop: 14, color: '#888', fontSize: 13 }}
                            onPress={() => { setStep('credentials'); setTotpCode(''); setError(''); }}>
                            ← Retour
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={style.overlayFormulaire}>
                <View style={style.card}>
                    <Text style={style.Titre}>Connexion</Text>
                    <TextInput
                        placeholder="Nom d'utilisateur / Email"
                        value={username}
                        onChangeText={setUsername}
                        style={style.ChampFormulaire}
                    />
                    <TextInput
                        placeholder="Mot de passe"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                        style={style.ChampFormulaire}
                    />
                    <Text style={[style.forgetPassword, { color: '#1a2060', textAlign: 'right', marginBottom: 16 }]} onPress={() => router.push('/forgot-password')}>
                        Mot de passe oublié ?
                    </Text>
                    {error ? <Text style={style.errorText}>{error}</Text> : null}
                    <TouchableOpacity style={style.BtnConnection} onPress={handleLogin}>
                        <Text style={style.BtnConnectionText}>Se connecter</Text>
                    </TouchableOpacity>
                    <Text style={{ textAlign: 'center', marginTop: 16 }}>Pas de compte ? <Text style={style.signUpLink} onPress={() => router.push('/signup')}>S'inscrire</Text></Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>




        
            
        
    );
}

const style = StyleSheet.create({
    overlayFormulaire: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eef0f8',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 32,
        width: '90%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    Titre: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a1a2e',
        marginBottom: 24,
    },
    ChampFormulaire: {
        borderWidth: 1,
        borderColor: '#d0d5e8',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1a1a2e',
        backgroundColor: '#f8f9fc',
        marginBottom: 16,
    },
    BtnConnection: {
        backgroundColor: '#1e5c1e',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    BtnConnectionText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    forgetPassword: {
        fontSize: 14,
        color: '#1a2060',
        textAlign: 'right',
        marginBottom: 16,
    },
    signUpLink: {
        color: '#1a2060',
        fontWeight: '600',
    },
    errorText: {
        color: '#c0392b',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
    },
});
