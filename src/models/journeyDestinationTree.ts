import { model, Schema } from 'mongoose';
import { JourneyDestinationTree } from '@interfaces';

const journeyDestinationTreeSchema = new Schema<JourneyDestinationTree>({
  destinationCode: { type: String, required: true },
  destinationTree: [{ type: String }],
  arrivalCode: { type: String, required: true },
  arrivalTree: [{ type: String }],
});

export default model<JourneyDestinationTree>(
  'JourneyDestinationTree',
  journeyDestinationTreeSchema,
  'journey_destination_tree',
);
