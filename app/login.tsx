
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={style.overlayFormulaire}>
            <View style={style.card}>
                <Text style={style.Titre}>Connexion</Text>
                <TextInput
                    placeholder="Nom d'utilisateur"
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
                <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={[style.forgetPassword, { color: '#1a2060', textAlign: 'right', marginBottom: 16 }]}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.BtnConnection}>
                    <Text style={style.BtnConnectionText}>Se connecter</Text>
                </TouchableOpacity>
            </View>
        </View>
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

})
