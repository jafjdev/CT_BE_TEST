// eslint-disable-next-line
const path = require('node:path');
// eslint-disable-next-line
const response = require(path.resolve(__dirname, '../assets/timetables.json'));

function checkError(port) {
  const valid =
    port === 'MAD1' || port === 'MAD2' || port === 'BCN1' || port === 'VAL1' || port === 'IBZ1';

  return !valid;
}

module.exports = [
  {
    id: 'timetables',
    url: '/timetables',
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

            if (checkError(req.body.from)) res.status(500).send('GenericError');
            if (checkError(req.body.to)) res.status(500).send('GenericError');
            if (req.body.from === req.body.to) res.status(500).send('GenericError');

            if (!req.body.date) res.status(500).send('GenericError');
            if (!req.query.adults) res.status(500).send('GenericError');
            if (!req.query.childrens) res.status(500).send('GenericError');

            res.status(200).send({
              timeTables: response.timetables.map(timeTable => ({
                ...timeTable,
                shipId: Math.floor(Math.random() * 100000),
              })),
            });
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
