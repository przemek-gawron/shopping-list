import './db';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { authPublicRouter, meHandler } from './routes/auth';
import recipesRouter from './routes/recipes-from-photos';
import mealPlanRouter from './routes/meal-plan-from-pdf';
import groupRouter from './routes/group-shopping-list';

const app = express();

app.use(
  express.json({
    limit: '25mb',
  })
);

const allowedOriginList = config.allowedOrigins === true ? null : config.allowedOrigins;

const corsOptions: cors.CorsOptions = {
  origin:
    allowedOriginList === null
      ? true
      : (origin, callback) => {
          // React Native / native fetch often sends no Origin — allow for local dev
          if (!origin) {
            callback(null, true);
            return;
          }
          if (allowedOriginList.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
};

app.use(cors(corsOptions));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authPublicRouter);
app.get('/api/auth/me', requireAuth, meHandler);
app.use('/api', requireAuth);
app.use('/api/recipes', recipesRouter);
app.use('/api/meal-plans', mealPlanRouter);
app.use('/api/shopping-list', groupRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[backend] Listening on http://localhost:${config.port}`);
  if (!config.anthropicApiKey) {
    console.warn('[backend] ANTHROPIC_API_KEY is not set — AI routes will return 503');
  }
  if (!config.jwtSecret) {
    console.warn('[backend] JWT_SECRET is not set — auth and AI API will fail');
  }
  if (config.googleClientIds.length === 0) {
    console.warn('[backend] GOOGLE_CLIENT_IDS is empty — Google sign-in will not work');
  }
  if (!config.appleClientId) {
    console.warn('[backend] APPLE_CLIENT_ID is not set — Apple sign-in will not work');
  }
  if (!config.facebookAppId || !config.facebookAppSecret) {
    console.warn(
      '[backend] FACEBOOK_APP_ID / FACEBOOK_APP_SECRET not set — Facebook sign-in will not work'
    );
  }
});
