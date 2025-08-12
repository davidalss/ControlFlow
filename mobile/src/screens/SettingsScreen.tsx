import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  List,
  Switch,
  Button,
  Text,
  useTheme,
  Divider,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';

const SettingsScreen: React.FC = () => {
  const [autoSync, setAutoSync] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [photoQuality, setPhotoQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [videoQuality, setVideoQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const { user, logout } = useAuth();
  const { clearOfflineData } = useOffline();
  const theme = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao fazer logout');
            }
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os dados offline? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearOfflineData();
              Alert.alert('Sucesso', 'Dados limpos com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Erro ao limpar dados');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Sobre o ControlFlow',
      'ControlFlow Mobile v1.0.0\n\nSistema de Qualidade para Inspeções em Campo\n\nDesenvolvido com React Native e Expo',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* User Profile */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.profileContainer}>
              <Avatar.Text
                size={60}
                label={user?.name?.charAt(0) || 'U'}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Title style={styles.userName}>{user?.name}</Title>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <Text style={styles.userRole}>
                  {user?.role === 'admin' ? 'Administrador' :
                   user?.role === 'inspector' ? 'Inspetor' :
                   user?.role === 'engineering' ? 'Engenharia' :
                   user?.role === 'supervisor' ? 'Supervisor' : 'Usuário'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Configurações do App</Title>
            
            <List.Item
              title="Sincronização Automática"
              description="Sincronizar dados automaticamente quando online"
              left={(props) => <List.Icon {...props} icon="sync" />}
              right={() => (
                <Switch
                  value={autoSync}
                  onValueChange={setAutoSync}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Localização"
              description="Capturar localização automaticamente"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={() => (
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Notificações"
              description="Receber notificações push"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Media Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Configurações de Mídia</Title>
            
            <List.Item
              title="Qualidade das Fotos"
              description={`Qualidade atual: ${photoQuality === 'low' ? 'Baixa' : photoQuality === 'medium' ? 'Média' : 'Alta'}`}
              left={(props) => <List.Icon {...props} icon="camera" />}
              onPress={() => {
                Alert.alert(
                  'Qualidade das Fotos',
                  'Selecione a qualidade:',
                  [
                    { text: 'Baixa', onPress: () => setPhotoQuality('low') },
                    { text: 'Média', onPress: () => setPhotoQuality('medium') },
                    { text: 'Alta', onPress: () => setPhotoQuality('high') },
                  ]
                );
              }}
            />
            
            <Divider />
            
            <List.Item
              title="Qualidade dos Vídeos"
              description={`Qualidade atual: ${videoQuality === 'low' ? 'Baixa' : videoQuality === 'medium' ? 'Média' : 'Alta'}`}
              left={(props) => <List.Icon {...props} icon="video" />}
              onPress={() => {
                Alert.alert(
                  'Qualidade dos Vídeos',
                  'Selecione a qualidade:',
                  [
                    { text: 'Baixa', onPress: () => setVideoQuality('low') },
                    { text: 'Média', onPress: () => setVideoQuality('medium') },
                    { text: 'Alta', onPress: () => setVideoQuality('high') },
                  ]
                );
              }}
            />
          </Card.Content>
        </Card>

        {/* Data Management */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Gerenciamento de Dados</Title>
            
            <List.Item
              title="Limpar Dados Offline"
              description="Remover todos os dados salvos localmente"
              left={(props) => <List.Icon {...props} icon="delete" color="#f44336" />}
              onPress={handleClearData}
            />
            
            <Divider />
            
            <List.Item
              title="Exportar Dados"
              description="Exportar inspeções para arquivo"
              left={(props) => <List.Icon {...props} icon="download" />}
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em desenvolvimento')}
            />
            
            <Divider />
            
            <List.Item
              title="Importar Dados"
              description="Importar dados de arquivo"
              left={(props) => <List.Icon {...props} icon="upload" />}
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em desenvolvimento')}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Suporte</Title>
            
            <List.Item
              title="Ajuda"
              description="Guia de uso do aplicativo"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em desenvolvimento')}
            />
            
            <Divider />
            
            <List.Item
              title="Relatar Problema"
              description="Enviar relatório de bug"
              left={(props) => <List.Icon {...props} icon="bug" />}
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em desenvolvimento')}
            />
            
            <Divider />
            
            <List.Item
              title="Sobre"
              description="Informações sobre o aplicativo"
              left={(props) => <List.Icon {...props} icon="information" />}
              onPress={handleAbout}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Conta</Title>
            
            <List.Item
              title="Alterar Senha"
              description="Modificar senha da conta"
              left={(props) => <List.Icon {...props} icon="lock" />}
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em desenvolvimento')}
            />
            
            <Divider />
            
            <List.Item
              title="Sair"
              description="Fazer logout da conta"
              left={(props) => <List.Icon {...props} icon="logout" color="#f44336" />}
              onPress={handleLogout}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>ControlFlow Mobile</Text>
              <Text style={styles.appVersion}>Versão 1.0.0</Text>
              <Text style={styles.appDescription}>
                Sistema de Qualidade para Inspeções em Campo
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    opacity: 0.5,
    textTransform: 'capitalize',
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'center',
  },
});

export default SettingsScreen;
