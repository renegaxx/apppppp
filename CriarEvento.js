import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from './firebaseConfig'; // Importe sua configuração do Firebase
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore'; // Para adicionar e buscar dados do Firestore
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Para upload de imagens
import DateTimePicker from '@react-native-community/datetimepicker'; // Para escolher data e hora
import * as ImagePicker from 'expo-image-picker'; // Para escolher imagem (expo)

const CriarEvento = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataHora, setDataHora] = useState(new Date());
  const [localizacao, setLocalizacao] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gostos, setGostos] = useState([]);
  const [gostoSelecionado, setGostoSelecionado] = useState('');
  const [imagem, setImagem] = useState(null); // Estado para armazenar a imagem
  const user = getAuth().currentUser;

  // Função para gerar um código aleatório de 4 dígitos (letras e números)
  const gerarCodigoAleatorio = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  // Função para pegar a imagem
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.photo, // Usar 'photo' no lugar de 'MediaTypeOptions.Images'
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri); // Armazena o URI da imagem
    }
  };

  // Função para upload da imagem para o Firebase Storage
  const uploadImage = async (uri) => {
    try {
      const storage = getStorage();
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `eventos/${user.uid}/${new Date().toISOString()}`);
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl; // Retorna a URL da imagem armazenada
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  };

  // Busca os gostos do usuário ao carregar a tela
  useEffect(() => {
    const fetchGostos = async () => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setGostos(userData.gostos || []);
          }
        } catch (error) {
          console.error('Erro ao buscar gostos do usuário:', error);
        }
      }
    };

    fetchGostos();
  }, [user]);

  // Função para exibir o DatePicker
  const showDateTimePicker = () => setShowDatePicker(true);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setDataHora(selectedDate || dataHora);
  };

  const handleEventoSubmit = async () => {
    if (!gostoSelecionado) {
      alert('Por favor, selecione um gosto.');
      return;
    }

    if (user) {
      try {
        let imageUrl = null;
        if (imagem) {
          imageUrl = await uploadImage(imagem); // Faz o upload da imagem
        }

        const codigoEvento = gerarCodigoAleatorio(); // Gera o código aleatório de 4 dígitos

        // Adiciona o evento na coleção 'eventos' no Firestore
        await addDoc(collection(db, 'eventos'), {
          titulo,
          descricao,
          dataHora: serverTimestamp(), // Usa o timestamp do Firestore
          localizacao,
          videoLink,
          gosto: gostoSelecionado, // Associa o evento ao gosto selecionado
          usuarioId: user.uid,
          dataCriacao: serverTimestamp(),
          imagemUrl: imageUrl || null, // Armazena a URL da imagem
          codigo: codigoEvento, // Armazena o código do evento
        });

        // Navegar de volta para a tela anterior
        navigation.goBack();
      } catch (error) {
        console.error('Erro ao criar o evento:', error);
      }
    } else {
      console.log('Usuário não autenticado.');
    }
  };

  const renderGostoItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.gostoItem,
        gostoSelecionado === item && styles.gostoItemSelected,
      ]}
      onPress={() => setGostoSelecionado(item)}
    >
      <Text style={styles.gostoText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Título do Evento"
        placeholderTextColor="#aaa"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={styles.input}
        placeholder="Descrição do Evento"
        placeholderTextColor="#aaa"
        value={descricao}
        onChangeText={setDescricao}
        multiline
      />

      {/* Data e Hora */}
      <TouchableOpacity onPress={showDateTimePicker} style={styles.input}>
        <Text style={styles.dateText}>{dataHora.toLocaleString()}</Text>
      </TouchableOpacity>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={dataHora}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Localização"
        placeholderTextColor="#aaa"
        value={localizacao}
        onChangeText={setLocalizacao}
      />

      <TextInput
        style={styles.input}
        placeholder="Link do Vídeo (opcional)"
        placeholderTextColor="#aaa"
        value={videoLink}
        onChangeText={setVideoLink}
      />

      {/* Seção de seleção de gostos */}
      <Text style={styles.sectionTitle}>Selecione um Gosto:</Text>
      <FlatList
        data={gostos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderGostoItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gostoList}
      />

      {/* Seção de imagem */}
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Selecionar Imagem</Text>
      </TouchableOpacity>
      {imagem && <Image source={{ uri: imagem }} style={styles.imagePreview} />}

      <TouchableOpacity onPress={handleEventoSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Criar Evento</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 20,
    color: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#aaa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#fff',
  },
  gostoList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  gostoItem: {
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#333',
    borderRadius: 10,
    height: 50,
  },
  gostoItemSelected: {
    backgroundColor: '#9F3EFC',
  },
  gostoText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#9F3EFC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 20,
    borderRadius: 10,
  },
});

export default CriarEvento;
