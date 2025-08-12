export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  InspectionForm: {
    productId?: string;
    inspectionPlanId?: string;
    barcodeData?: string;
  };
  Camera: {
    onPhotoTaken: (uri: string) => void;
    onVideoRecorded?: (uri: string) => void;
  };
  BarcodeScanner: {
    onBarcodeScanned: (data: string) => void;
  };
};

export type TabParamList = {
  Dashboard: undefined;
  Inspections: undefined;
  Sync: undefined;
  Settings: undefined;
};

export type InspectionFormParams = {
  productId?: string;
  inspectionPlanId?: string;
  barcodeData?: string;
};

export type CameraParams = {
  onPhotoTaken: (uri: string) => void;
  onVideoRecorded?: (uri: string) => void;
};

export type BarcodeScannerParams = {
  onBarcodeScanned: (data: string) => void;
};
