import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Network from 'expo-network';
import * as SQLite from 'expo-sqlite';
import { OfflineData, SyncStatus, Inspection, Product, InspectionPlan } from '../types';

interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingItems: number;
  syncData: () => Promise<void>;
  saveInspection: (inspection: Inspection) => Promise<void>;
  getOfflineData: () => Promise<OfflineData>;
  clearOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: '',
    pendingItems: 0,
    syncInProgress: false,
  });

  const db = SQLite.openDatabase('controlflow.db');

  useEffect(() => {
    initializeDatabase();
    checkNetworkStatus();
    setupNetworkListener();
  }, []);

  const initializeDatabase = async () => {
    try {
      await createTables();
      await loadInitialData();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const createTables = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Inspections table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY,
            productId TEXT,
            inspectionPlanId TEXT,
            inspectorId TEXT,
            status TEXT,
            location TEXT,
            results TEXT,
            photos TEXT,
            videos TEXT,
            notes TEXT,
            startedAt TEXT,
            completedAt TEXT,
            synced INTEGER DEFAULT 0,
            createdAt TEXT,
            updatedAt TEXT
          )`,
          [],
          () => {},
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Products table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            code TEXT,
            name TEXT,
            description TEXT,
            businessUnit TEXT,
            family TEXT,
            category TEXT,
            specifications TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )`,
          [],
          () => {},
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Inspection Plans table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS inspection_plans (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            productId TEXT,
            businessUnit TEXT,
            parameters TEXT,
            frequency TEXT,
            isActive INTEGER,
            createdAt TEXT,
            updatedAt TEXT
          )`,
          [],
          () => {},
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Pending Sync table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS pending_sync (
            id TEXT PRIMARY KEY,
            type TEXT,
            data TEXT,
            createdAt TEXT
          )`,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const loadInitialData = async (): Promise<void> => {
    // Load mock data for demonstration
    const mockProducts: Product[] = [
      {
        id: '1',
        code: 'PROD-001',
        name: 'Produto A',
        description: 'Descrição do produto A',
        businessUnit: 'BU-001',
        family: 'Família 1',
        category: 'Categoria 1',
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        code: 'PROD-002',
        name: 'Produto B',
        description: 'Descrição do produto B',
        businessUnit: 'BU-001',
        family: 'Família 1',
        category: 'Categoria 2',
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockInspectionPlans: InspectionPlan[] = [
      {
        id: '1',
        name: 'Plano de Inspeção A',
        description: 'Plano de inspeção para o produto A',
        productId: '1',
        businessUnit: 'BU-001',
        parameters: [
          {
            id: '1',
            name: 'Dimensão',
            type: 'numeric',
            unit: 'mm',
            target: 100,
            tolerance: 5,
            required: true,
          },
          {
            id: '2',
            name: 'Peso',
            type: 'numeric',
            unit: 'kg',
            target: 50,
            tolerance: 2,
            required: true,
          },
          {
            id: '3',
            name: 'Aparência',
            type: 'select',
            options: ['Excelente', 'Bom', 'Regular', 'Ruim'],
            required: true,
          },
        ],
        frequency: 'daily',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Save mock data to database
    for (const product of mockProducts) {
      await saveProduct(product);
    }

    for (const plan of mockInspectionPlans) {
      await saveInspectionPlan(plan);
    }
  };

  const checkNetworkStatus = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const newIsOnline = networkState.isConnected && networkState.isInternetReachable;
      setIsOnline(newIsOnline);
      setSyncStatus(prev => ({ ...prev, isOnline: newIsOnline }));
    } catch (error) {
      console.error('Network status check error:', error);
    }
  };

  const setupNetworkListener = () => {
    // In a real app, you would set up network state listeners
    // For now, we'll use a simple interval check
    const interval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  };

  const saveInspection = async (inspection: Inspection): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO inspections (
            id, productId, inspectionPlanId, inspectorId, status, location, 
            results, photos, videos, notes, startedAt, completedAt, 
            synced, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            inspection.id,
            inspection.productId,
            inspection.inspectionPlanId,
            inspection.inspectorId,
            inspection.status,
            JSON.stringify(inspection.location),
            JSON.stringify(inspection.results),
            JSON.stringify(inspection.photos),
            JSON.stringify(inspection.videos),
            inspection.notes,
            inspection.startedAt,
            inspection.completedAt,
            inspection.synced ? 1 : 0,
            inspection.createdAt,
            inspection.updatedAt,
          ],
          () => {
            if (!inspection.synced) {
              addToPendingSync('inspection', inspection.id);
            }
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const saveProduct = async (product: Product): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO products (
            id, code, name, description, businessUnit, family, 
            category, specifications, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.code,
            product.name,
            product.description,
            product.businessUnit,
            product.family,
            product.category,
            JSON.stringify(product.specifications),
            product.createdAt,
            product.updatedAt,
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const saveInspectionPlan = async (plan: InspectionPlan): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO inspection_plans (
            id, name, description, productId, businessUnit, parameters, 
            frequency, isActive, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            plan.id,
            plan.name,
            plan.description,
            plan.productId,
            plan.businessUnit,
            JSON.stringify(plan.parameters),
            plan.frequency,
            plan.isActive ? 1 : 0,
            plan.createdAt,
            plan.updatedAt,
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const addToPendingSync = async (type: string, data: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO pending_sync (id, type, data, createdAt) VALUES (?, ?, ?, ?)`,
          [
            `${type}_${Date.now()}`,
            type,
            data,
            new Date().toISOString(),
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const getOfflineData = async (): Promise<OfflineData> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let inspections: Inspection[] = [];
        let products: Product[] = [];
        let inspectionPlans: InspectionPlan[] = [];
        let pendingSync = { inspections: [], photos: [], videos: [] };

        // Get inspections
        tx.executeSql(
          'SELECT * FROM inspections ORDER BY createdAt DESC',
          [],
          (_, { rows }) => {
            inspections = rows._array.map(row => ({
              ...row,
              location: JSON.parse(row.location),
              results: JSON.parse(row.results),
              photos: JSON.parse(row.photos),
              videos: JSON.parse(row.videos),
              synced: Boolean(row.synced),
            }));
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Get products
        tx.executeSql(
          'SELECT * FROM products ORDER BY name',
          [],
          (_, { rows }) => {
            products = rows._array.map(row => ({
              ...row,
              specifications: JSON.parse(row.specifications),
            }));
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Get inspection plans
        tx.executeSql(
          'SELECT * FROM inspection_plans WHERE isActive = 1 ORDER BY name',
          [],
          (_, { rows }) => {
            inspectionPlans = rows._array.map(row => ({
              ...row,
              parameters: JSON.parse(row.parameters),
              isActive: Boolean(row.isActive),
            }));
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Get pending sync
        tx.executeSql(
          'SELECT * FROM pending_sync ORDER BY createdAt',
          [],
          (_, { rows }) => {
            rows._array.forEach(row => {
              if (row.type === 'inspection') {
                pendingSync.inspections.push(row.data);
              } else if (row.type === 'photo') {
                pendingSync.photos.push(row.data);
              } else if (row.type === 'video') {
                pendingSync.videos.push(row.data);
              }
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );

        // Resolve with all data
        resolve({
          inspections,
          products,
          inspectionPlans,
          pendingSync,
        });
      });
    });
  };

  const syncData = async (): Promise<void> => {
    if (!isOnline) {
      throw new Error('No internet connection');
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Get pending sync items
      const pendingItems = await getPendingSyncItems();

      // Mock API calls for sync
      for (const item of pendingItems) {
        await mockSyncAPI(item);
        await removeFromPendingSync(item.id);
      }

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        pendingItems: 0,
        syncInProgress: false,
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const getPendingSyncItems = async (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM pending_sync ORDER BY createdAt',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const removeFromPendingSync = async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM pending_sync WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const clearOfflineData = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM inspections', [], () => {});
        tx.executeSql('DELETE FROM products', [], () => {});
        tx.executeSql('DELETE FROM inspection_plans', [], () => {});
        tx.executeSql('DELETE FROM pending_sync', [], () => resolve());
      });
    });
  };

  const mockSyncAPI = async (item: any): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Syncing item:', item);
  };

  const value: OfflineContextType = {
    isOnline,
    syncStatus,
    pendingItems: syncStatus.pendingItems,
    syncData,
    saveInspection,
    getOfflineData,
    clearOfflineData,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
