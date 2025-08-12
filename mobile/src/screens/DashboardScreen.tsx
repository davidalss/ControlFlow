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
  FAB,
  List,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import { Inspection, Product, InspectionPlan } from '../types';

const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [offlineData, setOfflineData] = useState<{
    inspections: Inspection[];
    products: Product[];
    inspectionPlans: InspectionPlan[];
  }>({
    inspections: [],
    products: [],
    inspectionPlans: [],
  });

  const navigation = useNavigation();
  const { user } = useAuth();
  const { isOnline, syncStatus, syncData } = useOffline();
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { useOffline } = await import('../contexts/OfflineContext');
      const { getOfflineData } = useOffline();
      const data = await getOfflineData();
      setOfflineData({
        inspections: data.inspections,
        products: data.products,
        inspectionPlans: data.inspectionPlans,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      if (isOnline) {
        await syncData();
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar dados');
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewInspection = () => {
    navigation.navigate('InspectionForm' as never);
  };

  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner' as never, {
      onBarcodeScanned: (data: string) => {
        navigation.navigate('InspectionForm' as never, {
          barcodeData: data,
        } as never);
      },
    } as never);
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

  const recentInspections = offlineData.inspections.slice(0, 5);
  const pendingInspections = offlineData.inspections.filter(
    (i) => i.status === 'pending'
  );
  const completedToday = offlineData.inspections.filter(
    (i) =>
      i.status === 'completed' &&
      new Date(i.completedAt || '').toDateString() === new Date().toDateString()
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.welcomeTitle}>
              Olá, {user?.name?.split(' ')[0]}! 👋
            </Title>
            <Paragraph style={styles.welcomeSubtitle}>
              Bem-vindo ao ControlFlow Mobile
            </Paragraph>
            
            <View style={styles.statusContainer}>
              <Chip
                icon={isOnline ? 'wifi' : 'wifi-off'}
                mode="outlined"
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: isOnline ? '#e8f5e8' : '#ffe8e8',
                  },
                ]}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Chip>
              
              {syncStatus.pendingItems > 0 && (
                <Chip
                  icon="sync"
                  mode="outlined"
                  style={[styles.statusChip, { backgroundColor: '#fff3cd' }]}
                >
                  {syncStatus.pendingItems} pendente(s)
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Ações Rápidas</Title>
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                icon="plus"
                onPress={handleNewInspection}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Nova Inspeção
              </Button>
              
              <Button
                mode="outlined"
                icon="qrcode-scan"
                onPress={handleScanBarcode}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Scanner
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Estatísticas</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{pendingInspections.length}</Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedToday.length}</Text>
                <Text style={styles.statLabel}>Hoje</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{offlineData.products.length}</Text>
                <Text style={styles.statLabel}>Produtos</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{offlineData.inspectionPlans.length}</Text>
                <Text style={styles.statLabel}>Planos</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Inspections */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Inspeções Recentes</Title>
            {recentInspections.length > 0 ? (
              recentInspections.map((inspection, index) => {
                const product = offlineData.products.find(
                  (p) => p.id === inspection.productId
                );
                const plan = offlineData.inspectionPlans.find(
                  (p) => p.id === inspection.inspectionPlanId
                );

                return (
                  <View key={inspection.id}>
                    <List.Item
                      title={product?.name || 'Produto não encontrado'}
                      description={plan?.name || 'Plano não encontrado'}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon="clipboard-check"
                          color={getStatusColor(inspection.status)}
                        />
                      )}
                      right={() => (
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
                      )}
                    />
                    {index < recentInspections.length - 1 && <Divider />}
                  </View>
                );
              })
            ) : (
              <Paragraph style={styles.emptyText}>
                Nenhuma inspeção encontrada
              </Paragraph>
            )}
          </Card.Content>
        </Card>

        {/* Sync Status */}
        {!isOnline && (
          <Card style={[styles.card, { backgroundColor: '#fff3cd' }]}>
            <Card.Content>
              <Title style={styles.cardTitle}>Modo Offline</Title>
              <Paragraph>
                Você está trabalhando offline. Os dados serão sincronizados quando
                a conexão for restaurada.
              </Paragraph>
              {syncStatus.pendingItems > 0 && (
                <Paragraph style={styles.pendingText}>
                  {syncStatus.pendingItems} item(s) aguardando sincronização
                </Paragraph>
              )}
            </Card.Content>
          </Card>
        )}
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
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonContent: {
    paddingVertical: 8,
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
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    fontStyle: 'italic',
  },
  pendingText: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#856404',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
