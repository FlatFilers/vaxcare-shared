export enum NumberValidationType {
    VALIDATE = 'validate',
    MIN = 'min',
    MAX = 'max',
    RANGE = 'range',
    IS_INTEGER = 'isInteger',
    IS_POSITIVE = 'isPositive',
    IS_NEGATIVE = 'isNegative',
    IS_MULTIPLE_OF = 'isMultipleOf',
    HAS_PRECISION = 'hasPrecision'
}

export class NumberValidator {
    private static isNumber(value: any): boolean {
        if (typeof value === 'number') return true;
        if (typeof value === 'string') {
            const num = this.parseNumberForValidation(value.trim());
            return !isNaN(num);
        }
        return false;
    }

    /**
     * Simple number parsing for validation purposes - preserves exact value
     * @param value The string value to parse
     * @returns The parsed number
     */
    private static parseNumberForValidation(value: string): number {
        return Number(value);
    }

    /**
     * Gets the decimal and thousand separators for a given locale
     * @param locale The locale to get separators for
     * @returns Object containing decimal and thousand separators
     */
    private static getLocaleSpecificSeparators(locale: string = 'en-US'): { decimal: string, thousand: string } {
        // Get separators from locale
        const numberWithDecimal = 1.1;
        const numberWithThousands = 1000;
        
        try {
            const formattedDecimal = Intl.NumberFormat(locale).format(numberWithDecimal);
            const formattedThousand = Intl.NumberFormat(locale).format(numberWithThousands);
            
            return {
                decimal: formattedDecimal.charAt(1),
                thousand: formattedThousand.charAt(1)
            };
        } catch (error) {
            // Default to US format if locale is invalid
            return {
                decimal: '.',
                thousand: ','
            };
        }
    }

    /**
     * Parses a number string intelligently handling different decimal separators based on locale
     * Used only for formatting purposes
     * @param value The string value to parse
     * @param locale The locale to use for parsing (default: 'en-US')
     * @returns The parsed number
     */
    private static parseNumberForFormat(value: string, locale: string = 'en-US'): number {
        if (!value) return NaN;

        // Remove any currency symbols or other non-numeric characters except . and ,
        value = value.replace(/[^\d,.-]/g, '');
        
        // Get locale-specific separators
        const { decimal, thousand } = this.getLocaleSpecificSeparators(locale);

        // Count occurrences of commas and periods
        const commas = (value.match(/,/g) || []).length;
        const periods = (value.match(/\./g) || []).length;

        // If there's only one separator, determine if it's likely a thousand or decimal separator
        if (commas === 1 && periods === 0) {
            // Check position of comma
            const commaIndex = value.indexOf(',');
            // If comma is followed by exactly 3 digits, it's likely a thousand separator in US format
            if (locale === 'en-US' && value.length - commaIndex === 4) {
                return Number(value.replace(/,/g, ''));
            }
            // Otherwise treat as decimal
            return Number(value.replace(',', '.'));
        }

        if (periods === 1 && commas === 0) {
            // Check position of period
            const periodIndex = value.indexOf('.');
            // If period is followed by exactly 3 digits, it's likely a thousand separator in EU format
            if (locale !== 'en-US' && value.length - periodIndex === 4) {
                return Number(value.replace(/\./g, ''));
            }
            // Otherwise keep as is
            return Number(value);
        }

        // For multiple separators, use locale to determine which is thousand and which is decimal
        if (decimal === '.' && thousand === ',') {
            // US format: remove commas, keep period
            return Number(value.replace(/,/g, ''));
        } else if (decimal === ',' && thousand === '.') {
            // EU format: remove periods, replace comma with period
            return Number(value.replace(/\./g, '').replace(',', '.'));
        }

        // Default fallback: try to make a best guess
        if (commas > 0 && periods > 0) {
            // If comma is after the last period, treat comma as decimal
            const lastPeriodIndex = value.lastIndexOf('.');
            const lastCommaIndex = value.lastIndexOf(',');
            if (lastCommaIndex > lastPeriodIndex) {
                return Number(value.replace(/\./g, '').replace(',', '.'));
            }
            // Otherwise treat period as decimal
            return Number(value.replace(/,/g, ''));
        }

        // If all else fails, remove all non-numeric characters except the last separator
        return Number(value.replace(/,/g, ''));
    }

    /**
     * Formats a number as a percentage, with special handling for decimal values
     * @param value The number to format
     * @param decimalPlaces Number of decimal places
     * @param locale Locale for formatting
     * @returns The formatted number
     * @example
     * formatPercent(12) -> 12%
     * formatPercent(1.2) -> 1.2%
     * formatPercent(0.12) -> 12%
     * formatPercent(.12) -> 12%
     */
    private static formatPercent(value: number, decimalPlaces: number, locale: string = 'en-US'): string {
        // Convert to string to check for leading zero or decimal point
        const strValue = value.toString();
        
        // If value starts with '0.' or '.' multiply by 100
        if (strValue.startsWith('0.') || strValue.startsWith('.')) {
            value = value * 100;
        }

        // Use NumberFormat for locale-specific formatting
        try {
            const formatter = new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces
            });
            return formatter.format(value) + '%';
        } catch (error) {
            // Fallback to basic formatting if Intl.NumberFormat fails
            return value.toFixed(decimalPlaces) + '%';
        }
    }

    /**
     * Validates if a field contains a valid number
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if value is a valid number
     * @example
     * // Validates that "amount" field contains a valid number
     * NumberValidator.validate(record, "amount", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Please enter a valid number"
     * });
     */
    public static validate(record: Record<string, any>, field: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) { valid = this.isNumber(value); }
        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || "Please enter a valid number";
                record.addError(field, errorMsg);
            }
        }
        return valid;
    }

    /**
     * Formats a number field according to specified format
     * @param record The record containing the field to format
     * @param field The field name to format
     * @param format Format configuration:
     *   - style: Number style ('decimal', 'currency', 'percent')
     *   - currency: Currency code for currency style (e.g., 'USD', 'EUR')
     *   - decimalPlaces: Number of decimal places
     *   - locale: Locale for number formatting (e.g., 'en-US', 'fr-FR')
     * @param options Configuration options:
     *   - setRecord: If true, sets the formatted number back to the record
     *   - addInfo: If true, adds an info message when formatting
     *   - formatOnEmpty: If true, formats even if field is empty
     *   - infoMsg: Custom info message to display on formatting
     * @returns formatted number string
     * @example
     * // Formats "price" field as USD currency with 2 decimal places
     * NumberValidator.format(record, "price", {
     *   style: 'currency',
     *   currency: 'USD',
     *   decimalPlaces: 2,
     *   locale: 'en-US'
     * }, {
     *   setRecord: true,
     *   addInfo: true,
     *   infoMsg: "Price has been formatted as currency"
     * });
     */
    public static format(record: Record<string, any>, field: string, format?: {
        style?: 'decimal' | 'currency' | 'percent',
        currency?: string,
        decimalPlaces?: number,
        locale?: string
    }, options?: {
        setRecord?: boolean, 
        addInfo?: boolean, 
        formatOnEmpty?: boolean, 
        infoMsg?: string
    }) {
        var value = record.get(field);
        var formatted = "";

        if(value) {
            const locale = format?.locale ?? 'en-US';
            const parsedNum = this.parseNumberForFormat(value.toString(), locale);
            if (!isNaN(parsedNum)) {
                const decimalPlaces = format?.decimalPlaces ?? 2;
                const style = format?.style ?? 'decimal';
                const currency = format?.currency ?? 'USD';

                try {
                    if (style === 'percent') {
                        formatted = this.formatPercent(parsedNum, decimalPlaces, locale);
                    } else {
                        const formatter = new Intl.NumberFormat(locale, {
                            style: style,
                            currency: style === 'currency' ? currency : undefined,
                            minimumFractionDigits: decimalPlaces,
                            maximumFractionDigits: decimalPlaces
                        });
                        formatted = formatter.format(parsedNum);
                    }
                } catch (error) {
                    // If Intl.NumberFormat fails, use locale-specific separators
                    const { decimal, thousand } = this.getLocaleSpecificSeparators(locale);
                    const fixed = parsedNum.toFixed(decimalPlaces);
                    // Replace the decimal point with the locale-specific decimal separator
                    formatted = fixed.replace('.', decimal);
                }
            }
        }

        if(value || options?.formatOnEmpty) {
            if(options?.addInfo && options?.setRecord) {
                var infoMsg = (options?.infoMsg || options?.infoMsg === "") ? options?.infoMsg : `Value changed from ${value}`;
                record.addInfo(field, infoMsg);
            }
        }

        if(options?.setRecord) { record.set(field, formatted); }
        return formatted;
    }

    /**
     * Validates if a number field is greater than a minimum value
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param min The minimum value to compare against
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if number is greater than the minimum
     * @example
     * // Validates that "age" field is greater than 18
     * NumberValidator.min(record, "age", 18, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Age must be at least 18"
     * });
     */
    public static min(record: Record<string, any>, field: string, min: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = num >= min;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must be greater than or equal to ${min}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field is less than a maximum value
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param max The maximum value to compare against
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if number is less than the maximum
     * @example
     * // Validates that "quantity" field is less than 100
     * NumberValidator.max(record, "quantity", 100, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Quantity must not exceed 100"
     * });
     */
    public static max(record: Record<string, any>, field: string, max: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = num <= max;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must be less than or equal to ${max}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field is within a specified range
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param min The minimum value of the range
     * @param max The maximum value of the range
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if number is within the range
     * @example
     * // Validates that "score" field is between 0 and 100
     * NumberValidator.range(record, "score", 0, 100, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Score must be between 0 and 100"
     * });
     */
    public static range(record: Record<string, any>, field: string, min: number, max: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = num >= min && num <= max;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must be between ${min} and ${max}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field is an integer (whole number)
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if number is an integer
     * @example
     * // Validates that "quantity" field is a whole number
     * NumberValidator.isInteger(record, "quantity", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Quantity must be a whole number"
     * });
     */
    public static isInteger(record: Record<string, any>, field: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = Number.isInteger(num);
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || "Value must be a whole number";
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field is positive (greater than 0)
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     *   - includeZero: If true, considers 0 as positive
     * @returns boolean indicating if number is positive
     * @example
     * // Validates that "price" field is positive
     * NumberValidator.isPositive(record, "price", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Price must be positive"
     * });
     */
    public static isPositive(record: Record<string, any>, field: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string, includeZero?: boolean}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = options?.includeZero ? num >= 0 : num > 0;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || (options?.includeZero ? "Value must be greater than or equal to 0" : "Value must be greater than 0");
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field is negative (less than 0)
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     *   - includeZero: If true, considers 0 as negative
     * @returns boolean indicating if number is negative
     * @example
     * // Validates that "temperature" field is negative
     * NumberValidator.isNegative(record, "temperature", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Temperature must be below 0"
     * });
     */
    public static isNegative(record: Record<string, any>, field: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string, includeZero?: boolean}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = options?.includeZero ? num <= 0 : num < 0;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || (options?.includeZero ? "Value must be less than or equal to 0" : "Value must be less than 0");
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field is a multiple of another number
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param multiple The number that the value should be a multiple of
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if number is a multiple
     * @example
     * // Validates that "quantity" field is a multiple of 5
     * NumberValidator.isMultipleOf(record, "quantity", 5, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Quantity must be a multiple of 5"
     * });
     */
    public static isMultipleOf(record: Record<string, any>, field: string, multiple: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                valid = num % multiple === 0;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must be a multiple of ${multiple}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a number field has the specified precision (number of decimal places)
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param precision The exact number of decimal places required
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if number has correct precision
     * @example
     * // Validates that "price" field has exactly 2 decimal places
     * NumberValidator.hasPrecision(record, "price", 2, {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Price must have exactly 2 decimal places"
     * });
     */
    public static hasPrecision(record: Record<string, any>, field: string, precision: number, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;

        if(value) {
            const num = this.parseNumberForValidation(value.toString());
            if (!isNaN(num)) {
                const decimalStr = num.toString().split('.')[1] || '';
                valid = decimalStr.length === precision;
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = options?.errorMsg || `Value must have exactly ${precision} decimal places`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Evaluates and formats a number value
     * @param record The record to validate and format
     * @param field The field to validate and format
     * @param validationType The type of validation to perform ('validate', 'min', 'max', 'range', 'isInteger', 'isPositive', 'isNegative', 'isMultipleOf', 'hasPrecision')
     * @param formatOptions Options for number formatting
     * @param validationArgs Additional arguments for validation (e.g., min/max values)
     * @param options Options for validation and formatting including formatOnError
     * @returns boolean indicating if validation passed
     */
    public static async evaluateAndFormat(
        record: Record<string, any>,
        field: string,
        validationType: NumberValidationType,
        formatOptions?: {
            style?: 'decimal' | 'currency' | 'percent';
            currency?: string;
            decimalPlaces?: number;
            locale?: string;
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
            case NumberValidationType.MIN:
                isValid = await this.min(record, field, validationArgs, options);
                break;
            case NumberValidationType.MAX:
                isValid = await this.max(record, field, validationArgs, options);
                break;
            case NumberValidationType.RANGE:
                var arg1 = null;
                var arg2 = null;
                if (Array.isArray(validationArgs) && validationArgs.length === 2) {
                    arg1 = validationArgs[0];
                    arg2 = validationArgs[1];
                } 
                isValid = await this.range(record, field, arg1, arg2, options);
                break;
            case NumberValidationType.IS_INTEGER:
                isValid = await this.isInteger(record, field, options);
                break;
            case NumberValidationType.IS_POSITIVE:
                isValid = await this.isPositive(record, field, options);
                break;
            case NumberValidationType.IS_NEGATIVE:
                isValid = await this.isNegative(record, field, options);
                break;
            case NumberValidationType.IS_MULTIPLE_OF:
                isValid = await this.isMultipleOf(record, field, validationArgs, options);
                break;
            case NumberValidationType.HAS_PRECISION:
                isValid = await this.hasPrecision(record, field, validationArgs, options);
                break;
            case NumberValidationType.VALIDATE:
            default:
                isValid = await this.validate(record, field, options);
                break;
        }
        
        if (isValid || options?.formatOnError) {
            await this.format(record, field, formatOptions, options);
        }
        
        return isValid;
    }
}