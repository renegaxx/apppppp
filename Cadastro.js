import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert, Image, FlatList } from 'react-native';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const Cadastro = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedGostos, setSelectedGostos] = useState([]); // Novo estado para armazenar os gostos selecionados

  // Lista de gostos disponíveis
  const gostos = ['Cursos', 'Podcasts', 'Vendas', 'Blogs', 'Videogames', 'Moda', 'Programação', 'Marketing Digital'];

  // Animações
  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withTiming(1, { duration: 700 });
    translateY.value = withTiming(0, { duration: 700 });
  }, []);

  const handleNext = () => {
    // Validações para cada etapa
    if (step === 0 && !fullName) {
      Alert.alert('Erro', 'Por favor, preencha o nome.');
      return;
    } else if (step === 1 && !phone) {
      Alert.alert('Erro', 'Por favor, preencha o número.');
      return;
    } else if (step === 2 && !email) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail.');
      return;
    } else if (step === 3 && !username) {
      Alert.alert('Erro', 'Por favor, preencha o nome de usuário.');
      return;
    } else if (step === 4 && selectedGostos.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos um gosto.');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    try {
      // Criação do usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Após a criação do usuário, salve seus dados no Firestore
      const userRef = doc(db, 'users', userCredential.user.uid); // Usando o UID do usuário como ID do documento no Firestore
      await setDoc(userRef, {
        fullName,
        phone,
        email,
        username,
        gostos: selectedGostos, // Salvando os gostos selecionados
        createdAt: new Date(),
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erro', 'O e-mail já está em uso. Por favor, faça login.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Erro', 'Não foi possível criar a conta. Verifique as informações fornecidas.');
      }
    }
  };

  const handleGostoSelect = (gosto) => {
    setSelectedGostos(prev => 
      prev.includes(gosto) ? prev.filter(item => item !== gosto) : [...prev, gosto]
    );
  };

  const renderCurrentInput = () => {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: contentOpacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View style={[styles.inputContainer, animatedStyle]}>
        {step === 0 && (
          <TextInput
            style={styles.input}
            placeholder="Nome e Sobrenome"
            placeholderTextColor="#ccc"
            value={fullName}
            onChangeText={setFullName}
          />
        )}
        {step === 1 && (
          <TextInput
            style={styles.input}
            placeholder="Número"
            placeholderTextColor="#ccc"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )}
        {step === 2 && (
          <>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#ccc"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </>
        )}
        {step === 3 && (
          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário"
            placeholderTextColor="#ccc"
            value={username}
            onChangeText={setUsername}
          />
        )}
        {step === 4 && (
          <View style={styles.gostosContainer}>
            <Text style={styles.gostosTitle}>Selecione seus gostos</Text>
            <FlatList
              data={gostos}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.gostoItem, selectedGostos.includes(item) && styles.selectedGosto]}
                  onPress={() => handleGostoSelect(item)}
                >
                  <Text style={styles.gostoText}>{item}</Text>
                </TouchableOpacity>
              )}
              numColumns={2}
            />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Image source={require('./assets/black3.png')} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.content, useAnimatedStyle(() => ({ opacity: titleOpacity.value }))]}>
        <Text style={styles.title}>Cadastro</Text>
        {renderCurrentInput()}
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{step < 4 ? 'Avançar' : 'Finalizar Cadastro'}</Text>
        </TouchableOpacity>
        <View style={styles.textAcesso}>
          <Text style={styles.textAcessoText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.textAcessoLink}>Clique Aqui</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Raleway-Bold',
    marginBottom: 20,
    color: 'white',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 20,
    color: 'white',
    fontFamily: 'Raleway-Regular',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#9F3EFC',
    width: '100%',
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
  },
  textAcesso: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  textAcessoText: {
    color: 'white',
    marginRight: 5,
    fontFamily: 'Raleway-SemiBold',
    fontSize: 15,
  },
  textAcessoLink: {
    color: '#9F3EFC',
    fontFamily: 'Raleway-SemiBold',
    fontSize: 15,
  },
  gostosContainer: {
    width: '100%',
    alignItems: 'center',
  },
  gostosTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  gostoItem: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 15,
    margin: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedGosto: {
    backgroundColor: '#9F3EFC',
    opacity: 0.8,
    borderColor: '#9F3EFC'
  },
  gostoText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Raleway-Bold'
  },
});

export default Cadastro;
