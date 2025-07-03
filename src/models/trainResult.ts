import { model, Schema } from 'mongoose';
import { TrainResultDoc } from '@interfaces';

const journeySchema = new Schema({
  departure: {
    date: String,
    time: String,
    station: String,
  },
  arrival: {
    date: String,
    time: String,
    station: String,
  },
  duration: {
    hours: Number,
    minutes: Number,
  },
});

const optionSchema = new Schema({
  accommodation: {
    type: { type: String },
    passengers: {
      adults: String,
      children: String,
    },
  },
  price: {
    total: Number,
    breakdown: {
      adult: Number,
      children: Number,
    },
  },
});

const trainSchema = new Schema({
  type: {
    type: String,
    enum: ['oneway', 'roundtrip', 'multidestination'],
  },
  journeys: [journeySchema],
  options: [optionSchema],
});

const ctSearchSchema = new Schema<TrainResultDoc>({
  parameters: { type: Schema.Types.Mixed, required: true },
  train: trainSchema,
});

export default model<TrainResultDoc>('TrainResult', ctSearchSchema, 'train_results');
