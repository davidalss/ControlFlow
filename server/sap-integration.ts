import axios from 'axios';
import { z } from 'zod';

// SAP Integration Configuration
const SAP_CONFIG = {
  baseURL: process.env.SAP_BASE_URL || 'https://sap-instance.company.com',
  client: process.env.SAP_CLIENT || '100',
  username: process.env.SAP_USERNAME,
  password: process.env.SAP_PASSWORD,
  authToken: process.env.SAP_AUTH_TOKEN,
};

// SAP Data Schemas
const SAPProductSchema = z.object({
  MATNR: z.string(), // Material Number
  MAKTX: z.string(), // Material Description
  MTART: z.string(), // Material Type
  MATKL: z.string(), // Material Group
  MEINS: z.string(), // Base Unit of Measure
  EAN11: z.string().optional(), // EAN Code
  BRGEW: z.number().optional(), // Gross Weight
  NTGEW: z.number().optional(), // Net Weight
  VOLUM: z.number().optional(), // Volume
  PRDHA: z.string().optional(), // Product Hierarchy
});

const SAPInspectionSchema = z.object({
  QMNUM: z.string(), // Quality Notification Number
  MATNR: z.string(), // Material Number
  QMART: z.string(), // Quality Notification Type
  QMGRP: z.string(), // Quality Management Group
  QMCOD: z.string(), // Quality Code
  ERDAT: z.string(), // Creation Date
  ERNAM: z.string(), // Created By
  QMTXT: z.string().optional(), // Short Text
  STATUS: z.string(), // Status
});

export class SAPIntegration {
  private client: any;

  constructor() {
    this.client = axios.create({
      baseURL: SAP_CONFIG.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SAP_CONFIG.authToken}`,
      },
    });
  }

  // Sync Products from SAP
  async syncProducts(businessUnit?: string): Promise<any[]> {
    try {
      const response = await this.client.get('/api/products', {
        params: {
          client: SAP_CONFIG.client,
          businessUnit,
          $select: 'MATNR,MAKTX,MTART,MATKL,MEINS,EAN11,BRGEW,NTGEW,VOLUM,PRDHA',
          $filter: "MTART eq 'FERT'", // Only finished products
        },
      });

      const products = response.data.d.results.map((item: any) => ({
        code: item.MATNR,
        description: item.MAKTX,
        category: item.MATKL,
        businessUnit: this.mapBusinessUnit(item.PRDHA),
        ean: item.EAN11,
        technicalParameters: {
          weight: item.BRGEW,
          netWeight: item.NTGEW,
          volume: item.VOLUM,
          unit: item.MEINS,
        },
      }));

      return products;
    } catch (error) {
      console.error('Error syncing products from SAP:', error);
      throw new Error('Failed to sync products from SAP');
    }
  }

  // Sync Quality Notifications from SAP
  async syncQualityNotifications(dateFrom?: string): Promise<any[]> {
    try {
      const response = await this.client.get('/api/quality-notifications', {
        params: {
          client: SAP_CONFIG.client,
          dateFrom: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          $select: 'QMNUM,MATNR,QMART,QMGRP,QMCOD,ERDAT,ERNAM,QMTXT,STATUS',
        },
      });

      return response.data.d.results.map((item: any) => ({
        notificationNumber: item.QMNUM,
        productCode: item.MATNR,
        notificationType: item.QMART,
        qualityGroup: item.QMGRP,
        qualityCode: item.QMCOD,
        creationDate: item.ERDAT,
        createdBy: item.ERNAM,
        description: item.QMTXT,
        status: item.STATUS,
      }));
    } catch (error) {
      console.error('Error syncing quality notifications from SAP:', error);
      throw new Error('Failed to sync quality notifications from SAP');
    }
  }

  // Send Inspection Results to SAP
  async sendInspectionResult(inspectionData: any): Promise<void> {
    try {
      const sapInspectionData = {
        QMNUM: inspectionData.inspectionId,
        MATNR: inspectionData.productCode,
        QMART: '01', // Quality notification type
        QMGRP: inspectionData.qualityGroup || 'QM01',
        QMCOD: inspectionData.defectType || '01',
        QMTXT: inspectionData.observations,
        STATUS: this.mapInspectionStatus(inspectionData.status),
        ERDAT: new Date().toISOString(),
        ERNAM: inspectionData.inspectorId,
      };

      await this.client.post('/api/quality-notifications', sapInspectionData);
    } catch (error) {
      console.error('Error sending inspection result to SAP:', error);
      throw new Error('Failed to send inspection result to SAP');
    }
  }

  // Get SAP Master Data
  async getMasterData(type: 'materials' | 'vendors' | 'plants'): Promise<any[]> {
    try {
      const endpoints = {
        materials: '/api/materials',
        vendors: '/api/vendors',
        plants: '/api/plants',
      };

      const response = await this.client.get(endpoints[type], {
        params: { client: SAP_CONFIG.client },
      });

      return response.data.d.results;
    } catch (error) {
      console.error(`Error fetching ${type} from SAP:`, error);
      throw new Error(`Failed to fetch ${type} from SAP`);
    }
  }

  // Helper methods
  private mapBusinessUnit(sapHierarchy: string): string {
    const mapping: Record<string, string> = {
      'WAP': 'DIY',
      'WAAW': 'KITCHEN_BEAUTY',
      'TECH': 'TECH',
      'MOTORS': 'MOTOR_COMFORT',
    };

    for (const [key, value] of Object.entries(mapping)) {
      if (sapHierarchy.includes(key)) {
        return value;
      }
    }
    return 'N/A';
  }

  private mapInspectionStatus(status: string): string {
    const mapping: Record<string, string> = {
      'approved': 'A',
      'rejected': 'R',
      'pending': 'P',
      'conditionally_approved': 'C',
    };
    return mapping[status] || 'P';
  }
}

export const sapIntegration = new SAPIntegration();
