import {
  AngularNodeAppEngine,
  CommonEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import { APP_BASE_HREF } from '@angular/common';

import bootstrap from './main.server';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVER_LANG_TOKEN } from './app/services/language.service';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

const commonEngine = new CommonEngine();

const indexHtml = join(serverDistFolder, 'index.server.html');

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

app.get('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  const cookies = headers.cookie ?? '';
  const langCookies =
    cookies.split(';').find((cookie) => cookie.includes('lang')) ?? 'lang=en';

  const [, lang] = langCookies.split('=');

  commonEngine

    .render({
      bootstrap,

      documentFilePath: indexHtml,

      url: `${protocol}://${headers.host}${originalUrl}`,

      publicPath: browserDistFolder,

      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },

        { provide: 'REQUEST', useValue: req },

        { provide: 'RESPONSE', useValue: res },
        {
          provide: SERVER_LANG_TOKEN,
          useValue: lang,
        },
      ],
    })

    .then((html) => res.send(html))

    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
