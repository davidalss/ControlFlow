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
  ProgressBar,
} from 'react-native-paper';
import { useOffline } from '../contexts/OfflineContext';
import { Inspection } from '../types';

const OfflineSyncScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingItems, setPendingItems] = useState<Inspection[]>([]);

  const { isOnline, syncStatus, syncData, getOfflineData } = useOffline();
  const theme = useTheme();

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const data = await getOfflineData();
      setPendingItems(data.inspections.filter(i => !i.synced));
    } catch (error) {
      console.error('Error loading pending items:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPendingItems();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar dados');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Erro', 'Sem conexão com a internet');
      return;
    }

    setSyncProgress(0);
    
    try {
      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await syncData();
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      setTimeout(() => {
        setSyncProgress(0);
        loadPendingItems();
      }, 1000);
      
      Alert.alert('Sucesso', 'Sincronização concluída com sucesso!');
    } catch (error) {
      setSyncProgress(0);
      Alert.alert('Erro', 'Erro durante a sincronização');
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Connection Status */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Status da Conexão</Title>
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
              
              {syncStatus.lastSync && (
                <Text style={styles.lastSyncText}>
                  Última sincronização: {formatDate(syncStatus.lastSync)}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Sync Progress */}
        {syncProgress > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Sincronizando...</Title>
              <ProgressBar
                progress={syncProgress / 100}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {syncProgress}% concluído
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Sync Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Sincronização</Title>
            <Paragraph style={styles.cardDescription}>
              Sincronize os dados offline com o servidor quando estiver conectado à internet.
            </Paragraph>
            
            <View style={styles.syncActions}>
              <Button
                mode="contained"
                icon="sync"
                onPress={handleSync}
                loading={syncStatus.syncInProgress}
                disabled={!isOnline || syncStatus.syncInProgress}
                style={styles.syncButton}
              >
                Sincronizar Agora
              </Button>
              
              <Button
                mode="outlined"
                icon="refresh"
                onPress={onRefresh}
                style={styles.refreshButton}
              >
                Atualizar
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Pending Items */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>
              Itens Pendentes ({pendingItems.length})
            </Title>
            
            {pendingItems.length > 0 ? (
              <View style={styles.pendingList}>
                {pendingItems.map((inspection, index) => (
                  <View key={inspection.id}>
                    <List.Item
                      title={`Inspeção ${inspection.id}`}
                      description={formatDate(inspection.createdAt)}
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
                    {index < pendingItems.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✅</Text>
                <Text style={styles.emptyTitle}>Nenhum item pendente</Text>
                <Text style={styles.emptySubtitle}>
                  Todos os dados estão sincronizados com o servidor.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Sync Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Estatísticas</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{pendingItems.length}</Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {pendingItems.filter(i => i.photos.length > 0).length}
                </Text>
                <Text style={styles.statLabel}>Com Fotos</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {pendingItems.filter(i => i.videos.length > 0).length}
                </Text>
                <Text style={styles.statLabel}>Com Vídeos</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {pendingItems.filter(i => i.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Concluídas</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Sync Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Informações</Title>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📱</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Modo Offline</Text>
                  <Text style={styles.infoDescription}>
                    O app funciona mesmo sem internet. Os dados são salvos localmente e sincronizados quando a conexão for restaurada.
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔄</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Sincronização Automática</Text>
                  <Text style={styles.infoDescription}>
                    Os dados são sincronizados automaticamente quando você está online.
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>💾</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Armazenamento Local</Text>
                  <Text style={styles.infoDescription}>
                    Todos os dados são armazenados localmente no dispositivo para acesso offline.
                  </Text>
                </View>
              </View>
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
  cardDescription: {
    marginBottom: 15,
    opacity: 0.7,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusChip: {
    marginBottom: 10,
  },
  lastSyncText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  progressBar: {
    marginBottom: 10,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  syncActions: {
    gap: 10,
  },
  syncButton: {
    marginBottom: 10,
  },
  refreshButton: {
    marginBottom: 10,
  },
  pendingList: {
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  infoList: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default OfflineSyncScreen;
