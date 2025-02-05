import { externalConstraint } from "@flatfile/plugin-constraints";
import { DateValidator, DateValidationType   } from "./helpers/date.validation";
import { NumberValidator, NumberValidationType } from "./helpers/number.validation";
import { StringValidator, StringValidationType } from "./helpers/string.validation";
import FlatfileListener from "@flatfile/listener";

export { DateValidator, NumberValidator, StringValidator, DateValidationType, NumberValidationType, StringValidationType };

export enum ValidationType {
    VALIDATE = "validate",
    FORMAT = "format",
    BEFORE = "before",
    AFTER = "after",
    BETWEEN = "between",
    EVALUATE_AND_FORMAT = "evaluateandformat",
    MIN = "min",
    MAX = "max",
    RANGE = "range",
    INTEGER = "integer",
    POSITIVE = "positive",
    NEGATIVE = "negative",
    MULTIPLE = "multiple",
    PRECISION = "precision",
    EMAIL = "email",
    PHONE = "phone",
    SSN = "ssn",
    PATTERN = "pattern",
    LENGTH = "length",
    IS_EMAIL = "isEmail",
    IS_PHONE = "isPhone",
    IS_SSN = "isSSN",
    FORMAT_SSN = "formatSSN",
    FORMAT_PHONE = "formatPhone",
    EVALUATE_AND_FORMAT_PHONE = "evaluateandformatphone",
    EVALUATE_AND_FORMAT_SSN = "evaluateandformatssn"
}

export function addDateValidator(listener: FlatfileListener) {
    listener.use(
      externalConstraint("DateValidator", (value, key, { config, record }) => {
        switch(config.type) {
          case ValidationType.VALIDATE:
            DateValidator.validate(record, key , config.format, config.options);
            break;
          case ValidationType.FORMAT:
            DateValidator.format(record, key, config.format, config.options);
            break;  
          case ValidationType.BEFORE:
            DateValidator.before(record, key, config.beforeDate, config.format, config.options);
            break;
          case ValidationType.AFTER:
            DateValidator.after(record, key, config.afterDate, config.format, config.options);
            break;  
          case ValidationType.BETWEEN:
            DateValidator.between(record, key, config.startDate, config.endDate, config.format, config.options);
            break;
          case ValidationType.EVALUATE_AND_FORMAT:
            DateValidator.evaluateAndFormat(record, key, config.validationType, config.format, config.args, config.options);
            break;
        }
      })
    );
}

export function addNumberValidator(listener: FlatfileListener) {
    listener.use(
      externalConstraint("NumberValidator", (value, key, { config, record }) => {
        switch(config.type) {
          case ValidationType.VALIDATE:
            NumberValidator.validate(record, key, config.options);
            break;
          case ValidationType.FORMAT:
            NumberValidator.format(record, key, config.formatOptions, config.options);
            break;
          case ValidationType.MIN:
            NumberValidator.min(record, key, config.min, config.options);
            break;
          case ValidationType.MAX:
            NumberValidator.max(record, key, config.max, config.options);
            break;
          case ValidationType.RANGE:
            NumberValidator.range(record, key, config.min, config.max, config.options);
            break;
          case ValidationType.INTEGER:
            NumberValidator.isInteger(record, key, config.options);
            break;
          case ValidationType.POSITIVE:
            NumberValidator.isPositive(record, key, config.options);
            break;
          case ValidationType.NEGATIVE:
            NumberValidator.isNegative(record, key, config.options);
            break;
          case ValidationType.MULTIPLE:
            NumberValidator.isMultipleOf(record, key, config.multiple, config.options);
            break;
          case ValidationType.PRECISION:
            NumberValidator.hasPrecision(record, key, config.precision, config.options);
            break;
          case ValidationType.EVALUATE_AND_FORMAT:
            NumberValidator.evaluateAndFormat(record, key, config.validationType, config.formatOptions, config.args, config.options);
            break;
        }
      })
    );
}

export function addStringValidator(listener: FlatfileListener) {
    listener.use(
      externalConstraint("StringValidator", (value, key, { config, record }) => {
        switch(config.type) {
          case ValidationType.FORMAT:
            StringValidator.format(record, key, config.formatOptions, config.options);
            break;
          case ValidationType.EMAIL:
            StringValidator.isEmail(record, key, config.options);
            break;
          case ValidationType.PHONE:
            StringValidator.isPhone(record, key, config.format, config.options);
            break;
          case ValidationType.SSN:
            StringValidator.isSSN(record, key, config.options);
            break;
          case ValidationType.PATTERN:
            StringValidator.matchesPattern(record, key, config.pattern, config.options);
            break;
          case ValidationType.LENGTH:
            StringValidator.hasLength(record, key, config.min, config.max, config.options);
            break;
          case ValidationType.MIN:
            StringValidator.min(record, key, config.min, config.options);
            break;
          case ValidationType.MAX:
            StringValidator.max(record, key, config.max, config.options);
            break;
          case ValidationType.FORMAT_SSN:
            StringValidator.formatSSN(record, key, config.options);
            break;
          case ValidationType.FORMAT_PHONE:
            StringValidator.formatPhone(record, key, config.format, config.options);
            break;
          case ValidationType.EVALUATE_AND_FORMAT:
            StringValidator.evaluateAndFormat(record, key, config.validationType, config.formatOptions, config.args, config.options);
            break; 
          case ValidationType.EVALUATE_AND_FORMAT_PHONE:
            StringValidator.evaluateAndFormatPhone(record, key, config.format, config.options);
            break;
          case ValidationType.EVALUATE_AND_FORMAT_SSN:
            StringValidator.evaluateAndFormatSSN(record, key, config.options);
            break;
        }
      })
    );
}
