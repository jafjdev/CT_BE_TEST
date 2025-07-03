// eslint-disable-next-line
const path = require('node:path');
// eslint-disable-next-line

module.exports = [
  {
    id: 'prices',
    url: '/prices',
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
            if (!req.body.accommodation) res.status(500).send('GenericError');
            if (!req.query.pax) res.status(500).send('GenericError');
            if (req.query.pax !== 'adult' && req.query.bonus) res.status(500).send('GenericError');

            let price = Math.floor(Math.random() * 10) + 20;
            const bonus = req.query?.bonus && JSON.parse(req.query.bonus);
            if (bonus?.some(bonus => bonus === 'retired')) price = price - 15;
            if (req.body.accommodation === 'Estandar') price = price + 10;
            if (req.body.accommodation === 'Confort') price = price + 20;
            if (req.body.accommodation === 'Premium') price = price + 30;
            if (req.query.pax === 'adult') price = price + 10;

            res.status(200).send(String(price));
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
