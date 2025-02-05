export enum StringValidationType {
    VALIDATE = 'validate',
    IS_EMAIL = 'isEmail',
    IS_PHONE = 'isPhone',
    IS_SSN = 'isSSN',
    MATCHES_PATTERN = 'matchesPattern',
    HAS_LENGTH = 'hasLength',
    MIN = 'min',
    MAX = 'max'
}

export class StringValidator {
    /**
     * Formats a string value
     * @param record The record containing the field
     * @param field The field to format
     * @param formatOptions Options for string formatting
     * @param options Additional options for formatting
     * @returns boolean indicating if formatting was successful
     * @example
     * // Basic formatting
     * await StringValidator.format(record, "name", {
     *   case: 'title',
     *   trim: true
     * });
     * 
     * // Advanced formatting
     * await StringValidator.format(record, "id", {
     *   case: 'upper',
     *   trim: true,
     *   truncate: 50,
     *   replace: { search: /\s+/g, replace: '-' },
     *   prefix: 'ID-',
     *   suffix: '-2024',
     *   padStart: 10,
     *   padChar: '0'
     * }, {
     *   setRecord: true,
     *   addInfo: true,
     *   formatOnEmpty: false,
     *   infoMsg: 'ID has been formatted'
     * });
     */
    public static async format(
        record: Record<string, any>,
        field: string,
        formatOptions?: {
            case?: 'upper' | 'lower' | 'title';
            trim?: boolean;
            padStart?: number;
            padEnd?: number;
            padChar?: string;
            truncate?: number;
            replace?: { search: string | RegExp; replace: string };
            prefix?: string;
            suffix?: string;
        },
        options?: {
            setRecord?: boolean;
            addInfo?: boolean;
            formatOnEmpty?: boolean;
            infoMsg?: string;
        }
    ): Promise<boolean> {
        const value = record.get(field);
        
        if (!value && !options?.formatOnEmpty) {
            return false;
        }

        let formatted = String(value || '');

        if (formatOptions?.trim) {
            formatted = formatted.trim();
        }

        if (formatOptions?.case) {
            switch (formatOptions.case) {
                case 'upper':
                    formatted = formatted.toUpperCase();
                    break;
                case 'lower':
                    formatted = formatted.toLowerCase();
                    break;
                case 'title':
                    formatted = formatted.replace(/\w\S*/g, (txt) => 
                        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    );
                    break;
            }
        }

        if (formatOptions?.replace) {
            formatted = formatted.replace(formatOptions.replace.search, formatOptions.replace.replace);
        }

        if (formatOptions?.truncate && formatted.length > formatOptions.truncate) {
            formatted = formatted.substring(0, formatOptions.truncate);
        }

        if (formatOptions?.padStart && formatOptions?.padChar) {
            formatted = formatted.padStart(formatOptions.padStart, formatOptions.padChar);
        }

        if (formatOptions?.padEnd && formatOptions?.padChar) {
            formatted = formatted.padEnd(formatOptions.padEnd, formatOptions.padChar);
        }

        if (formatOptions?.prefix) {
            formatted = formatOptions.prefix + formatted;
        }

        if (formatOptions?.suffix) {
            formatted = formatted + formatOptions.suffix;
        }

        if (options?.setRecord !== false) {
            record.set(field, formatted);
        }

        if (options?.addInfo !== false) {
            record.addInfo(field, options?.infoMsg || 'String has been formatted');
        }

        return true;
    }

    /**
     * Validates if a string matches a regex pattern
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param pattern The regex pattern to match against
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     *   - preprocessedValue: Optional pre-processed value to test instead of raw field value
     * @returns boolean indicating if string matches pattern
     * @example
     * // Validates that "code" field matches a specific pattern
     * StringValidator.matchesPattern(record, "code", /^[A-Z]{2}\d{4}$/, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Code must be 2 letters followed by 4 numbers"
     * });
     */
    public static matchesPattern(record: Record<string, any>, field: string, pattern: RegExp, options?: {
        addError?: boolean, 
        validateOnEmpty?: boolean, 
        errorMsg?: string,
        preprocessedValue?: string
    }) {
        var value = options?.preprocessedValue ?? record.get(field)?.toString();
        var valid = false;

        if (value) {
            valid = pattern.test(value);
        }

        if (value || options?.validateOnEmpty) {
            if (!valid && options?.addError) {
                var errorMsg = options?.errorMsg || "Value does not match the required pattern";
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a string is a valid email address
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if string is a valid email
     * @example
     * // Validates that "email" field is a valid email address
     * StringValidator.isEmail(record, "email", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Please enter a valid email address"
     * });
     */
    public static isEmail(record: Record<string, any>, field: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        // RFC 5322 compliant email regex
        const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
        return this.matchesPattern(record, field, emailPattern, {
            ...options,
            errorMsg: options?.errorMsg || "Please enter a valid email address"
        });
    }

    /**
     * Validates if a string is a valid phone number
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param format Phone number format ('international' | 'us')
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if string is a valid phone number
     * @example
     * // Validates that "phone" field is a valid international phone number
     * StringValidator.isPhone(record, "phone", 'international', {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Please enter a valid phone number"
     * });
     */
    public static isPhone(record: Record<string, any>, field: string, format: 'international' | 'us' = 'us', options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        const patterns = {
            // Matches +1234567890 or +12 345 67890 or similar formats
            international: /^\+\d{1,3}[\s-]?\d{1,14}(?:[\s-]\d{1,14})*$/,
            // Matches (123) 456-7890 or 123-456-7890 or similar US formats
            us: /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
        };

        return this.matchesPattern(record, field, patterns[format], {
            ...options,
            errorMsg: options?.errorMsg || `Please enter a valid ${format === 'international' ? 'international ' : ''}phone number`
        });
    }

    /**
     * Validates if a string is a valid US Social Security Number
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if string is a valid SSN
     * @example
     * // Validates that "ssn" field is a valid SSN
     * StringValidator.isSSN(record, "ssn", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Please enter a valid Social Security Number"
     * });
     */
    public static isSSN(record: Record<string, any>, field: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        // Remove any non-digits first
        const value = record.get(field)?.toString() || '';
        const digitsOnly = value.replace(/\D/g, '');
        
        // Matches 9 digits, excluding invalid SSNs like 000000000, 666000000, or 900000000
        const ssnPattern = /^(?!000|666|9\d{2})\d{3}(?!00)\d{2}(?!0000)\d{4}$/;
        return this.matchesPattern(record, field, ssnPattern, {
            ...options,
            errorMsg: options?.errorMsg || "Please enter a valid Social Security Number",
            preprocessedValue: digitsOnly
        });
    }

    /**
     * Validates if a string length is within specified limits
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param min Minimum length required
     * @param max Maximum length allowed
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if string length is valid
     * @example
     * // Validates that "username" field is between 3 and 20 characters
     * StringValidator.hasLength(record, "username", 3, 20, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Username must be between 3 and 20 characters"
     * });
     */
    public static hasLength(record: Record<string, any>, field: string, min: number, max: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field)?.toString();
        var valid = false;

        if (value) {
            valid = value.length >= min && value.length <= max;
        }

        if (value || options?.validateOnEmpty) {
            if (!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must be between ${min} and ${max} characters`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a string is at least a minimum length
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param min Minimum length required
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if string meets minimum length
     * @example
     * // Validates that "password" field is at least 8 characters
     * StringValidator.min(record, "password", 8, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Password must be at least 8 characters"
     * });
     */
    public static min(record: Record<string, any>, field: string, min: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field)?.toString();
        var valid = false;

        if (value) {
            valid = value.length >= min;
        }

        if (value || options?.validateOnEmpty) {
            if (!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must be at least ${min} characters`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a string is at most a maximum length
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param max Maximum length allowed
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if string meets maximum length
     * @example
     * // Validates that "username" field is at most 20 characters
     * StringValidator.max(record, "username", 20, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Username must not exceed 20 characters"
     * });
     */
    public static max(record: Record<string, any>, field: string, max: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field)?.toString();
        var valid = false;

        if (value) {
            valid = value.length <= max;
        }

        if (value || options?.validateOnEmpty) {
            if (!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must not exceed ${max} characters`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Formats a string as a US Social Security Number (XXX-XX-XXXX)
     * @param record The record containing the field to format
     * @param field The field name to format
     * @param options Configuration options:
     *   - setRecord: If true, sets the formatted SSN back to the record
     *   - addInfo: If true, adds an info message when formatting
     *   - formatOnEmpty: If true, formats even if field is empty
     *   - infoMsg: Custom info message to display on formatting
     * @returns formatted SSN string or "Invalid SSN" if invalid and setRecord is true
     * @example
     * // Formats "123456789" to "123-45-6789"
     * StringValidator.formatSSN(record, "ssn", {
     *   setRecord: true,
     *   addInfo: true,
     *   infoMsg: "SSN has been formatted"
     * });
     */
    public static formatSSN(record: Record<string, any>, field: string, options?: {
        setRecord?: boolean,
        addInfo?: boolean,
        formatOnEmpty?: boolean,
        infoMsg?: string
    }) {
        var value = record.get(field)?.toString() || '';
        var formatted = value;

        if (value || options?.formatOnEmpty) {
            // First validate without setting errors
            if (this.isSSN(record, field)) {
                const digitsOnly = value.replace(/\D/g, '');
                formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;

                if (options?.addInfo && options?.setRecord) {
                    var infoMsg = (options?.infoMsg || options?.infoMsg === "") ? options?.infoMsg : `Value changed from ${value}`;
                    record.addInfo(field, infoMsg);
                }
            } else if (options?.setRecord) {
                formatted = "Invalid SSN";
            }

            if (options?.setRecord) { 
                record.set(field, formatted);
            }
        }

        return formatted;
    }

    /**
     * Formats a string as a phone number
     * @param record The record containing the field to format
     * @param field The field name to format
     * @param format Phone number format ('international' | 'us')
     * @param options Configuration options:
     *   - setRecord: If true, sets the formatted phone number back to the record
     *   - addInfo: If true, adds an info message when formatting
     *   - formatOnEmpty: If true, formats even if field is empty
     *   - infoMsg: Custom info message to display on formatting
     * @returns formatted phone number string or "Invalid Phone Number" if invalid and setRecord is true
     * @example
     * // Formats US number: "1234567890" to "(123) 456-7890"
     * StringValidator.formatPhone(record, "phone", 'us', {
     *   setRecord: true,
     *   addInfo: true,
     *   infoMsg: "Phone number has been formatted"
     * });
     */
    public static formatPhone(record: Record<string, any>, field: string, format: 'international' | 'us' = 'us', options?: {
        setRecord?: boolean,
        addInfo?: boolean,
        formatOnEmpty?: boolean,
        infoMsg?: string
    }) {
        var value = record.get(field)?.toString() || '';
        var formatted = value;

        if (value || options?.formatOnEmpty) {
            // First validate without setting errors
            if (this.isPhone(record, field, format)) {
                const digitsWithPlus = value.replace(/[^\d+]/g, '');
                
                if (format === 'us') {
                    const digits = digitsWithPlus.replace(/\+/g, '');
                    if (digits.length === 10) {
                        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
                    } else if (digits.length === 11 && digits.startsWith('1')) {
                        formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
                    }
                } else {
                    const countryCode = digitsWithPlus.match(/^\+\d{1,3}/)?.[0] || '';
                    if (countryCode) {
                        const remaining = digitsWithPlus.slice(countryCode.length);
                        const groups = remaining.match(/.{1,3}/g) || [];
                        formatted = `${countryCode} ${groups.join(' ')}`;
                    }
                }

                if (options?.addInfo && options?.setRecord) {
                    var infoMsg = (options?.infoMsg || options?.infoMsg === "") ? options?.infoMsg : `Value changed from ${value}`;
                    record.addInfo(field, infoMsg);
                }
            } else if (options?.setRecord) {
                formatted = "Invalid Phone Number";
            }

            if (options?.setRecord) {
                record.set(field, formatted);
            }
        }

        return formatted;
    }

    /**
     * Evaluates and formats a string value
     * @param record The record to validate and format
     * @param field The field to validate and format
     * @param validationType The type of validation to perform ('validate', 'isEmail', 'isPhone', 'isSSN', 'matchesPattern', 'hasLength', 'min', 'max')
     * @param formatOptions Options for string formatting
     * @param validationArgs Additional arguments for validation (e.g., pattern for matchesPattern)
     * @param options Options for validation and formatting including formatOnError
     * @returns boolean indicating if validation passed
     * @example
     * // Email validation and formatting
     * await StringValidator.evaluateAndFormat(record, "email", "isEmail", {
     *   case: 'lower',
     *   trim: true
     * });
     * 
     * // Pattern matching with formatting
     * await StringValidator.evaluateAndFormat(record, "code", "matchesPattern", {
     *   case: 'upper',
     *   padStart: 6,
     *   padChar: '0'
     * }, /^[A-Z]{2}\d{4}$/);
     * 
     * // Length validation with formatting
     * await StringValidator.evaluateAndFormat(record, "username", "hasLength", {
     *   case: 'lower',
     *   trim: true
     * }, [3, 20], {
     *   formatOnError: true,
     *   addError: true
     * });
     */
    public static async evaluateAndFormat(
        record: Record<string, any>,
        field: string,
        validationType: StringValidationType,
        formatOptions?: {
            case?: 'upper' | 'lower' | 'title';
            trim?: boolean;
            padStart?: number;
            padEnd?: number;
            padChar?: string;
            truncate?: number;
            replace?: { search: string | RegExp; replace: string };
            prefix?: string;
            suffix?: string;
        },
        validationArgs?: any,
        options?: {
            addError?: boolean;
            validateOnEmpty?: boolean;
            setRecord?: boolean;
            addInfo?: boolean;
            infoMsg?: string;
            errorMsg?: string;
            formatOnError?: boolean;
            formatOnEmpty?: boolean;
        }
    ): Promise<boolean> {
        let isValid: boolean;
        
        switch (validationType) {
            case StringValidationType.IS_EMAIL:
                isValid = this.isEmail(record, field, options);
                break;
            case StringValidationType.IS_PHONE:
                isValid = this.isPhone(record, field, validationArgs?.format, options);
                break;
            case StringValidationType.IS_SSN:
                isValid = this.isSSN(record, field, options);
                break;
            case StringValidationType.MATCHES_PATTERN:
                isValid = this.matchesPattern(record, field, validationArgs, options);
                break;
            case StringValidationType.HAS_LENGTH:
                var arg1 = null;
                var arg2 = null;
                if (Array.isArray(validationArgs) && validationArgs.length === 2) {
                    arg1 = validationArgs[0];
                    arg2 = validationArgs[1];
                } 
                isValid =  this.hasLength(record, field, arg1, arg2, options);                
                break;
            case StringValidationType.MIN:
                isValid = this.min(record, field, validationArgs, options);
                break;
            case StringValidationType.MAX:
                isValid = this.max(record, field, validationArgs, options);
                break;
            case StringValidationType.VALIDATE:
            default:
                const value = record.get(field);
                isValid = value !== null && value !== undefined;
                break;
        }
        
        if (isValid || options?.formatOnError) {
            await this.format(record, field, formatOptions, options);
        }
        
        return isValid;
    }

    /**
     * Evaluates and formats a phone number
     * @param record The record to validate and format
     * @param field The field to validate and format
     * @param format The phone format ('international' or 'us')
     * @param options Options for validation and formatting including formatOnError
     * @returns boolean indicating if validation passed
     * @example
     * // International phone number
     * await StringValidator.evaluateAndFormatPhone(record, "phone", "international", {
     *   formatOnError: true,
     *   addError: true,
     *   infoMsg: "Phone number has been formatted to international format"
     * });
     * 
     * // US phone number
     * await StringValidator.evaluateAndFormatPhone(record, "phone", "us", {
     *   validateOnEmpty: true,
     *   formatOnEmpty: false
     * });
     */
    public static async evaluateAndFormatPhone(
        record: Record<string, any>,
        field: string,
        format?: 'international' | 'us',
        options?: {
            addError?: boolean;
            validateOnEmpty?: boolean;
            setRecord?: boolean;
            addInfo?: boolean;
            infoMsg?: string;
            formatOnError?: boolean;
            formatOnEmpty?: boolean;
        }
    ): Promise<boolean> {
        const isValid = await this.isPhone(record, field, format, options);
        
        if (isValid || options?.formatOnError) {
            await this.formatPhone(record, field, format, options);
        }
        
        return isValid;
    }

    /**
     * Evaluates and formats an SSN
     * @param record The record to validate and format
     * @param field The field to validate and format
     * @param options Options for validation and formatting including formatOnError
     * @returns boolean indicating if validation passed
     * @example
     * // Basic SSN validation and formatting
     * await StringValidator.evaluateAndFormatSSN(record, "ssn", {
     *   formatOnError: false,
     *   addError: true
     * });
     * 
     * // SSN with custom options
     * await StringValidator.evaluateAndFormatSSN(record, "ssn", {
     *   validateOnEmpty: true,
     *   formatOnEmpty: false,
     *   infoMsg: "SSN has been validated and formatted"
     * });
     */
    public static async evaluateAndFormatSSN(
        record: Record<string, any>,
        field: string,
        options?: {
            addError?: boolean;
            validateOnEmpty?: boolean;
            setRecord?: boolean;
            addInfo?: boolean;
            infoMsg?: string;
            formatOnError?: boolean;
            formatOnEmpty?: boolean;
        }
    ): Promise<boolean> {
        const isValid = await this.isSSN(record, field, options);
        
        if (isValid || options?.formatOnError) {
            await this.formatSSN(record, field, options);
        }
        
        return isValid;
    }
} 