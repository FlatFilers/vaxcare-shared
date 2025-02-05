# Validation Common Utils 

## Overview
The validation system provides robust validation and formatting capabilities for strings, numbers, and dates. Each validator class follows a consistent structure with main functions for core operations and helper functions for specific validations.

## Getting Started

### Installation
The validation utilities are part of the common utils package. Import the validator functions you need:

```typescript
import { 
    StringValidator, 
    NumberValidator, 
    DateValidator 
} from "../../support/utils/common/validation/";
```

### Basic Usage
The validators are typically used with Flatfile's record hooks. Here's a simple example:

```typescript
import { recordHook } from "@flatfile/plugin-record-hook";
import { StringValidator } from "../../support/utils/common/validation/";

export default function (listener: FlatfileListener) {
  
  listener.use(
    recordHook("**", async (record) => {
      
      // Example: validate code format (2 letters followed by 4 numbers)
      StringValidator.matchesPattern(record, "fieldToValidate", /^[A-Z]{2}\d{4}$/, {addError: true, validateOnEmpty: true, errorMsg: "Code must be 2 letters followed by 4 numbers"});
        
      return record;
    }),
  );

}
```

For more advanced validation and formatting options, see the detailed documentation for each validator below.

## Table of Contents

1. [String Validation (StringValidator)](#1-string-validation-stringvalidator)
   - [Main Functions](#string-main-functions)
     - [validate()](#string-validate)
     - [format()](#string-format)
     - [evaluateAndFormat()](#string-evaluate-and-format)
   - [Helper Functions](#string-helper-functions)
     - [isEmail()](#string-is-email)
     - [isPhone()](#string-is-phone)
     - [formatPhone()](#string-format-phone)
     - [isSSN()](#string-is-ssn)
     - [formatSSN()](#string-format-ssn)
     - [matchesPattern()](#string-matches-pattern)
     - [hasLength()](#string-has-length)
     - [min()](#string-min)
     - [max()](#string-max)

2. [Date Validation (DateValidator)](#2-date-validation-datevalidator)
   - [Main Functions](#date-main-functions)
     - [validate()](#date-validate)
     - [format()](#date-format)
     - [evaluateAndFormat()](#date-evaluate-and-format)
   - [Helper Functions](#date-helper-functions)
     - [before()](#date-before)
     - [after()](#date-after)
     - [between()](#date-between)

3. [Number Validation (NumberValidator)](#3-number-validation-numbervalidator)
   - [Main Functions](#number-main-functions)
     - [validate()](#number-validate)
     - [format()](#number-format)
     - [evaluateAndFormat()](#number-evaluate-and-format)
   - [Helper Functions](#number-helper-functions)
     - [min()](#number-min)
     - [max()](#number-max)
     - [range()](#number-range)
     - [isInteger()](#number-is-integer)
     - [isPositive()](#number-is-positive)
     - [isNegative()](#number-is-negative)
     - [isMultipleOf()](#number-is-multiple-of)
     - [hasPrecision()](#number-has-precision)

4. [Use with External Constraints Plugin](#use-with-external-constraints-plugin)
   - [String Validator Examples](#string-validator-examples)
   - [Date Validator Examples](#date-validator-examples)
   - [Number Validator Examples](#number-validator-examples)
   - [Common Configuration Options](#common-configuration-options)

## Available Options

## 1. String Validation (`StringValidator`)

### String Main Functions

#### String validate
`validate(record, field, options)`
Basic string validation.

Parameters:
- `record: Record<string, any>` - The record containing the field to validate
- `field: string` - The name of the field to validate
- `options?:`
    - `addError?: boolean`       // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message


```typescript
StringValidator.validate(record, "name", {
    addError: true,
    validateOnEmpty: true,
    errorMsg: "Invalid name"
});
```

#### String format
`format(record, field, formatOptions, options)`
Format string values with various options.

Parameters:
- `record: Record<string, any>` - The record containing the field to format
- `field: string` - The name of the field to format
- `formatOptions?:`
    - `case?: 'upper' | 'lower' | 'title'`  // Transform case of the string
    - `trim?: boolean`                      // Remove leading/trailing whitespace
    - `padStart?: number`                   // Pad the start to specified length
    - `padEnd?: number`                     // Pad the end to specified length
    - `padChar?: string`                    // Character to use for padding
    - `truncate?: number`                   // Maximum length before truncating
    - `replace?:`                           // Search and replace in string
        - `search: string | RegExp`         // Pattern to search for
        - `replace: string`                 // Text to replace with
    - `prefix?: string`                     // Add prefix to string
    - `suffix?: string`                     // Add suffix to string
- `options?:`
    - `setRecord?: boolean`      // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `formatOnEmpty?: boolean`  // Format empty fields
    - `infoMsg?: string`         // Custom info message

```typescript
StringValidator.format(record, "name", {
    case: 'title',
    trim: true,
    truncate: 50
}, {
    setRecord: true,
    addInfo: true
});
```

#### String evaluate and format
`evaluateAndFormat(record, field, validationType, formatOptions, validationArgs, options)`
Combined validation and formatting.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `validationType: StringValidationType` - Type of validation to perform:
    - `VALIDATE = 'validate'`      // Basic validation
    - `IS_EMAIL = 'isEmail'`       // Email format
    - `IS_PHONE = 'isPhone'`       // Phone number format
    - `IS_SSN = 'isSSN'`          // Social Security Number format
    - `MATCHES_PATTERN = 'matchesPattern'` // Custom regex pattern
    - `HAS_LENGTH = 'hasLength'`   // Specific length range
    - `MIN = 'min'`               // Minimum length
    - `MAX = 'max'`               // Maximum length
- `formatOptions?:`
    - `case?: 'upper' | 'lower' | 'title'`  // Transform case of the string
    - `trim?: boolean`                      // Remove leading/trailing whitespace
    - `padStart?: number`                   // Pad the start to specified length
    - `padEnd?: number`                     // Pad the end to specified length
    - `padChar?: string`                    // Character to use for padding
    - `truncate?: number`                   // Maximum length before truncating
    - `replace?:`                           // Search and replace in string
        - `search: string | RegExp`         // Pattern to search for
        - `replace: string`                 // Text to replace with
    - `prefix?: string`                     // Add prefix to string
    - `suffix?: string`                     // Add suffix to string
- `validationArgs?: any` - Additional arguments based on validationType:
    - For MATCHES_PATTERN: RegExp pattern
    - For HAS_LENGTH: [min: number, max: number]
    - For MIN: minimum length number
    - For MAX: maximum length number
    - For IS_PHONE: 'international' | 'us'
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `setRecord?: boolean`       // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `infoMsg?: string`         // Custom info message
    - `errorMsg?: string`        // Custom error message
    - `formatOnError?: boolean`  // Format even if validation fails
    - `formatOnEmpty?: boolean`  // Format empty fields

```typescript
StringValidator.evaluateAndFormat(record, "email", 
    StringValidationType.IS_EMAIL, 
    { case: 'lower', trim: true }
);
```

### String Helper Functions

#### String is email
`isEmail(record, field, options)`
Validate email format.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.isEmail(record, "email", {
    addError: true,
    errorMsg: "Invalid email format"
});
```

#### String is phone
`isPhone(record, field, format, options)`
Validate phone number format.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `format: 'international' | 'us'` - Phone number format to validate against
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.isPhone(record, "phone", 'us', {
    addError: true,
    errorMsg: "Invalid phone number format"
});
```

#### String format phone
`formatPhone(record, field, format, formatOptions, options)`
Format phone number.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `format: 'international' | 'us'` - Phone number format to use
- `formatOptions?:`
    - `separator?: string`        // Character to use between number groups
    - `countryCode?: string`     // Country code to prepend (for international)
    - `extension?: string`       // Extension number to append
- `options?:`
    - `setRecord?: boolean`      // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `formatOnEmpty?: boolean`  // Format empty fields
    - `infoMsg?: string`         // Custom info message

```typescript
StringValidator.formatPhone(record, "phone", "us", 
    { 
        separator: "-",
        extension: "123"
    }, 
    {
        setRecord: true,
        addInfo: true
    }
);
```

#### String is ssn
`isSSN(record, field, options)`
Validate SSN format.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.isSSN(record, "ssn", {
    addError: true,
    errorMsg: "Invalid SSN format"
});
```

#### String format ssn
`formatSSN(record, field, formatOptions, options)`
Format Social Security Number.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `formatOptions?:`
    - `separator?: string`       // Character to use between number groups
    - `mask?: boolean`          // Replace digits with asterisks except last 4
- `options?:`
    - `setRecord?: boolean`      // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `formatOnEmpty?: boolean`  // Format empty fields
    - `infoMsg?: string`         // Custom info message

```typescript
StringValidator.formatSSN(record, "ssn", 
    { 
        separator: "-",
        mask: true
    }, 
    {
        setRecord: true,
        addInfo: true
    }
);
```

#### String matches pattern
`matchesPattern(record, field, pattern, options)`
Validate against regex pattern.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `pattern: RegExp` - Regular expression to match against
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.matchesPattern(record, "code", /^[A-Z]{2}\d{4}$/, {
    addError: true,
    errorMsg: "Must match pattern: 2 uppercase letters followed by 4 digits"
});
```

#### String has length
`hasLength(record, field, min, max, options)`
Validate string length range.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `min: number` - Minimum length required
- `max: number` - Maximum length allowed
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.hasLength(record, "username", 3, 20, {
    addError: true,
    errorMsg: "Username must be between 3 and 20 characters"
});
```

#### String min
`min(record, field, min, options)`
Validate minimum length.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `min: number` - Minimum length required
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.min(record, "password", 8, {
    addError: true,
    errorMsg: "Password must be at least 8 characters"
});
```

#### String max
`max(record, field, max, options)`
Validate maximum length.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `max: number` - Maximum length allowed
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
StringValidator.max(record, "title", 100, {
    addError: true,
    errorMsg: "Title cannot exceed 100 characters"
});
```

## 2. Date Validation (`DateValidator`)

### Date Main Functions

#### Date validate
`validate(record, field, format, options)`
Basic date validation.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `format?: string` - Date format (e.g., "MM/DD/YYYY")
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
DateValidator.validate(record, "date", "MM/DD/YYYY", {
    addError: true,
    errorMsg: "Invalid date format"
});
```

#### Date format
`format(record, field, format, options)`
Format date values.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `format?: string` - Date format (e.g., "MM/DD/YYYY")
- `options?:`
    - `setRecord?: boolean`      // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `formatOnEmpty?: boolean`  // Format empty fields
    - `infoMsg?: string`         // Custom info message

```typescript
DateValidator.format(record, "date", "MM/DD/YYYY", {
    setRecord: true,
    addInfo: true
});
```

#### Date evaluate and format
`evaluateAndFormat(record, field, validationType, format, validationArgs, options)`
Combined date validation and formatting.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `validationType: DateValidationType` - Type of validation to perform:
    - `VALIDATE = 'validate'`    // Basic date validation
    - `BEFORE = 'before'`       // Date before specified date
    - `AFTER = 'after'`        // Date after specified date
    - `BETWEEN = 'between'`     // Date between two dates
- `format?: string` - Date format (e.g., "MM/DD/YYYY")
- `validationArgs?: any` - Additional arguments based on validationType:
    - For BEFORE: string date or "now"
    - For AFTER: string date or "now"
    - For BETWEEN: [startDate: string, endDate: string]
    - Special values: "now", "now+{n}days", "now-{n}days", "now+{n}months", "now-{n}months", "now+{n}years", "now-{n}years"
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `setRecord?: boolean`       // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `infoMsg?: string`         // Custom info message
    - `errorMsg?: string`        // Custom error message
    - `formatOnError?: boolean`  // Format even if validation fails
    - `formatOnEmpty?: boolean`  // Format empty fields

```typescript
DateValidator.evaluateAndFormat(record, "birthDate",
    DateValidationType.BEFORE,
    "MM/DD/YYYY",
    "now",
    {
        addError: true,
        errorMsg: "Birth date must be in the past"
    }
);
```

### Date Helper Functions

#### Date before
`before(record, field, dateBefore, format, options)`
Validate date is before specified date.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `dateBefore: string` - Date to compare against:
    - Date string in specified format
    - "now"
    - "now+{n}days", "now-{n}days"
    - "now+{n}months", "now-{n}months"
    - "now+{n}years", "now-{n}years"
- `format?: string` - Date format (e.g., "MM/DD/YYYY")
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
DateValidator.before(record, "startDate", "2024-01-01", "YYYY-MM-DD", {
    addError: true,
    errorMsg: "Date must be before 2024"
});
```

#### Date after
`after(record, field, dateAfter, format, options)`
Validate date is after specified date.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `dateAfter: string` - Date to compare against:
    - Date string in specified format
    - "now"
    - "now+{n}days", "now-{n}days"
    - "now+{n}months", "now-{n}months"
    - "now+{n}years", "now-{n}years"
- `format?: string` - Date format (e.g., "MM/DD/YYYY")
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
DateValidator.after(record, "endDate", "2024-01-01", "YYYY-MM-DD", {
    addError: true,
    errorMsg: "Date must be after 2024"
});
```

#### Date between
`between(record, field, dateStart, dateEnd, format, options)`
Validate date is within range.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `dateStart: string` - Start date of range (supports same formats as before/after)
- `dateEnd: string` - End date of range (supports same formats as before/after)
- `format?: string` - Date format (e.g., "MM/DD/YYYY")
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
DateValidator.between(record, "eventDate", "2024-01-01", "2024-12-31", "YYYY-MM-DD", {
    addError: true,
    errorMsg: "Date must be in 2024"
});
```

## 3. Number Validation (`NumberValidator`)

### Number Main Functions

#### Number validate
`validate(record, field, options)`
Basic number validation.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.validate(record, "quantity", {
    addError: true,
    errorMsg: "Must be a valid number"
});
```

#### Number format
`format(record, field, format, options)`
Format number values.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `format?:`
    - `style?: 'decimal' | 'currency' | 'percent'`  // Number format style
    - `currency?: string`                          // Currency code (e.g., 'USD')
    - `decimalPlaces?: number`                     // Number of decimal places
    - `locale?: string`                           // Locale for formatting (e.g., 'en-US')
- `options?:`
    - `setRecord?: boolean`      // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `formatOnEmpty?: boolean`  // Format empty fields
    - `infoMsg?: string`         // Custom info message

```typescript
NumberValidator.format(record, "price", {
    style: 'currency',
    currency: 'USD',
    decimalPlaces: 2,
    locale: 'en-US'
}, {
    setRecord: true,
    addInfo: true
});
```

#### Number evaluate and format
`evaluateAndFormat(record, field, validationType, formatOptions, validationArgs, options)`
Combined number validation and formatting.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `validationType: NumberValidationType` - Type of validation to perform:
    - `VALIDATE = 'validate'`        // Basic number validation
    - `MIN = 'min'`                 // Minimum value
    - `MAX = 'max'`                 // Maximum value
    - `RANGE = 'range'`             // Value within range
    - `IS_INTEGER = 'isInteger'`    // Whole number
    - `IS_POSITIVE = 'isPositive'`  // Positive number
    - `IS_NEGATIVE = 'isNegative'`  // Negative number
    - `IS_MULTIPLE_OF = 'isMultipleOf'` // Multiple of a number
    - `HAS_PRECISION = 'hasPrecision'`   // Specific decimal places
- `formatOptions?:`
    - `style?: 'decimal' | 'currency' | 'percent'`  // Number format style
    - `currency?: string`                          // Currency code (e.g., 'USD')
    - `decimalPlaces?: number`                     // Number of decimal places
    - `locale?: string`                           // Locale for formatting (e.g., 'en-US')
- `validationArgs?: any` - Additional arguments based on validationType:
    - For MIN: minimum value number
    - For MAX: maximum value number
    - For RANGE: [min: number, max: number]
    - For IS_MULTIPLE_OF: multiple number
    - For HAS_PRECISION: number of decimal places
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `setRecord?: boolean`       // Update record with formatted value
    - `addInfo?: boolean`        // Add info message after formatting
    - `infoMsg?: string`         // Custom info message
    - `errorMsg?: string`        // Custom error message
    - `formatOnError?: boolean`  // Format even if validation fails
    - `formatOnEmpty?: boolean`  // Format empty fields

```typescript
NumberValidator.evaluateAndFormat(record, "price",
    NumberValidationType.IS_POSITIVE,
    { 
        style: 'currency', 
        currency: 'USD',
        decimalPlaces: 2
    },
    null,
    {
        addError: true,
        errorMsg: "Price must be positive"
    }
);
```

### Number Helper Functions

#### Number min
`min(record, field, min, options)`
Validate minimum value.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `min: number` - Minimum value allowed
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.min(record, "age", 18, {
    addError: true,
    errorMsg: "Must be at least 18"
});
```

#### Number max
`max(record, field, max, options)`
Validate maximum value.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `max: number` - Maximum value allowed
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.max(record, "quantity", 100, {
    addError: true,
    errorMsg: "Cannot exceed 100"
});
```

#### Number range
`range(record, field, min, max, options)`
Validate number within range.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `min: number` - Minimum value allowed
- `max: number` - Maximum value allowed
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.range(record, "score", 0, 100, {
    addError: true,
    errorMsg: "Score must be between 0 and 100"
});
```

#### Number is integer
`isInteger(record, field, options)`
Validate whole number.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.isInteger(record, "quantity", {
    addError: true,
    errorMsg: "Must be a whole number"
});
```

#### Number is positive
`isPositive(record, field, options)`
Validate positive number.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.isPositive(record, "amount", {
    addError: true,
    errorMsg: "Must be a positive number"
});
```

#### Number is negative
`isNegative(record, field, options)`
Validate negative number.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.isNegative(record, "temperature", {
    addError: true,
    errorMsg: "Must be a negative number"
});
```

#### Number is multiple of
`isMultipleOf(record, field, multiple, options)`
Validate number is multiple of value.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `multiple: number` - Number to check multiple of
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.isMultipleOf(record, "quantity", 5, {
    addError: true,
    errorMsg: "Must be a multiple of 5"
});
```

#### Number has precision
`hasPrecision(record, field, precision, options)`
Validate decimal precision.

Parameters:
- `record: Record<string, any>` - The record containing the field
- `field: string` - The name of the field
- `precision: number` - Required number of decimal places
- `options?:`
    - `addError?: boolean`        // Add error message on failure
    - `validateOnEmpty?: boolean` // Validate empty fields
    - `errorMsg?: string`         // Custom error message

```typescript
NumberValidator.hasPrecision(record, "price", 2, {
    addError: true,
    errorMsg: "Must have exactly 2 decimal places"
});
```

## Use with External Constraints Plugin

The validation utilities can be used with the [@flatfile/plugin-constraints](https://flatfile.com/docs/plugins-docs/transform/external-constraint) plugin to add validation and formatting to your blueprint fields. Here's how to use each validator:

```typescript
import { 
    addStringValidator, 
    addNumberValidator, 
    addDateValidator 
} from "../../support/utils/common/validation/";

export default function (listener: FlatfileListener) {

  listener.use(addDateValidator);
  listener.use(addNumberValidator);
  listener.use(addStringValidator);

}
```

### String Validator Examples

```typescript
{
  key: "Email",
  type: "string",
  label: "Email",
  constraints: [
    {
      type: 'external',
      validator: 'StringValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: StringValidationType.IS_EMAIL,
        options: {
          setRecord: true,
          addInfo: false,
          addError: true,
          formatOnError: false,
          errorMsg: "Must be a valid email address"
        }
      },
    },
  ]
},
{
  key: "PhoneNumber",
  type: "string",
  label: "Phone Number",
  constraints: [
    {
      type: 'external',
      validator: 'StringValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: StringValidationType.IS_PHONE,
        validationArgs: "us",
        formatOptions: {
          trim: true,
          replace: { search: /\D/g, replace: "" }
        },
        options: {
          setRecord: true,
          addError: true,
          errorMsg: "Must be a valid US phone number"
        }
      },
    },
  ]
},
{
  key: "Username",
  type: "string",
  label: "Username",
  constraints: [
    {
      type: 'external',
      validator: 'StringValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: StringValidationType.HAS_LENGTH,
        validationArgs: [3, 20],
        formatOptions: {
          trim: true,
          case: 'lower'
        },
        options: {
          setRecord: true,
          addError: true,
          errorMsg: "Username must be between 3 and 20 characters"
        }
      },
    },
  ]
}
```

### Date Validator Examples

```typescript
{
  key: "DateOfBirth",
  type: "date",
  label: "Date of Birth",
  constraints: [
    {
      type: 'external',
      validator: 'DateValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: DateValidationType.BEFORE,
        validationArgs: ["now-18years"],
        format: "MM/DD/YYYY",
        options: {
          setRecord: true,
          addInfo: false,
          addError: true,
          formatOnError: false,
          errorMsg: "Must be at least 18 years old"
        }
      },
    },
  ]
},
{
  key: "AppointmentDate",
  type: "date",
  label: "Appointment Date",
  constraints: [
    {
      type: 'external',
      validator: 'DateValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: DateValidationType.BETWEEN,
        validationArgs: ["now", "now+6months"],
        format: "YYYY-MM-DD",
        options: {
          setRecord: true,
          addError: true,
          errorMsg: "Appointment must be scheduled within next 6 months"
        }
      },
    },
  ]
}
```

### Number Validator Examples

```typescript
{
  key: "Age",
  type: "number",
  label: "Age",
  constraints: [
    {
      type: 'external',
      validator: 'NumberValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: NumberValidationType.RANGE,
        validationArgs: [0, 120],
        formatOptions: {
          style: 'decimal',
          decimalPlaces: 0
        },
        options: {
          setRecord: true,
          addError: true,
          errorMsg: "Age must be between 0 and 120"
        }
      },
    },
  ]
},
{
  key: "Price",
  type: "number",
  label: "Price",
  constraints: [
    {
      type: 'external',
      validator: 'NumberValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: NumberValidationType.IS_POSITIVE,
        formatOptions: {
          style: 'currency',
          currency: 'USD',
          decimalPlaces: 2,
          locale: 'en-US'
        },
        options: {
          setRecord: true,
          addError: true,
          errorMsg: "Price must be a positive amount"
        }
      },
    },
  ]
},
{
  key: "Quantity",
  type: "number",
  label: "Quantity",
  constraints: [
    {
      type: 'external',
      validator: 'NumberValidator',
      config: {
        type: ValidationType.EVALUATE_AND_FORMAT,
        validationType: NumberValidationType.IS_MULTIPLE_OF,
        validationArgs: 5,
        formatOptions: {
          style: 'decimal',
          decimalPlaces: 0
        },
        options: {
          setRecord: true,
          addError: true,
          errorMsg: "Quantity must be a multiple of 5"
        }
      },
    },
  ]
}
```

