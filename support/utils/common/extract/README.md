# OCR Extract Utility

## Overview
The OCR Extract utility is a powerful tool that enables automatic extraction of structured data from PDF documents. It uses advanced OCR (Optical Character Recognition) technology to identify and extract specific fields based on predefined document types.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Environment Setup](#environment-setup)
   - [Installation](#installation)
   - [Basic Usage](#basic-usage)
   - [Configuration Example](#configuration-example)

2. [Document Types](#document-types)
   - [Defining Document Types](#defining-document-types)
   - [Supported Document Formats](#supported-document-formats)

3. [Fields to Extract](#fields-to-extract)
   - [Field Configuration](#field-configuration)
   - [Field Types](#field-types)
   - [Field Properties](#field-properties)

## Getting Started

### Environment Setup
Before using the OCR Extract utility, you need to set up the following environment variables:

```bash
# Azure Document Intelligence API credentials
AZURE_ENDPOINT="https://your-azure-endpoint.cognitiveservices.azure.com"
AZURE_KEY="your-azure-key"

# OpenAI API credentials
OPENAI_KEY="your-openai-key"
```

Create a `.env` file in your project root and add these variables. Make sure to replace the placeholder values with your actual API credentials.

> **Important**: Never commit your actual API keys to version control. Always use environment variables for sensitive credentials.

### Installation
Import the OCR Extractor in your project:

```typescript
import { OCRExtractor } from "../../support/utils/common/extract";
```

### Basic Usage
The OCR Extractor is typically used as a Flatfile listener plugin. Here's a basic setup:

```typescript
export default function (listener: FlatfileListener) {
  listener.use(OCRExtractor('.pdf', ExtractOptions))
}
```

### Configuration Example
Here's a complete example showing how to configure the OCR Extractor for invoice processing:

```typescript
export default function (listener: FlatfileListener) {
  const ExtractOptions = {
    doc_types: [
      {
        name: 'invoice',
        fields: [
          {
            name: 'vendor_name',
            description: 'Name of the vendor'
          },
          {
            name: 'vendor_address',
            description: 'Address of the vendor'
          },  
          {
            name: 'total_amount',
            description: 'Total amount of the invoice'
          },
          {
            name: 'invoice_date',
            description: 'Date of the invoice'
          },
          {
            name: 'invoice_number',
            description: 'Invoice number'
          }
        ]
      }
    ]
  }
  
  listener.use(OCRExtractor('.pdf', ExtractOptions))
}
```

## Document Types

### Defining Document Types
Document types help the OCR engine understand what kind of document it's processing and what information to look for. Each document type should have:

- A unique name
- A list of fields to extract

Example:
```typescript
{
  name: 'invoice',
  fields: [...],
}
```

### Supported Document Formats
Currently supported document formats:
- PDF (.pdf)
- Images (.jpg, .png)
- Scanned documents

## Fields to Extract

### Field Configuration
Each field in a document type requires:
- `name`: Unique identifier for the field
- `description`: Clear description of what the field represents

