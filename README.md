# PIPELINK SDK

Production-grade TypeScript SDK for the PIPELINK Solana infrastructure protocol.

## Features

✨ **Fully Typed** - Complete TypeScript support with strict type checking
🔐 **Secure** - Client-side message signing with wallet adapter support
⚡ **Fast** - Optimized HTTP client with built-in timeout handling
🧪 **Well Tested** - Comprehensive test coverage with Vitest
🌍 **Isomorphic** - Works in Node.js and browsers
📦 **Tree-Shakable** - ESM-only for optimal bundling
🔧 **Production Ready** - Enterprise-grade error handling and validation

## Installation

```bash
npm install @pipelink/sdk
```

## Quick Start

### Initialize the Client

```typescript
import { PipelinkClient } from '@pipelink/sdk';

const client = new PipelinkClient({
  baseUrl: 'https://api.pipelink.xyz',
  network: 'mainnet-beta',
  timeout: 30000, // Optional, defaults to 30s
});
```

### Sign Messages (Client-Side)

```typescript
import { signMessage } from '@pipelink/sdk';

// Using wallet adapter (e.g., Phantom, Solflare)
const signResult = await signMessage(walletAdapter, 'Hello, Solana!');

console.log({
  address: signResult.address,           // Wallet public key (base58)
  message: signResult.message,           // Original message
  signature: signResult.signature,       // Uint8Array signature
});
```

### Verify Signatures (Backend Integration)

```typescript
// After getting signature from client, send to backend
const verified = await client.auth.verifySignature({
  wallet: signResult.address,
  message: signResult.message,
  signature: Array.from(signResult.signature), // Convert to number[]
});

console.log(verified.verified); // true/false
```

### Fetch Wallet Balance

```typescript
const balance = await client.wallet.getBalance('So1111111111111111111111111111111111111112');

console.log({
  balance: balance.balance,    // 10.5
  unit: balance.unit,          // "SOL"
});
```

### Create Pipelines

```typescript
const pipeline = await client.pipeline.create({
  name: 'My Pipeline',
  description: 'Optional description',
  // Additional custom fields supported
});

console.log({
  pipelineId: pipeline.pipelineId,  // "pipe_abc123"
  status: pipeline.status,          // "active"
});
```

## API Reference

### PipelinkClient

Main SDK client class.

#### Constructor

```typescript
new PipelinkClient(config: Partial<PipelinkConfig>)
```

**Config Properties:**
- `baseUrl` (required) - Backend API base URL
- `network` (required) - Network type, currently only `"mainnet-beta"`
- `timeout` (optional) - Request timeout in ms, defaults to 30000
- `fetch` (optional) - Custom fetch implementation for testing

#### Services

- `client.auth.signMessage(adapter, message)` - Client-side message signing
- `client.auth.verifySignature(payload)` - Backend signature verification
- `client.wallet.getBalance(address)` - Fetch wallet balance
- `client.pipeline.create(config)` - Create a new pipeline

### Error Handling

The SDK provides structured error classes for better error handling:

```typescript
import {
  SDKError,
  HTTPError,
  NetworkError,
  ValidationError,
  TimeoutError,
} from '@pipelink/sdk';

try {
  await client.wallet.getBalance(address);
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
    console.error('Response data:', error.data);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
  } else if (error instanceof TimeoutError) {
    console.error(`Timeout after ${error.timeout}ms`);
  }
}
```

### Testing with Injected Fetch

The SDK is fully testable by injecting a custom fetch implementation:

```typescript
import { vi } from 'vitest';
import { PipelinkClient } from '@pipelink/sdk';

const mockFetch = vi.fn().mockResolvedValue(
  new Response(JSON.stringify({ balance: 10, unit: 'SOL' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
);

const client = new PipelinkClient({
  baseUrl: 'https://api.test.com',
  network: 'mainnet-beta',
  fetch: mockFetch,
});

await client.wallet.getBalance('wallet123');
expect(mockFetch).toHaveBeenCalledWith(
  'https://api.test.com/api/wallet/balance?address=wallet123',
  expect.any(Object)
);
```

## TypeScript Types

All types are exported for use in your applications:

```typescript
import {
  PipelinkConfig,
  WalletAdapter,
  SignResult,
  AuthPayload,
  AuthResponse,
  BalanceResponse,
  CreatePipelineConfig,
  PipelineResponse,
} from '@pipelink/sdk';
```

## Backend API Requirements

The SDK expects the following backend endpoints:

### POST /api/auth/verify
Verifies a signed message.

**Request:**
```json
{
  "wallet": "11111111111111111111111111111111",
  "message": "Hello, Solana!",
  "signature": [1, 2, 3, ...]
}
```

**Response:**
```json
{
  "verified": true
}
```

### GET /api/wallet/balance?address=
Fetches wallet balance.

**Response:**
```json
{
  "balance": 10.5,
  "unit": "SOL"
}
```

### POST /api/pipeline/create
Creates a new pipeline.

**Request:**
```json
{
  "name": "My Pipeline",
  "description": "Optional",
  ...additional fields
}
```

**Response:**
```json
{
  "pipelineId": "pipe_123",
  "status": "active",
  ...additional fields
}
```

## Testing

Run the full test suite:

```bash
npm test
```

Watch mode:

```bash
npm run dev
```

With UI:

```bash
npm run test:ui
```

Coverage report:

```bash
npm run test:coverage
```

## Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

The compiled output will be in the `dist/` directory with TypeScript declaration files.

## Publishing to npm

```bash
npm version patch  # or minor, major
npm run build
npm publish
```

## Project Structure

```
pipelink-sdk/
├── src/
│   ├── index.ts              # Public API exports
│   ├── client.ts             # Main SDK client
│   ├── config.ts             # Configuration management
│   ├── auth/
│   │   ├── signer.ts         # Client-side message signing
│   │   └── verify.ts         # Backend signature verification
│   ├── wallet/
│   │   └── balance.ts        # Wallet balance fetching
│   ├── pipeline/
│   │   └── create.ts         # Pipeline creation
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── http.ts           # HTTP client with error handling
│   │   └── timeout.ts        # Timeout utilities
│   └── errors/
│       └── sdk-error.ts      # Error class hierarchy
├── tests/
│   ├── auth.test.ts
│   ├── wallet.test.ts
│   ├── pipeline.test.ts
│   ├── http.test.ts
│   └── client.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## License

MIT - See [LICENSE](LICENSE) file for details

## Support

For issues, questions, or contributions, please visit the [PIPELINK GitHub repository](https://github.com/pipelinktech/pipelink-sdk).
