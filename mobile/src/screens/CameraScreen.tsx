import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
} from 'react-native-paper';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  const cameraRef = useRef<Camera>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setCapturedMedia(photo.uri);
      
      const onPhotoTaken = (route.params as any)?.onPhotoTaken;
      if (onPhotoTaken) {
        onPhotoTaken(photo.uri);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Erro ao capturar foto');
    }
  };

  const handleRecordVideo = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: Camera.Constants.VideoQuality['720p'],
          maxDuration: 30, // 30 seconds max
        });

        setCapturedMedia(video.uri);
        setIsRecording(false);
        
        const onVideoRecorded = (route.params as any)?.onVideoRecorded;
        if (onVideoRecorded) {
          onVideoRecorded(video.uri);
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error recording video:', error);
        setIsRecording(false);
        Alert.alert('Erro', 'Erro ao gravar vídeo');
      }
    }
  };

  const handleFlipCamera = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const handleToggleFlash = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  const handleRetake = () => {
    setCapturedMedia(null);
  };

  const handleUseMedia = () => {
    const onPhotoTaken = (route.params as any)?.onPhotoTaken;
    const onVideoRecorded = (route.params as any)?.onVideoRecorded;
    
    if (onPhotoTaken && capturedMedia) {
      onPhotoTaken(capturedMedia);
    } else if (onVideoRecorded && capturedMedia) {
      onVideoRecorded(capturedMedia);
    }
    
    navigation.goBack();
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
              O acesso à câmera é necessário para capturar fotos e vídeos.
            </Paragraph>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Voltar
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (capturedMedia) {
    return (
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          type={cameraType}
          flashMode={flashMode}
          style={styles.camera}
        />
        
        {/* Preview Overlay */}
        <View style={styles.previewOverlay}>
          <View style={styles.previewHeader}>
            <Card style={styles.previewCard}>
              <Card.Content>
                <Title style={styles.previewTitle}>Mídia Capturada</Title>
                <Paragraph style={styles.previewSubtitle}>
                  {route.params?.onVideoRecorded ? 'Vídeo gravado com sucesso!' : 'Foto capturada com sucesso!'}
                </Paragraph>
              </Card.Content>
            </Card>
          </View>

          <View style={styles.previewActions}>
            <Button
              mode="outlined"
              icon="camera-retake"
              onPress={handleRetake}
              style={styles.previewButton}
            >
              Nova Captura
            </Button>
            
            <Button
              mode="contained"
              icon="check"
              onPress={handleUseMedia}
              style={styles.previewButton}
            >
              Usar Mídia
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        type={cameraType}
        flashMode={flashMode}
        style={styles.camera}
      />
      
      {/* Camera Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Card style={styles.headerCard}>
            <Card.Content>
              <Title style={styles.headerTitle}>
                {route.params?.onVideoRecorded ? 'Gravar Vídeo' : 'Capturar Foto'}
              </Title>
              <Paragraph style={styles.headerSubtitle}>
                {route.params?.onVideoRecorded 
                  ? 'Toque no botão para iniciar/parar a gravação'
                  : 'Toque no botão para capturar a foto'
                }
              </Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* Camera Controls */}
        <View style={styles.controls}>
          <IconButton
            icon={flashMode === FlashMode.off ? 'flash-off' : 'flash'}
            size={30}
            iconColor="#fff"
            onPress={handleToggleFlash}
            style={styles.controlButton}
          />
          
          <IconButton
            icon="camera-switch"
            size={30}
            iconColor="#fff"
            onPress={handleFlipCamera}
            style={styles.controlButton}
          />
        </View>

        {/* Capture Button */}
        <View style={styles.captureContainer}>
          <View style={styles.captureButtonContainer}>
            <Button
              mode="contained"
              icon={route.params?.onVideoRecorded 
                ? (isRecording ? 'stop' : 'video')
                : 'camera'
              }
              onPress={route.params?.onVideoRecorded ? handleRecordVideo : handleTakePhoto}
              loading={isRecording}
              style={[
                styles.captureButton,
                {
                  backgroundColor: isRecording ? '#f44336' : theme.colors.primary,
                },
              ]}
              contentStyle={styles.captureButtonContent}
            >
              {route.params?.onVideoRecorded 
                ? (isRecording ? 'Parar' : 'Gravar')
                : 'Capturar'
              }
            </Button>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            💡 Dica: Mantenha o dispositivo estável para melhores resultados
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    borderRadius: 50,
  },
  captureButtonContent: {
    paddingHorizontal: 30,
    paddingVertical: 10,
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
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  previewHeader: {
    padding: 20,
    paddingTop: 60,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  previewTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  previewSubtitle: {
    textAlign: 'center',
    marginTop: 5,
  },
  previewActions: {
    padding: 20,
    paddingBottom: 40,
    gap: 10,
  },
  previewButton: {
    marginBottom: 10,
  },
  card: {
    margin: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  button: {
    marginTop: 15,
  },
});

export default CameraScreen;
