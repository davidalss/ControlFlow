import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  useTheme,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert('Erro', 'Credenciais inválidas');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('inspector@controlflow.com');
    setPassword('password');
    setIsLoading(true);
    
    try {
      const success = await login('inspector@controlflow.com', 'password');
      if (!success) {
        Alert.alert('Erro', 'Erro ao fazer login demo');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer login demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>
            🏭
          </Text>
          <Title style={styles.title}>ControlFlow</Title>
          <Paragraph style={styles.subtitle}>
            Sistema de Qualidade Mobile
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Login</Title>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
            >
              Entrar
            </Button>

            <Button
              mode="outlined"
              onPress={handleDemoLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.demoButton}
            >
              Login Demo
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Use as credenciais demo para testar o app:
          </Text>
          <Text style={styles.credentials}>
            Email: inspector@controlflow.com{'\n'}
            Senha: password
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Funcionalidades:</Text>
          <Text style={styles.feature}>📱 Inspeções em campo</Text>
          <Text style={styles.feature}>📷 Captura de fotos/vídeos</Text>
          <Text style={styles.feature}>📊 Scanner QR Code/Barcode</Text>
          <Text style={styles.feature}>🔄 Sincronização offline</Text>
          <Text style={styles.feature}>📋 Formulários dinâmicos</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  demoButton: {
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  credentials: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
  },
  featuresContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  feature: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default LoginScreen;
