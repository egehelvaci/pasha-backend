import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import document from './openapi.json';

export function installSwagger(app: Express) {
  app.get('/api/openapi.json', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(document);
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document, {
    customSiteTitle: 'Pasha API · Swagger',
    swaggerOptions: {
      validatorUrl: null,
      persistAuthorization: false,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: false
    }
  }));
}
