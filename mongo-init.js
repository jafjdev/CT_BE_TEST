trainEngine = db.getSiblingDB('trainEngine');
trainEngine.createCollection('journey_destination_tree');
trainEngine.createCollection('supplier_station_correlation');
trainEngine.journey_destination_tree.insertMany([
  {
    destinationCode: 'ATCH',
    destinationTree: ['MAD', 'ES'],
    arrivalCode: 'SANTS',
    arrivalTree: ['BCN', 'ES'],
  },
  {
    destinationCode: 'CHAM',
    destinationTree: ['MAD', 'ES'],
    arrivalCode: 'SANTS',
    arrivalTree: ['BCN', 'ES'],
  },
  {
    destinationCode: 'SANTS',
    destinationTree: ['BCN', 'ES'],
    arrivalCode: 'ATCH',
    arrivalTree: ['MAD', 'ES'],
  },
  {
    destinationCode: 'SANTS',
    destinationTree: ['BCN', 'ES'],
    arrivalCode: 'CHAM',
    arrivalTree: ['MAD', 'ES'],
  },
  {
    destinationCode: 'SANTS',
    destinationTree: ['BCN', 'ES'],
    arrivalCode: 'JSOR',
    arrivalTree: ['VAL', 'ES'],
  },
  {
    destinationCode: 'JSOR',
    destinationTree: ['VAL', 'ES'],
    arrivalCode: 'SANTS',
    arrivalTree: ['BCN', 'ES'],
  },
  {
    destinationCode: 'IBZP',
    destinationTree: ['IBZ', 'ES'],
    arrivalCode: 'JSOR',
    arrivalTree: ['VAL', 'ES'],
  },
  {
    destinationCode: 'JSOR',
    destinationTree: ['VAL', 'ES'],
    arrivalCode: 'IBZP',
    arrivalTree: ['IBZ', 'ES'],
  },
]);

trainEngine.supplier_station_correlation.insertMany([
  {
    code: 'ATCH',
    suppliers: ['SERVIVUELO#MAD1', 'RENFE#XX'],
  },
  {
    code: 'CHAM',
    suppliers: ['SERVIVUELO#MAD2', 'RENFE#XX'],
  },
  {
    code: 'SANTS',
    suppliers: ['SERVIVUELO#BCN1', 'RENFE#XX'],
  },
  {
    code: 'JSOR',
    suppliers: ['SERVIVUELO#VAL1', 'RENFE#XX'],
  },
  {
    code: 'IBZP',
    suppliers: ['SERVIVUELO#IBZ1', 'RENFE#XX'],
  },
]);

searches = db.getSiblingDB('searches');
searches.createCollection('train_results');
