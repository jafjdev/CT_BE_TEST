import { model, Schema } from 'mongoose';
import { SupplierStationCorrelation } from '@interfaces';

const supplierStationCorrelationSchema = new Schema<SupplierStationCorrelation>({
  code: { type: String, required: true },
  suppliers: [{ type: String }],
});

export default model<SupplierStationCorrelation>(
  'SupplierStationCorrelation',
  supplierStationCorrelationSchema,
  'supplier_station_correlation',
);
