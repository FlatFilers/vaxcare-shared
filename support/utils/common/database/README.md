# Database Common Utils

## Overview
The Database Common Utils provide a set of utilities for interacting with databases in Flatfile. These utilities help you manage database connections, execute queries, and handle data transformations between your database and Flatfile.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Environment Setup](#environment-setup)
     - [Environment Variables](#environment-setup)
     - [Using Flatfile Secrets](#environment-setup)
   - [Installation](#installation)
   - [Basic Usage](#basic-usage)
     - [Database Connection](#basic-usage)
     - [Job Events](#basic-usage)
     - [Record Management](#basic-usage)

2. [Query Operations](#query-operations)
   - [MSSQL Queries](#mssql-queries)
     - [Basic Operations](#mssql-queries)
     - [Transactions](#mssql-queries)
   - [MySQL Queries](#mysql-queries)
     - [Basic Operations](#mysql-queries)
     - [Transactions](#mysql-queries)
   - [Key Differences](#key-differences)
     - [Parameter Syntax](#key-differences)
     - [Parameter Passing](#key-differences)
     - [Transaction Handling](#key-differences)
     - [Connection Management](#key-differences)

## Getting Started

### Environment Setup
Before using the database utilities, set up your environment variables:

Create a `.env` file in your project root and add these variables. Make sure to replace the placeholder values with your actual API credentials.

> **Important**: Never commit your actual API keys to version control. Always use environment variables for sensitive credentials.

> **Important**: You can also use the secrets API to get the credentials, if stored in Flatfile.

```bash
# Database connection credentials
DB_HOST="your-database-host"
DB_PORT="5432"
DB_NAME="your-database-name"
DB_USER="your-database-user"
DB_PASSWORD="your-database-password"
```

### Installation
Import the database utilities in your project:

```typescript
import { MSSQLDatabase, MySQLDatabase } from '../../support/utils/common/database/';
```

### Basic Usage
Here's a simple example of using the database service:

```typescript
import { MSSQLDatabase } from '../../support/utils/common/database/';


export default function (listener: FlatfileListener) {

  listener.on(
    "job:ready",
    { job: "sheet:downloadDBRecords" },
    async (event) => {
      const { jobId, sheetId } = event.context;

      try {        
        
        await api.jobs.ack(jobId, {
          info: "Getting started.",
          // "progress" value must be a whole integer
          progress: 10,
        });
  
         // Connect to database and get records
         const dbHost = await event.secrets("DB_HOST");
         const dbUser = await event.secrets("DB_USER");
         const dbPassword = await event.secrets("DB_PASSWORD");
         const dbDatabase = await event.secrets("DB_DATABASE");
         await MSSQLDatabase.connect(dbHost, dbUser, dbPassword, dbDatabase);
         const rows = await MSSQLDatabase.select('SELECT * FROM test_data');
 
         // Create new records in Flatfile
         const sheet = await api.sheets.get(sheetId);

         await api.jobs.ack(jobId, {
          info: "Deleting existing records...",
          progress: 20
        });

        var recordsToDelete = await api.records.get(sheetId);
        for (const record of recordsToDelete.data.records) {
          await api.records.delete(sheetId, { ids: [record.id] });
        }
         
         await api.jobs.ack(jobId, {
           info: "Creating records...",
           progress: 60
         });
 
         if(rows.length > 0) {
          // Insert records into sheet
          var allRecords = [];
          for (const row of rows) {
            var fullrecord = {};
            for (const [field, value] of Object.entries(row)) {
              fullrecord[field] = {
                                value: value,
                                messages: [],
                                valid: true
                            };
            }
            allRecords.push(fullrecord);
          }
          //console.log(allRecords);
          await api.records.insert(sheetId, allRecords);
         }
  
        await api.jobs.complete(jobId, {
          info: "This job is now complete.",
        });
      } catch (error) {
        console.error("Error:", error.stack);
  
        await api.jobs.fail(jobId, {
          info: "This job did not work.",
        });
      }
    }
  );

}
```

## Query Operations

The database utility provides different query methods for both MSSQL and MySQL databases. Below are examples for both:

### MSSQL Queries

```typescript
import { MSSQLDatabase } from '../../support/utils/common/database/';

// Select query
const users = await MSSQLDatabase.select('SELECT * FROM users');
// With parameters
const user = await MSSQLDatabase.select('SELECT * FROM users WHERE id = @id', { id: 1 });

// Insert query
await MSSQLDatabase.insert(
  'INSERT INTO users (name, email) VALUES (@name, @email)',
  { name: 'John', email: 'john@example.com' }
);

// Update query
await MSSQLDatabase.update(
  'UPDATE users SET email = @email WHERE id = @id',
  { id: 1, email: 'newemail@example.com' }
);

// Delete query
await MSSQLDatabase.delete(
  'DELETE FROM users WHERE id = @id',
  { id: 1 }
);

// Transaction example
const transaction = await MSSQLDatabase.beginTransaction();
try {
  await MSSQLDatabase.executeInTransaction(
    transaction,
    'INSERT INTO orders (id) VALUES (@id)',
    { id: orderId }
  );
  await MSSQLDatabase.executeInTransaction(
    transaction,
    'INSERT INTO order_items (order_id) VALUES (@orderId)',
    { orderId: orderId }
  );
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### MySQL Queries

```typescript
import { MySQLDatabase } from '../../support/utils/common/database/';

// Select query
const users = await MySQLDatabase.select('SELECT * FROM users');
// With parameters
const user = await MySQLDatabase.select('SELECT * FROM users WHERE id = ?', [1]);

// Insert query
await MySQLDatabase.insert(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['John', 'john@example.com']
);

// Update query
await MySQLDatabase.update(
  'UPDATE users SET email = ? WHERE id = ?',
  ['newemail@example.com', 1]
);

// Delete query
await MySQLDatabase.delete(
  'DELETE FROM users WHERE id = ?',
  [1]
);

// Transaction example
const connection = await MySQLDatabase.beginTransaction();
try {
  await MySQLDatabase.executeInTransaction(
    connection,
    'INSERT INTO orders (id) VALUES (?)',
    [orderId]
  );
  await MySQLDatabase.executeInTransaction(
    connection,
    'INSERT INTO order_items (order_id) VALUES (?)',
    [orderId]
  );
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
}
```

### Key Differences

1. Parameter Syntax:
   - MSSQL uses named parameters with `@` prefix (e.g., `@id`, `@name`)
   - MySQL uses positional parameters with `?` (e.g., `?`)

2. Parameter Passing:
   - MSSQL accepts parameters as an object: `{ id: 1, name: 'John' }`
   - MySQL accepts parameters as an array: `[1, 'John']`

3. Transaction Handling:
   - MSSQL uses a Transaction object
   - MySQL uses a Connection object with transaction state

4. Connection Management:
   Both implementations include:
   ```typescript
   // Connect to database
   await Database.connect(server, user, password, database);
   
   // Disconnect when done
   await Database.disconnect();
   ```
