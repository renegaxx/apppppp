import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    query,
    where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const UsuariosConversas = () => {
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [unaddedUsers, setUnaddedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('Adicionados'); // Aba ativa
    const db = getFirestore();
    const auth = getAuth();

    const tabs = ['Adicionados', 'Não Adicionados', 'Favoritos'];

    const fetchUsers = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            setLoading(true);

            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            const addedUsers = userDoc.exists() ? userDoc.data().addedUsers || [] : [];
            setUsers(addedUsers);

            const messagesQuery = query(
                collection(db, 'messages'),
                where('recipientId', '==', currentUser.uid)
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            const senders = new Set();

            messagesSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.senderId && !addedUsers.some((u) => u.id === data.senderId)) {
                    senders.add(data.senderId);
                }
            });

            const unaddedUsersList = [];
            for (const senderId of senders) {
                const senderDocRef = doc(db, 'users', senderId);
                const senderDoc = await getDoc(senderDocRef);
                if (senderDoc.exists()) {
                    unaddedUsersList.push({
                        id: senderId,
                        ...senderDoc.data(),
                    });
                }
            }

            setUnaddedUsers(unaddedUsersList);
            const favoritesData = userDoc.exists() ? userDoc.data().favorites || [] : [];
            setFavorites(favoritesData);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleFavorite = async (userId) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
            if (favorites.includes(userId)) {
                setFavorites((prevFavorites) => prevFavorites.filter((id) => id !== userId));
                await updateDoc(userDocRef, {
                    favorites: arrayRemove(userId),
                });
            } else {
                setFavorites((prevFavorites) => [...prevFavorites, userId]);
                await updateDoc(userDocRef, {
                    favorites: arrayUnion(userId),
                });
            }
        } catch (error) {
            console.error('Erro ao atualizar favoritos:', error);
        }
    };

    const renderTabItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.tabButton,
                activeTab === item && styles.activeTab,
            ]}
            onPress={() => setActiveTab(item)}
        >
            <Text style={styles.tabButtonText}>{item}</Text>
        </TouchableOpacity>
    );

    const renderUserItem = ({ item }) => {
        const isFavorite = favorites.includes(item.id);

        return (
            <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen', { userId: item.id })} style={styles.userItem}>
                <Image source={require('./assets/mcigPerfil.jpg')} style={styles.perfilImage} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.username || 'Usuário desconhecido'}</Text>
                    <Text style={styles.userLastMessage}>Última mensagem</Text>
                </View>
                {activeTab === 'Não Adicionados' && (
                    <TouchableOpacity onPress={() => addUser(item.id)} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Adicionar</Text>
                    </TouchableOpacity>
                )}
                {(activeTab === 'Adicionados' || activeTab === 'Favoritos') && (
                    <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.favoriteButton}>
                        <Text style={{ color: isFavorite ? '#FFD700' : '#A1A0A0' }}>★</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Conversas</Text>

            <View style={styles.carouselContainer}>
                <FlatList
                    data={tabs}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderTabItem}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#9F3EFC" />
            ) : (
                <FlatList
                    data={
                        activeTab === 'Adicionados'
                            ? users
                            : activeTab === 'Favoritos'
                                ? users.filter((user) => favorites.includes(user.id))
                                : unaddedUsers
                    }
                    keyExtractor={(item) => item.id}
                    renderItem={renderUserItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 50,
    },
    headerText: {
        fontSize: 16,
        fontFamily: 'Raleway-SemiBold',
        color: 'white',
        textAlign: 'center',
    },
    carouselContainer: {
        width: '100%',
        height: 40,
        marginTop: 20,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#333',
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: '#9F3EFC',
    },
    tabButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Raleway-SemiBold',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    perfilImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        color: 'white',
    },
    userLastMessage: {
        fontSize: 14,
        color: '#A1A0A0',
    },
    addButton: {
        backgroundColor: '#9F3EFC',
        borderRadius: 5,
        padding: 5,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    favoriteButton: {
        marginLeft: 10,
    },
    emptyText: {
        color: '#A1A0A0',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default UsuariosConversas;
