import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Text,
  useTheme,
  Chip,
  List,
  Divider,
  RadioButton,
  Checkbox,
  SegmentedButtons,
  FAB,
  Portal,
  Modal,
  IconButton,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import {
  Inspection,
  InspectionPlan,
  InspectionParameter,
  InspectionResult,
  Product,
} from '../types';

const InspectionFormScreen: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InspectionPlan | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { saveInspection, getOfflineData } = useOffline();
  const theme = useTheme();

  useEffect(() => {
    initializeForm();
    getCurrentLocation();
  }, []);

  const initializeForm = async () => {
    try {
      const data = await getOfflineData();
      
      // Check for barcode data from scanner
      const barcodeData = (route.params as any)?.barcodeData;
      if (barcodeData) {
        const product = data.products.find(p => p.code === barcodeData);
        if (product) {
          setSelectedProduct(product);
          const plan = data.inspectionPlans.find(p => p.productId === product.id);
          if (plan) {
            setSelectedPlan(plan);
            initializeFormData(plan.parameters);
          }
        }
      }

      // Check for pre-selected product/plan
      const productId = (route.params as any)?.productId;
      const planId = (route.params as any)?.inspectionPlanId;
      
      if (productId) {
        const product = data.products.find(p => p.id === productId);
        if (product) setSelectedProduct(product);
      }
      
      if (planId) {
        const plan = data.inspectionPlans.find(p => p.id === planId);
        if (plan) {
          setSelectedPlan(plan);
          initializeFormData(plan.parameters);
        }
      }
    } catch (error) {
      console.error('Error initializing form:', error);
    }
  };

  const initializeFormData = (parameters: InspectionParameter[]) => {
    const initialData: Record<string, any> = {};
    parameters.forEach(param => {
      if (param.type === 'boolean') {
        initialData[param.id] = false;
      } else if (param.type === 'select' && param.options && param.options.length > 0) {
        initialData[param.id] = param.options[0];
      } else {
        initialData[param.id] = '';
      }
    });
    setFormData(initialData);
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Localização é necessária para inspeções');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Get address
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        setLocation(prev => ({
          ...prev!,
          address: `${address.street}, ${address.city}, ${address.region}`,
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleProductSelect = async () => {
    try {
      const data = await getOfflineData();
      const productNames = data.products.map(p => p.name);
      
      Alert.alert(
        'Selecionar Produto',
        'Escolha um produto:',
        data.products.map((product, index) => ({
          text: product.name,
          onPress: () => {
            setSelectedProduct(product);
            setSelectedPlan(null);
            setFormData({});
          },
        }))
      );
    } catch (error) {
      console.error('Error selecting product:', error);
    }
  };

  const handlePlanSelect = async () => {
    if (!selectedProduct) {
      Alert.alert('Erro', 'Selecione um produto primeiro');
      return;
    }

    try {
      const data = await getOfflineData();
      const plans = data.inspectionPlans.filter(p => p.productId === selectedProduct.id);
      
      if (plans.length === 0) {
        Alert.alert('Erro', 'Nenhum plano de inspeção encontrado para este produto');
        return;
      }

      Alert.alert(
        'Selecionar Plano de Inspeção',
        'Escolha um plano:',
        plans.map((plan, index) => ({
          text: plan.name,
          onPress: () => {
            setSelectedPlan(plan);
            initializeFormData(plan.parameters);
          },
        }))
      );
    } catch (error) {
      console.error('Error selecting plan:', error);
    }
  };

  const handleInputChange = (parameterId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parameterId]: value,
    }));
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Câmera é necessária para capturar fotos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Erro ao capturar foto');
    }
  };

  const handleRecordVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Câmera é necessária para gravar vídeos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30, // 30 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        setVideos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Erro', 'Erro ao gravar vídeo');
    }
  };

  const handleSelectMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Galeria é necessária para selecionar mídia');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'photo' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (mediaType === 'photo') {
          setPhotos(prev => [...prev, result.assets[0].uri]);
        } else {
          setVideos(prev => [...prev, result.assets[0].uri]);
        }
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert('Erro', 'Erro ao selecionar mídia');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!selectedProduct) {
      Alert.alert('Erro', 'Selecione um produto');
      return false;
    }

    if (!selectedPlan) {
      Alert.alert('Erro', 'Selecione um plano de inspeção');
      return false;
    }

    if (!location) {
      Alert.alert('Erro', 'Localização é obrigatória');
      return false;
    }

    // Validate required parameters
    for (const param of selectedPlan.parameters) {
      if (param.required) {
        const value = formData[param.id];
        if (value === '' || value === null || value === undefined) {
          Alert.alert('Erro', `Campo "${param.name}" é obrigatório`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const results: InspectionResult[] = selectedPlan!.parameters.map(param => {
        const value = formData[param.id];
        let isConforming = true;

        // Check if value is within tolerance for numeric parameters
        if (param.type === 'numeric' && param.target && param.tolerance) {
          const numValue = parseFloat(value);
          const min = param.target - param.tolerance;
          const max = param.target + param.tolerance;
          isConforming = numValue >= min && numValue <= max;
        }

        return {
          parameterId: param.id,
          parameterName: param.name,
          value: value,
          unit: param.unit,
          isConforming: isConforming,
        };
      });

      const inspection: Inspection = {
        id: `insp_${Date.now()}`,
        productId: selectedProduct!.id,
        inspectionPlanId: selectedPlan!.id,
        inspectorId: user!.id,
        status: 'completed',
        location: location!,
        results: results,
        photos: photos,
        videos: videos,
        notes: notes,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInspection(inspection);
      
      Alert.alert(
        'Sucesso',
        'Inspeção salva com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving inspection:', error);
      Alert.alert('Erro', 'Erro ao salvar inspeção');
    } finally {
      setIsLoading(false);
    }
  };

  const renderParameterInput = (param: InspectionParameter) => {
    const value = formData[param.id] || '';

    switch (param.type) {
      case 'numeric':
        return (
          <TextInput
            label={param.name}
            value={value.toString()}
            onChangeText={(text) => handleInputChange(param.id, text)}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            right={
              param.unit ? (
                <TextInput.Affix text={param.unit} />
              ) : undefined
            }
          />
        );

      case 'text':
        return (
          <TextInput
            label={param.name}
            value={value.toString()}
            onChangeText={(text) => handleInputChange(param.id, text)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        );

      case 'boolean':
        return (
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={value ? 'checked' : 'unchecked'}
              onPress={() => handleInputChange(param.id, !value)}
            />
            <Text style={styles.checkboxLabel}>{param.name}</Text>
          </View>
        );

      case 'select':
        return (
          <View style={styles.selectContainer}>
            <Text style={styles.selectLabel}>{param.name}</Text>
            <SegmentedButtons
              value={value}
              onValueChange={(val) => handleInputChange(param.id, val)}
              buttons={param.options?.map(option => ({
                value: option,
                label: option,
              })) || []}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* Product and Plan Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Produto e Plano</Title>
            
            <Button
              mode="outlined"
              onPress={handleProductSelect}
              style={styles.selectButton}
            >
              {selectedProduct ? selectedProduct.name : 'Selecionar Produto'}
            </Button>

            {selectedProduct && (
              <Button
                mode="outlined"
                onPress={handlePlanSelect}
                style={styles.selectButton}
              >
                {selectedPlan ? selectedPlan.name : 'Selecionar Plano de Inspeção'}
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Location */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Localização</Title>
            {location ? (
              <View>
                <Text style={styles.locationText}>
                  📍 {location.address || `${location.latitude}, ${location.longitude}`}
                </Text>
                <Chip icon="map-marker" style={styles.locationChip}>
                  Localização capturada
                </Chip>
              </View>
            ) : (
              <Text style={styles.loadingText}>Capturando localização...</Text>
            )}
          </Card.Content>
        </Card>

        {/* Inspection Parameters */}
        {selectedPlan && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Parâmetros de Inspeção</Title>
              {selectedPlan.parameters.map((param) => (
                <View key={param.id} style={styles.parameterContainer}>
                  {renderParameterInput(param)}
                  {param.description && (
                    <Text style={styles.parameterDescription}>
                      {param.description}
                    </Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Media Capture */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Mídia</Title>
            
            <View style={styles.mediaButtons}>
              <Button
                mode="outlined"
                icon="camera"
                onPress={handleTakePhoto}
                style={styles.mediaButton}
              >
                Foto
              </Button>
              
              <Button
                mode="outlined"
                icon="video"
                onPress={handleRecordVideo}
                style={styles.mediaButton}
              >
                Vídeo
              </Button>
              
              <Button
                mode="outlined"
                icon="image"
                onPress={() => {
                  setMediaType('photo');
                  setShowMediaModal(true);
                }}
                style={styles.mediaButton}
              >
                Galeria
              </Button>
            </View>

            {/* Photos */}
            {photos.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.mediaSectionTitle}>Fotos ({photos.length})</Text>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={styles.mediaItemText}>Foto {index + 1}</Text>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => removePhoto(index)}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <View style={styles.mediaSection}>
                <Text style={styles.mediaSectionTitle}>Vídeos ({videos.length})</Text>
                {videos.map((video, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Text style={styles.mediaItemText}>Vídeo {index + 1}</Text>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => removeVideo(index)}
                    />
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Observações</Title>
            <TextInput
              label="Observações adicionais"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading || !selectedProduct || !selectedPlan}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Salvar Inspeção
        </Button>
      </ScrollView>

      {/* Media Selection Modal */}
      <Portal>
        <Modal
          visible={showMediaModal}
          onDismiss={() => setShowMediaModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>
            Selecionar {mediaType === 'photo' ? 'Foto' : 'Vídeo'}
          </Title>
          <Button
            mode="contained"
            onPress={() => {
              handleSelectMedia();
              setShowMediaModal(false);
            }}
            style={styles.modalButton}
          >
            Escolher da Galeria
          </Button>
          <Button
            mode="outlined"
            onPress={() => setShowMediaModal(false)}
            style={styles.modalButton}
          >
            Cancelar
          </Button>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
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
  selectButton: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  selectContainer: {
    marginBottom: 15,
  },
  selectLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  parameterContainer: {
    marginBottom: 15,
  },
  parameterDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    marginLeft: 16,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  locationChip: {
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  mediaButton: {
    flex: 1,
  },
  mediaSection: {
    marginTop: 15,
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mediaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    marginBottom: 4,
  },
  mediaItemText: {
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    marginBottom: 10,
  },
});

export default InspectionFormScreen;
