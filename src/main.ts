import { createApp } from './app';
import logger from './config/logger';
import { connect } from './config/database';

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database sbefore starting the server
    await connect();
    logger.info('Connected to MongoDB successfully');

    // Create Express app with all middleware and routes configured
    const app = createApp();

    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
