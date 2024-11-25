import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const NetworkingScreen = ({ navigation }) => {
  const [gostos, setGostos] = useState([]);
  const [loading, setLoading] = useState(false); // Exclusivo para carregar gostos
  const [contentLoading, setContentLoading] = useState(false); // Exclusivo para carregar conteúdo
  const [selectedTab, setSelectedTab] = useState('');
  const [selectedGosto, setSelectedGosto] = useState('');
  const [content, setContent] = useState([]);
  const [userPlan, setUserPlan] = useState(''); // Estado para armazenar o plano do usuário
  const [error, setError] = useState(''); // Estado para lidar com erros

  // Busca os gostos do usuário
  const fetchUserGostos = async () => {
    setLoading(true); // Carregando gostos
    const user = getAuth().currentUser;

    if (user) {
      try {
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setGostos(userData.gostos || []);
          setUserPlan(userData.plano || ''); // Armazena o plano do usuário
        } else {
          console.log('Usuário não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar gostos do usuário:', error);
        setError('Erro ao carregar gostos. Tente novamente.');
      } finally {
        setLoading(false); // Finaliza o carregamento dos gostos
      }
    } else {
      console.log('Usuário não autenticado.');
      setLoading(false);
    }
  };

  const fetchContentByTab = async (tab, gosto) => {
    if (!tab) return;
    setContentLoading(true);
    setError(''); // Reseta o erro ao iniciar a nova busca

    try {
      const collectionName = tab === 'Comunidades' ? 'comunidades' : 'eventos';
      const filters = gosto
        ? [where('gosto', '==', gosto)]  // Se um gosto específico for selecionado
        : gostos.length > 0
        ? [where('gosto', 'in', gostos)] // Caso contrário, use o filtro 'in'
        : [];  // Se 'gostos' estiver vazio, não use o filtro 'in'

      if (filters.length === 0) {
        setContentLoading(false);
        setContent([]);
        return;
      }

      const contentQuery = query(collection(db, collectionName), ...filters);
      const querySnapshot = await getDocs(contentQuery);

      const fetchedContent = [];
      querySnapshot.forEach((doc) => {
        fetchedContent.push({ id: doc.id, ...doc.data() });
      });

      setContent(fetchedContent);
    } catch (error) {
      console.error(`Erro ao buscar ${tab}:`, error);
      setError(`Erro ao carregar conteúdo para ${tab}. Tente novamente.`);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGostos();
  }, []);

  useEffect(() => {
    if (selectedTab) {
      fetchContentByTab(selectedTab, selectedGosto);
    }
  }, [selectedTab, selectedGosto, gostos]);

  const handleGostoClick = (gosto) => {
    setSelectedGosto(gosto === selectedGosto ? '' : gosto); // Alterna entre selecionar/desselecionar gosto
  };

  const renderGostoItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.gostoItem,
        selectedGosto === item && styles.selectedGosto, // Adiciona estilo para o gosto selecionado
      ]}
      onPress={() => handleGostoClick(item)}
    >
      <Text style={styles.gostoText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderContentItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.contentItem}
      onPress={() => navigation.navigate('EventoScreen', { eventId: item.id })} // Passando o ID do evento para a próxima tela
    >
      <Text style={styles.contentTitle}>{item.titulo || item.nome}</Text>
      <Text style={styles.contentDescription}>{item.descricao}</Text>
      {selectedTab === 'Eventos' && item.dataHora && (
        <Text style={styles.contentDate}>
          Data: {new Date(item.dataHora.seconds * 1000).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Networking</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Comunidades' && styles.activeTab]}
          onPress={() => setSelectedTab('Comunidades')}
        >
          <Text style={styles.tabButtonText}>Comunidades</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'Eventos' && styles.activeTab]}
          onPress={() => setSelectedTab('Eventos')}
        >
          <Text style={styles.tabButtonText}>Eventos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando gostos...</Text>
        ) : gostos.length > 0 ? (
          <FlatList
            data={gostos}
            horizontal={true}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderGostoItem}
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noGostosText}>Nenhum gosto selecionado.</Text>
        )}
      </View>

      {contentLoading ? (
        <ActivityIndicator size="large" color="#9F3EFC" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : content.length > 0 ? (
        <FlatList
          data={content}
          keyExtractor={(item) => item.id}
          renderItem={renderContentItem}
          contentContainerStyle={styles.contentList}
        />
      ) : (
        <Text style={styles.noContentText}>
          {selectedTab
            ? `Nenhum conteúdo encontrado para ${selectedTab.toLowerCase()}.`
            : 'Selecione uma aba acima para ver o conteúdo.'}
        </Text>
      )}

      {/* Botão na aba "Comunidades" para usuários com plano específico */}
      {selectedTab === 'Comunidades' && ['básico', 'avançado', 'premium'].includes(userPlan) && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CriarComunidade')}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {selectedTab === 'Eventos' && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CriarEvento')}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 35,
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 10,
  },
  selectedGosto: {
    backgroundColor: '#9F3EFC',
    borderColor: '#9F3EFC',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold',
    color: 'white',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#333',
    borderRadius: 20,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#9F3EFC',
  },
  tabButtonText: {
    color: '#fff',
    fontFamily: 'Raleway-SemiBold',
  },
  carouselContainer: {
    width: '100%',
    height: 40,
    marginTop: 20,
  },
  gostoItem: {
    borderRadius: 10,
    borderWidth: 0.5,
    paddingHorizontal: 20,
    borderColor: '#fff',
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gostoText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  noGostosText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
  contentList: {
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  contentItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  contentTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentDescription: {
    color: '#aaa',
    marginBottom: 10,
  },
  contentDate: {
    color: '#ddd',
    fontSize: 14,
  },
  noContentText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  criarEvento : {
    width: 40,
    height: 40,
  },
  createButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#9F3EFC',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
  },
  footerIcon: {
    width: 30,
    height: 30,
    tintColor: '#9F3EFC',
  },
});

export default NetworkingScreen;
