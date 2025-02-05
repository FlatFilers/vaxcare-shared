# Flatfile Local Cron Job Utilities

This utility helps simulate Flatfile cron events in local development environments. It allows you to test cron-based functionality without deploying to Flatfile.

## Installation

```typescript
import { LocalCronJob, CronEventTopic } from "./utils/cronjobs";
```

## Usage

There are two ways to use the cron job utility:

### 1. Start Individual Cron Jobs

Basic usage in your listener setup:

```typescript
import { LocalCronJob, CronEventTopic } from "./utils/cronjobs";

// In your listener configuration
listener.use(LocalCronJob.start(CronEventTopic.Cron5Minutes, "space:created"));
```

### 2. Start All Cron Jobs

To start all predefined cron jobs for an account and environment:

```typescript
import { LocalCronJob } from "./utils/cronjobs";

// In your initialization code
LocalCronJob.startAll("your-account-id", "your-environment-id");
```

## Available Cron Event Topics

```typescript
enum CronEventTopic {
  Cron5Minutes = "5-minutes", // Runs every 5 minutes
  CronHourly = "hourly", // Runs every hour
  CronDaily = "daily", // Runs once per day
}
```

## Parameters

### For LocalCronJob.start():

- `cronEventTopic`: The frequency of the cron job (from CronEventTopic enum)
- `createEvent`: Event name to simulate (e.g., "space:created")

### For LocalCronJob.startAll():

- `accountId`: Your Flatfile account ID
- `environmentId`: Your Flatfile environment ID

## Event Handling

You can listen for cron events in your code:

```typescript
// Listen for 5-minute cron events
listener.on("cron:5-minutes", async (event) => {
  console.log("5-minute cron event triggered", event);
});

// Listen for hourly cron events
listener.on("cron:hourly", async (event) => {
  console.log("Hourly cron event triggered", event);
});

// Listen for all cron events
listener.on("cron:*", async (event) => {
  console.log("Cron event triggered", event);
});
```

## Local Development

This utility is specifically designed for local development and testing. It simulates the behavior of Flatfile's production cron jobs in your local environment.

## Important Notes

1. These cron jobs are for development purposes only and should not be used in production.
2. In the actual Flatfile environment, these events are handled by the platform's native scheduling system.
3. The time zone for cron jobs defaults to 'America/New_York'.
4. Jobs persist for the duration of your local development session.
