import { FallbackProviderJsonConfig } from '@railgun-community/shared-models';

// const shouldDebug = 0;

export const MOCK_FALLBACK_PROVIDER_JSON_CONFIG_GOERLI: FallbackProviderJsonConfig =
  {
    chainId: 56,
    providers: [
      {
        provider: 'https://bnb-mainnet.g.alchemy.com/v2/pBLQEZrkIYoPRRHQ9pqaF6A13XVOeOL3',
        priority: 1,
        weight: 2,
        maxLogsPerBatch: 10,
        stallTimeout: 2500,
      },
      {
        provider: 'https://bsc-dataseed.binance.org',
        priority: 1,
        weight: 2,
        maxLogsPerBatch: 10,
      },
    ],
  };