import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const EventoScreen = ({ route }) => {
    const { eventId } = route.params; // Pegando o ID do evento passado pela navegação
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função para buscar o evento no Firestore
    const fetchEvent = async () => {
        try {
            const eventDoc = doc(db, 'eventos', eventId);
            const eventSnap = await getDoc(eventDoc);
            if (eventSnap.exists()) {
                setEvent(eventSnap.data());
            } else {
                console.log('Evento não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar evento:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9F3EFC" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Evento não encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: event.imagem }} style={styles.eventImage} />
            <Text style={styles.eventTitle}>{event.titulo}</Text>
            <Text style={styles.eventDate}>
                {new Date(event.dataHora.seconds * 1000).toLocaleString()}
            </Text>
            <View style={styles.containerDescription}>
                <Text style={styles.eventDescription}>{event.descricao}</Text>
                <View style={styles.botoes}>
                    <TouchableOpacity style={styles.botao}>
                        <Image
                            source={require('./assets/icons/gostarImg.png')}
                            style={styles.gostar}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.botao}>
                        <Image
                            source={require('./assets/icons/desativadoImg.png')}
                            style={styles.gostar}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.containerBotao}>
                <TouchableOpacity style={[styles.botaoBaixo, styles.cancelButton]}>
                    <Text style={styles.textoBotao2}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botaoBaixo, styles.continueButton]}>
                    <Text style={styles.textoBotao}>Continuar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    errorText: {
        color: '#FFF',
        fontSize: 18,
    },
    eventImage: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        marginBottom: 20,
    },
    eventTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    eventDate: {
        color: '#bbb',
        fontSize: 16,
        marginBottom: 20,
        fontStyle: 'Inter-Regular',
    },
    containerDescription: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    eventDescription: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    botoes: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    botao: {
        padding: 8,
        backgroundColor: '#333',
        borderRadius: 8,
        marginLeft: 10,
    },
    gostar: {
        width: 30,
        height: 30,
        tintColor: '#FFF',
    },
    containerBotao: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    botaoBaixo: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1
    },
    continueButton: {
        backgroundColor: '#9F3EFC',
    },
    textoBotao: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    textoBotao2: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default EventoScreen;
