import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  useTheme,
  List,
  Divider,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { Inspection, Product, InspectionPlan } from '../types';

const InspectionListScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<InspectionPlan[]>([]);

  const navigation = useNavigation();
  const { user } = useAuth();
  const { getOfflineData } = useOffline();
  const theme = useTheme();

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await getOfflineData();
      setInspections(data.inspections);
      setProducts(data.products);
      setPlans(data.inspectionPlans);
    } catch (error) {
      console.error('Error loading inspections:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInspections();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar inspeções');
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewInspection = () => {
    navigation.navigate('InspectionForm' as never);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'in-progress':
        return '#ff9800';
      case 'pending':
        return '#2196f3';
      case 'rejected':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'in-progress':
        return 'Em Andamento';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitada';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredInspections = inspections.filter(inspection => {
    const product = products.find(p => p.id === inspection.productId);
    const plan = plans.find(p => p.id === inspection.inspectionPlanId);
    
    const matchesSearch = searchQuery === '' || 
      (product?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (plan?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (inspection.id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderInspectionItem = (inspection: Inspection) => {
    const product = products.find(p => p.id === inspection.productId);
    const plan = plans.find(p => p.id === inspection.inspectionPlanId);
    
    const conformingResults = inspection.results.filter(r => r.isConforming).length;
    const totalResults = inspection.results.length;
    const conformityRate = totalResults > 0 ? (conformingResults / totalResults) * 100 : 0;

    return (
      <Card key={inspection.id} style={styles.inspectionCard}>
        <Card.Content>
          <View style={styles.inspectionHeader}>
            <View style={styles.inspectionInfo}>
              <Title style={styles.inspectionTitle}>
                {product?.name || 'Produto não encontrado'}
              </Title>
              <Paragraph style={styles.inspectionSubtitle}>
                {plan?.name || 'Plano não encontrado'}
              </Paragraph>
              <Text style={styles.inspectionDate}>
                {formatDate(inspection.createdAt)}
              </Text>
            </View>
            <View style={styles.inspectionStatus}>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  { borderColor: getStatusColor(inspection.status) },
                ]}
                textStyle={{ color: getStatusColor(inspection.status) }}
              >
                {getStatusText(inspection.status)}
              </Chip>
              {!inspection.synced && (
                <Chip
                  mode="outlined"
                  icon="wifi-off"
                  style={styles.offlineChip}
                >
                  Offline
                </Chip>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.inspectionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Conformidade:</Text>
              <Text style={[
                styles.detailValue,
                { color: conformityRate >= 90 ? '#4caf50' : conformityRate >= 70 ? '#ff9800' : '#f44336' }
              ]}>
                {conformityRate.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Resultados:</Text>
              <Text style={styles.detailValue}>
                {conformingResults}/{totalResults} conformes
              </Text>
            </View>

            {inspection.photos.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fotos:</Text>
                <Text style={styles.detailValue}>
                  {inspection.photos.length}
                </Text>
              </View>
            )}

            {inspection.videos.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vídeos:</Text>
                <Text style={styles.detailValue}>
                  {inspection.videos.length}
                </Text>
              </View>
            )}

            {inspection.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Observações:</Text>
                <Text style={styles.notesText} numberOfLines={2}>
                  {inspection.notes}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <Card style={styles.card}>
          <Card.Content>
            <Searchbar
              placeholder="Buscar inspeções..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            
            <View style={styles.filters}>
              <Chip
                selected={filterStatus === 'all'}
                onPress={() => setFilterStatus('all')}
                style={styles.filterChip}
              >
                Todas
              </Chip>
              <Chip
                selected={filterStatus === 'pending'}
                onPress={() => setFilterStatus('pending')}
                style={styles.filterChip}
              >
                Pendentes
              </Chip>
              <Chip
                selected={filterStatus === 'completed'}
                onPress={() => setFilterStatus('completed')}
                style={styles.filterChip}
              >
                Concluídas
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Estatísticas</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inspections.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {inspections.filter(i => i.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {inspections.filter(i => i.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Concluídas</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {inspections.filter(i => !i.synced).length}
                </Text>
                <Text style={styles.statLabel}>Offline</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Inspections List */}
        <View style={styles.listContainer}>
          {filteredInspections.length > 0 ? (
            filteredInspections.map(renderInspectionItem)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>Nenhuma inspeção encontrada</Title>
                <Paragraph style={styles.emptySubtitle}>
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando sua primeira inspeção'
                  }
                </Paragraph>
                {!searchQuery && filterStatus === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleNewInspection}
                    style={styles.emptyButton}
                  >
                    Nova Inspeção
                  </Button>
                )}
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleNewInspection}
        label="Nova Inspeção"
      />
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
  searchbar: {
    marginBottom: 15,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  listContainer: {
    marginBottom: 80, // Space for FAB
  },
  inspectionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  inspectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  inspectionInfo: {
    flex: 1,
  },
  inspectionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  inspectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  inspectionDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  inspectionStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  offlineChip: {
    borderColor: '#ff9800',
  },
  divider: {
    marginVertical: 12,
  },
  inspectionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  emptyCard: {
    marginTop: 20,
    elevation: 2,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyButton: {
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default InspectionListScreen;
