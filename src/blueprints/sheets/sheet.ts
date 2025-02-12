import { Flatfile } from "@flatfile/api";

export const patients: Flatfile.SheetConfig = {
  name: "Patients",
  slug: "patients",
  fields: [
    {
      key: "originatorPatientId",
      type: "string",
      label: "OriginatorPatientID",
      description: "The unique identifier for the patient used in the originating system",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "lastName",
      type: "string",
      label: "LastName",
      description: "The last name of the patient",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "firstName",
      type: "string",
      label: "Firstname",
      description: "The first name of the patient",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "middleName",
      type: "string",
      label: "MiddleName",
      description: "The middle name of the patient",
    },
    {
      key: "ssn",
      type: "string",
      label: "SSN",
      description: "The social security number of the patient",
    },
    {
      key: "dob",
      type: "date",
      label: "DoB",
      description: "The date of birth of the patient",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "sex",
      type: "enum",
      label: "Sex",
      description: "The sex of the patient",
      constraints: [
        {
          type: "required",
        },
      ],

      config: {
        options: [
          {
            value: "M",
            label: "Male",
          },
          {
            value: "F",
            label: "Female",
          },
        ],
      },
    },
    {
      key: "address1",
      type: "string",
      label: "Address1",
      description: "The first line of the patient's address",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "address2",
      type: "string",
      label: "Address2",
      description: "The second line of the patient's address",
    },
    {
      key: "city",
      type: "string",
      label: "City",
      description: "The city of the patient's address",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "state",
      type: "string",
      label: "State",
      description: "The state of the patient's address",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "zipCode",
      type: "string",
      label: "ZipCode",
      description: "The zip code of the patient's address",
      constraints: [
        {
          type: "stored",
          validator: "flatfileConditionalFieldValidator",
          config: {
            equals: "MO",
            dependencies: ["state"],
            dependentKey: "state",
            errorMessage: "ZipCode is required for Missouri addresses",
          },
        },
      ],
    },
    {
      key: "primaryPhone",
      type: "string",
      label: "PrimaryPhone",
      description: "The primary phone number of the patient",
      constraints: [
        {
          type: "required",
        },
      ],
    },
    {
      key: "email",
      type: "string",
      label: "Email",
      description: "The email address of the patient",
    },
    {
      key: "guardianFirstName",
      type: "string",
      label: "GuardianFirstName",
      description: "The first name of the patient's guardian",
    },
    {
      key: "guardianLastName",
      type: "string",
      label: "GuardianLastName",
      description: "The last name of the patient's guardian",
    },
    {
      key: "raceEthnicityDesc",
      type: "string",
      label: "RaceEthnicityDesc",
      description: "The race and ethnicity of the patient",
    },
    {
      key: "primaryInsuranceName",
      type: "string",
      label: "PrimaryInsuranceName",
      description: "The name of the patient's primary insurance provider",
    },
    {
      key: "primaryInsuranceMemberId",
      type: "string",
      label: "PrimaryInsuranceMemberID",
      description: "The member ID for the patient's primary insurance",
    },
    {
      key: "primaryInsuranceGroupNo",
      type: "string",
      label: "PrimaryInsuranceGroupNo",
      description: "The group number for the patient's primary insurance",
    },
    {
      key: "primaryInsuredFirstName",
      type: "string",
      label: "PrimaryInsuredFirstName",
      description: "The first name of the primary insured",
    },
    {
      key: "primaryInsuredLastName",
      type: "string",
      label: "PrimaryInsuredLastName",
      description: "The last name of the primary insured",
    },
    {
      key: "primaryInsuredDob",
      type: "date",
      label: "PrimaryInsuredDob",
      description: "The date of birth of the primary insured",
    },
    {
      key: "primaryInsuredGender",
      type: "enum",
      label: "PrimaryInsuredGender",
      description: "The gender of the primary insured",

      config: {
        options: [
          {
            value: "M",
            label: "Male",
          },
          {
            value: "F",
            label: "Female",
          },
        ],
      },
    },
    {
      key: "secondaryInsuranceName",
      type: "string",
      label: "SecondaryInsuranceName",
      description: "The name of the patient's secondary insurance provider",
    },
    {
      key: "secondaryInsuranceMemberId",
      type: "string",
      label: "SecondaryInsuranceMemberID",
      description: "The member ID for the patient's secondary insurance",
    },
    {
      key: "secondaryInsuranceGroupId",
      type: "string",
      label: "SecondaryInsuranceGroupID",
      description: "The group number for the patient's secondary insurance",
    },
    {
      key: "primaryRelationshipToInsuredDesc",
      type: "string",
      label: "PrimaryRelationshipToInsuredDesc",
      description: "The relationship of the patient to the primary insured",
    },
  ],
};
