import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  useTheme,
} from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BarcodeScannerScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [scannedType, setScannedType] = useState<string>('');

  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setScannedData(data);
    setScannedType(type);
    
    // Vibrate or play sound to indicate successful scan
    // You can add haptic feedback here
    
    Alert.alert(
      'Código Escaneado!',
      `Tipo: ${type}\nDados: ${data}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Usar',
          onPress: () => {
            const onBarcodeScanned = (route.params as any)?.onBarcodeScanned;
            if (onBarcodeScanned) {
              onBarcodeScanned(data);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleManualInput = () => {
    Alert.prompt(
      'Entrada Manual',
      'Digite o código do produto:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (text) => {
            if (text) {
              const onBarcodeScanned = (route.params as any)?.onBarcodeScanned;
              if (onBarcodeScanned) {
                onBarcodeScanned(text);
              }
              navigation.goBack();
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Solicitando permissão da câmera...</Title>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Sem acesso à câmera</Title>
            <Paragraph>
              O acesso à câmera é necessário para escanear códigos de barras.
            </Paragraph>
            <Button
              mode="contained"
              onPress={handleManualInput}
              style={styles.button}
            >
              Entrada Manual
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.scanner}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Card style={styles.headerCard}>
            <Card.Content>
              <Title style={styles.headerTitle}>Scanner de Código</Title>
              <Paragraph style={styles.headerSubtitle}>
                Posicione o código de barras ou QR Code na área destacada
              </Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Scan Area */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Card style={styles.footerCard}>
            <Card.Content>
              <Button
                mode="outlined"
                onPress={handleManualInput}
                style={styles.button}
              >
                Entrada Manual
              </Button>
              
              {scanned && (
                <Button
                  mode="contained"
                  onPress={() => setScanned(false)}
                  style={styles.button}
                >
                  Escanear Novamente
                </Button>
              )}
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          💡 Dica: Mantenha o código estável e bem iluminado
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  headerTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    marginTop: 5,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    top: 'auto',
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  cornerBottomRight: {
    top: 'auto',
    bottom: 0,
    right: 0,
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  footerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  button: {
    marginVertical: 5,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  card: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
});

export default BarcodeScannerScreen;
