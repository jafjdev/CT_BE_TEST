// eslint-disable-next-line
const path = require('node:path');
// eslint-disable-next-line
const accommodations = require(path.resolve(__dirname, '../assets/accommodations.json'));

module.exports = [
  {
    id: 'accommodations',
    url: '/accommodations',
    method: 'POST',
    variants: [
      {
        id: 'success',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            core.logger.info('Servivuelo Request received!');
            core.logger.debug('Query' + JSON.stringify(req.query));
            core.logger.debug('Body' + JSON.stringify(req.body));

            if (!req.body.shipID) res.status(500).send('GenericError');
            if (!req.body.departureDate) res.status(500).send('GenericError');

            res.status(200).send(accommodations);
          },
        },
      },
      {
        id: 'fail',
        type: 'text',
        options: {
          status: 500,
          body: 'The server is not accessible',
        },
      },
    ],
  },
];
