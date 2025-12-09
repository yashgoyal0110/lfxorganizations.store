import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const REGION = import.meta.env.VITE_APP_SIGNOZ_REGION;
const INGESTION_KEY = import.meta.env.VITE_APP_SIGNOZ_INGESTION_KEY;

const exporter = new OTLPTraceExporter({
  url: `https://ingest.${REGION}.signoz.cloud:443/v1/traces`,
  headers: {
    'signoz-ingestion-key': INGESTION_KEY,
  },
});

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({
    'service.name': 'react-frontend',
  }),
  spanProcessors: [new BatchSpanProcessor(exporter)],
});

provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/, 
    }),
    new UserInteractionInstrumentation({
      eventNames: ['click', 'input', 'submit'],
    }),
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/,
    }),
  ],
});
