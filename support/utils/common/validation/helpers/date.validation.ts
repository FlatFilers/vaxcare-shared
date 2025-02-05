const moment = require('moment');
moment.suppressDeprecationWarnings = true;

export enum DateValidationType {
    VALIDATE = 'validate',
    BEFORE = 'before',
    AFTER = 'after',
    BETWEEN = 'between'
}

export class DateValidator {

    private static isDate(value: string, format?: string) {
        var valid = true;
        var date = null;

        try {
            date = moment(value, format);
            if (!date.isValid()) { valid = false; }
        } catch (error) {
            valid = false;
        }

        return valid
    }

    /**
     * Validates if a field contains a valid date according to the specified format
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param format Optional date format (e.g. "MM/DD/YYYY"). If not provided, tries to parse as any valid date
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if date is valid
     * @example
     * // Validates that "birthDate" field contains a valid date in MM/DD/YYYY format
     * DateValidator.validate(record, "birthDate", "MM/DD/YYYY", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Please enter a valid birth date"
     * });
     */
    public static validate(record: Record<string, any>, field: string, format?: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false; 
        var isParseargument: any;
        var formatted = "";

        if(value) { 
            isParseargument = this.parseDateArgument(value);
            if(isParseargument){ value = isParseargument; formatted = moment(value, format).format(format); }
            valid = this.isDate(value.toString(), format); 
        }
        if(formatted != "") { record.set(field, formatted); }
        if(value || options?.validateOnEmpty) { 
        if(!valid && options?.addError) {
            var errorMsg = (options?.errorMsg || options?.errorMsg === "") ? options?.errorMsg : (format) ? `Please enter a valid date in the format ${format}` : "Please enter a valid date";
            record.addError(field, errorMsg);
            }
        }
        return valid;
    }

    /**
     * Formats a date field to the specified format
     * @param record The record containing the field to format
     * @param field The field name to format
     * @param format Optional date format (e.g. "MM/DD/YYYY"). If not provided, uses the original format
     * @param options Configuration options:
     *   - setRecord: If true, sets the formatted date back to the record
     *   - addInfo: If true, adds an info message when formatting
     *   - formatOnEmpty: If true, formats even if field is empty
     *   - infoMsg: Custom info message to display on formatting
     * @returns formatted date string
     * @example
     * // Formats "birthDate" field to MM/DD/YYYY format and updates the record
     * DateValidator.format(record, "birthDate", "MM/DD/YYYY", {
     *   setRecord: true,
     *   addInfo: true,
     *   infoMsg: "Birth date has been reformatted"
     * });
     */
    public static format(record: Record<string, any>, field: string, format?: string, options?: {setRecord?: boolean, addInfo?: boolean, formatOnEmpty?: boolean, infoMsg?: string}) {
        var value = record.get(field);
        var formatted = "";
        var isParseargument: any;

        if(value) { 
            isParseargument = this.parseDateArgument(value);
            if(isParseargument){ value = isParseargument; }
            formatted = moment(value, format).format(format); 
        }
        if(value || options?.formatOnEmpty) { 
            if(options?.addInfo && options?.setRecord) {
                var infoMsg = (options?.infoMsg || options?.infoMsg === "") ? options?.infoMsg : `Value has been formatted from ${value}`;
                record.addInfo(field, infoMsg);
            }
        }

        if(options?.setRecord || isParseargument) { record.set(field, formatted); }
        return formatted;
    }

    /**
     * Validates if a date field is before a specified date
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param dateBefore The date to compare against
     * @param format Optional date format (e.g. "MM/DD/YYYY"). If not provided, uses the original format
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if date is before the specified date
     * @example
     * // Validates that "birthDate" field is before 01/01/2024 in MM/DD/YYYY format
     * DateValidator.before(record, "birthDate", "01/01/2024", "MM/DD/YYYY", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Birth date must be before 2024"
     * });
     */
    public static before(record: Record<string, any>, field: string, dateBefore: string, format?: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;
        var dateBeforeFormatted = dateBefore;

        if(value) {
            if (this.isDate(dateBefore, format)) {
                dateBeforeFormatted = moment(dateBefore, format);
            } else {
                var dateBeforeParsed = this.parseDateArgument(dateBefore);
                if(dateBeforeParsed) {
                    dateBeforeFormatted = moment(dateBeforeParsed).format(format);
                }
            }

            var sendDateValid = this.isDate(value.toString(), format);
            if(!sendDateValid) {
                var parsedDate = this.parseDateArgument(value);
                if(parsedDate) {
                    sendDateValid = true;
                    value = parsedDate;
                    var formatted = moment(value, format).format(format);
                    record.set(field, formatted);
                }
            }

            // Check if both dates are valid
            if(sendDateValid && dateBeforeFormatted) {
                var date = moment(value, format);
                valid = date.isBefore(dateBeforeFormatted);
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = (options?.errorMsg || options?.errorMsg === "") ? options?.errorMsg : `Please enter a valid date before ${dateBeforeFormatted}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a date field is after a specified date
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param dateAfter The date to compare against
     * @param format Optional date format (e.g. "MM/DD/YYYY"). If not provided, uses the original format
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if date is after the specified date
     * @example
     * // Validates that "birthDate" field is after 01/01/2024 in MM/DD/YYYY format
     * DateValidator.after(record, "birthDate", "01/01/2024", "MM/DD/YYYY", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Birth date must be after 2024"
     * });
     */ 
    public static after(record: Record<string, any>, field: string, dateAfter: string, format?: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;
        var dateAfterFormatted = dateAfter;

        if(value) {
            if (this.isDate(dateAfter, format)) {
                dateAfterFormatted = moment(dateAfter, format);
            } else {
                var dateAfterParsed = this.parseDateArgument(dateAfter);
                if(dateAfterParsed) {
                    dateAfterFormatted = moment(dateAfterParsed).format(format);
                }
            }

            var sendDateValid = this.isDate(value.toString(), format);
            if(!sendDateValid) {
                var parsedDate = this.parseDateArgument(value);
                if(parsedDate) {
                    sendDateValid = true;
                    value = parsedDate;
                    var formatted = moment(value, format).format(format);
                    record.set(field, formatted);
                }
            }

            // Check if both dates are valid
            if(sendDateValid && dateAfterFormatted) {
                var date = moment(value, format);
                valid = date.isAfter(dateAfterFormatted);
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = (options?.errorMsg || options?.errorMsg === "") ? options?.errorMsg : `Please enter a valid date after ${dateAfterFormatted}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a date field is between two specified dates
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param dateStart The start date to compare against
     * @param dateEnd The end date to compare against
     * @param format Optional date format (e.g. "MM/DD/YYYY"). If not provided, uses the original format
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if date is between the specified dates
     * @example
     * // Validates that "birthDate" field is between 01/01/2024 and 01/01/2025 in MM/DD/YYYY format
     * DateValidator.between(record, "birthDate", "01/01/2024", "01/01/2025", "MM/DD/YYYY", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Birth date must be between 2024 and 2025"
     * });
     */ 
    public static between(record: Record<string, any>, field: string, dateStart: string, dateEnd: string, format?: string, options?: {addError?: boolean, validateOnEmpty?: boolean, errorMsg?: string}) {
        var value = record.get(field);
        var valid = false;
        var dateStartFormatted = dateStart;
        var dateEndFormatted = dateEnd;

        if(value) {
            if (this.isDate(dateStart, format)) {
                dateStartFormatted = moment(dateStart, format);
            } else {
                var dateStartParsed = this.parseDateArgument(dateStart);
                if(dateStartParsed) {
                    dateStartFormatted = moment(dateStartParsed).format(format);
                }
            }
            if (this.isDate(dateEnd, format)) {
                dateEndFormatted = moment(dateEnd, format);
            } else {
                var dateEndParsed = this.parseDateArgument(dateEnd);
                if(dateEndParsed) {
                    dateEndFormatted = moment(dateEndParsed).format(format);
                }
            }

            var sendDateValid = this.isDate(value.toString(), format);
            if(!sendDateValid) {
                var parsedDate = this.parseDateArgument(value);
                if(parsedDate) {
                    sendDateValid = true;
                    value = parsedDate;
                    var formatted = moment(value, format).format(format);
                    record.set(field, formatted);
                }
            }

            // Check if both dates are valid
            if(sendDateValid && dateStartFormatted && dateEndFormatted) {
                var date = moment(value, format);
                valid = date.isAfter(dateStartFormatted) && date.isBefore(dateEndFormatted);
            }
        }

        if(value || options?.validateOnEmpty) {
            if(!valid && options?.addError) {
                var errorMsg = (options?.errorMsg || options?.errorMsg === "") ? options?.errorMsg : `Please enter a valid date between ${dateStartFormatted} and ${dateEndFormatted}`;
                record.addError(field, errorMsg);
            }
        }

        return valid;
    }

    /**
     * Validates if a date field is after a specified date
     * @param record The record containing the field to validate
     * @param field The field name to validate
     * @param date The date to compare against
     * @param format Optional date format (e.g. "MM/DD/YYYY"). If not provided, uses the original format
     * @param options Configuration options:
     *   - addError: If true, adds an error message when validation fails
     *   - validateOnEmpty: If true, validates even if field is empty
     *   - errorMsg: Custom error message to display on validation failure
     * @returns boolean indicating if date is after the specified date
     * @example
     * // Validates that "startDate" field is after 01/01/2024 in MM/DD/YYYY format
     * DateValidator.after(record, "startDate", "01/01/2024", "MM/DD/YYYY", {
     *   addError: true,
     *   validateOnEmpty: true,
     *   errorMsg: "Start date must be after January 1st, 2024"
     * });
     * 
     * // Using dynamic date with 'now' syntax
     * DateValidator.after(record, "futureDate", "now+30days", "MM/DD/YYYY", {
     *   addError: true,
     *   errorMsg: "Date must be at least 30 days in the future"
     * });
     */
    private static parseDateArgument(arg: string): Date | false {
        if (!arg) return false;

        const now = new Date();
        
        switch(arg.toLowerCase()) {
            case 'now':
                return now;
            default:
                // Check for patterns like "now+5days", "now-3months", etc.
                const match = arg.toLowerCase().match(/^now([+-])(\d+)(days?|months?|years?)$/);
                if (match) {
                    const [_, operation, amount, unit] = match;
                    const value = parseInt(amount);
                    
                    switch(unit.replace(/s$/, '')) {
                        case 'day':
                            return new Date(now.setDate(now.getDate() + (operation === '+' ? value : -value)));
                        case 'month':
                            return new Date(now.setMonth(now.getMonth() + (operation === '+' ? value : -value)));
                        case 'year':
                            return new Date(now.setFullYear(now.getFullYear() + (operation === '+' ? value : -value)));
                        default:
                            return false;
                    }
                }
                return false;
        }
    }

    /**
     * Evaluates and formats a date value
     * @param record The record to validate and format
     * @param field The field to validate and format
     * @param validationType The type of validation to perform ('validate', 'before', 'after', 'between')
     * @param format The expected date format
     * @param validationArgs Additional arguments for validation (e.g., comparison date for before/after)
     * @param options Options for validation and formatting including formatOnError
     * @returns boolean indicating if validation passed
     * @example
     * // Validate and format a birth date to ensure it's before current date
     * DateValidator.evaluateAndFormat(record, "birthDate", "before", "MM/DD/YYYY", "now", {
     *   setRecord: true,
     *   addError: true,
     *   validateOnEmpty: true,
     *   formatOnError: false,
     *   errorMsg: "Birth date must be in the past"
     * });
     * 
     * // Validate and format a date range
     * DateValidator.evaluateAndFormat(record, "eventDate", "between", "MM/DD/YYYY", ["now", "now+30days"], {
     *   setRecord: true,
     *   addError: true,
     *   formatOnError: true,
     *   errorMsg: "Event must be scheduled within the next 30 days"
     * });
     */
    public static async evaluateAndFormat(
        record: Record<string, any>,
        field: string,
        validationType: DateValidationType,
        format?: string,
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
            case DateValidationType.BEFORE:
                isValid = this.before(record, field, validationArgs, format, options);
                break;
            case DateValidationType.AFTER:
                isValid = this.after(record, field, validationArgs, format, options);
                break;
            case DateValidationType.BETWEEN:
                var arg1 = null;
                var arg2 = null;
                if (Array.isArray(validationArgs) && validationArgs.length === 2) {
                    arg1 = validationArgs[0];
                    arg2 = validationArgs[1];
                } 
                isValid = this.between(record, field, arg1, arg2, format, options);
                break;
            case DateValidationType.VALIDATE:
            default:
                isValid = await this.validate(record, field, format, options);
                break;
        }
        
        if (isValid || options?.formatOnError) {
            await this.format(record, field, format, options);
        }
        
        return isValid;
    }
}