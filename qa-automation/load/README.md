# Load Testing with k6

This directory contains JS-based performance and load tests using **k6**.

## Prerequisites

1. Install **k6**:
   - **Windows (Chocolatey)**: `choco install k6`
   - **Windows (winget)**: `winget install k6.k6`
   - **macOS (Homebrew)**: `brew install k6`
   - **Linux (Debian/Ubuntu)**: Refer to [k6 official installation guide](https://k6.io/docs/getting-started/installation/).

## Running Tests

To run a load test, run the following command in this directory:

### 1. Doctor Login Load Test

Simulates simultaneous user login requests to check response times and thresholds:
```bash
k6 run DoctorLoginLoad.js
```

### 2. Combined Performance Load Test

Simulates mixed traffic conditions, dental image uploads, and AI inference latency checks:
```bash
k6 run CombinedPerformanceTest.js
```
