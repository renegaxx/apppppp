import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import Inicio from './Inicio'; // Tela inicial
import Login from './Login';
import Cadastro from './Cadastro';
import TelaInicial from './TelaInicial';
import PerfilScreen from './PerfilScreen';
import MessagesScreen from './MessagesScreen'; // Importação da tela de mensagens
import UsuariosConversas from './UsuariosConversas';
import PesquisarScreen from './PesquisarScreen';
import NetworkingScreen from './NetworkingScreen';
import CriarEvento from './CriarEvento';
import CriarComunidade from './CriarComunidade';
import NotificationsScreen from './NotificationsScreen';
import EventoScreen from './EventoScreen';


import { Image, StyleSheet } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator para o footer
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopLeftRadius: 25, // Adiciona arredondamento no canto superior esquerdo
          paddingTop: 5,
          borderTopRightRadius: 25, // Adiciona arredondamento no canto superior direito
          elevation: 0, // Remove a sombra (se necessário)
          position: 'absolute', // Garante que a barra seja fixa na parte inferior
        },
        tabBarActiveTintColor: '#9F3EFC',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Pesquisar"
        component={PesquisarScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icons/pesquisarImg.png')}
              style={[styles.footerIcon, { tintColor: color }]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Networking"
        component={NetworkingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icons/slaImg.png')}
              style={[styles.footerIcon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="TelaInicial"
        component={TelaInicial}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icons/homeImg.png')}
              style={[styles.footerIcon, { tintColor: color }]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Conversas"
        component={UsuariosConversas}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icons/messageImg.png')}
              style={[styles.footerIcon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notificações"
        component={NotificationsScreen} // Tela de Notificações
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require('./assets/icons/notificationImg.png')}
              style={[styles.footerIcon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator principal
function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={Inicio} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
        <Stack.Screen name="PerfilScreen" component={PerfilScreen} />
        <Stack.Screen name="CriarEvento" component={CriarEvento} />
        <Stack.Screen name="CriarComunidade" component={CriarComunidade} />
        <Stack.Screen name="EventoScreen" component={EventoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  footerIcon: { width: 25, height: 25 },
});

export default Routes;
