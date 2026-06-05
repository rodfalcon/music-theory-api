import React from 'react';
import ReactDOM from 'react-dom/client';
import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';
import App from './App';
import './styles/globals.css';

datadogRum.init({
  applicationId:           'd2759b2c-a4f5-46e4-8936-e920bfa8621e',
  clientToken:             'pubb23c5ab1af33f76a224718c68a1ebd97',
  site:                    'datadoghq.com',
  service:                 'music-theory-ui',
  env:                     'k8s',
  version:                 '0.1.0',
  sessionSampleRate:       100,
  sessionReplaySampleRate: 20,
  trackResources:          true,
  trackUserInteractions:   true,
  trackLongTasks:          true,
  defaultPrivacyLevel:     'mask-user-input',
  // Distributed tracing: links RUM sessions to backend APM traces for /api/ calls
  allowedTracingUrls:      [(url) => url.includes('/api/')],
  plugins:                 [reactPlugin({ router: true })],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
