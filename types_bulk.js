/**
 * Redefinition of SESV2 types in Typescript
 *
 * @license BSD-3-Clause
 * @copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * @copyright 2014-2015 Stripe, Inc.
 * @copyright 2021 - 2022 Luke Zhang
 */
/** The status of a message sent using the SendBulkTemplatedEmail operation. */
export var BulkEmailStatus;
(function (BulkEmailStatus) {
    /** Amazon SES accepted the message, and will attempt to deliver it to the recipients. */
    BulkEmailStatus["Success"] = "SUCCESS";
    /** The message was rejected because it contained a virus. */
    BulkEmailStatus["MessageRejected"] = "MESSAGE_REJECTED";
    /** The sender's email address or domain was not verified. */
    BulkEmailStatus["MailFromDomainNotVerified"] = "MAIL_FROM_DOMAIN_NOT_VERIFIED";
    /** The configuration set you specified does not exist. */
    BulkEmailStatus["ConfigurationSetNameDoesNotExist"] = "CONFIGURATION_SET_DOES_NOT_EXIST";
    /** The template you specified does not exist. */
    BulkEmailStatus["TemplateDoesNotExist"] = "TEMPLATE_DOES_NOT_EXIST";
    /** Your account has been shut down because of issues related to your email sending practices. */
    BulkEmailStatus["AccountSuspended"] = "ACCOUNT_SUSPENDED";
    /** The number of emails you can send has been reduced because your account */
    BulkEmailStatus["AccountThrottled"] = "ACCOUNT_THROTTLED";
    /**
     * You have reached or exceeded the maximum number of emails you can send from your account in
     * a 24-hour period.
     */
    BulkEmailStatus["AccountDailyQuotaExceeded"] = "ACCOUNT_DAILY_QUOTA_EXCEEDED";
    /** The configuration set you specified refers to an IP pool that does not exist. */
    BulkEmailStatus["InvalidSendingPoolName"] = "INVALID_SENDING_POOL_NAME";
    /**
     * Email sending for the Amazon SES account was disabled using the
     * `UpdateAccountSendingEnabled`
     * (https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateAccountSendingEnabled.html) operation.
     */
    BulkEmailStatus["AccountSendingPaused"] = "ACCOUNT_SENDING_PAUSED";
    /**
     * Email sending for this configuration set was disabled using the
     * `UpdateConfigurationSetSendingEnabled`
     * (https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateConfigurationSetSendingEnabled.html)
     * operation.
     */
    BulkEmailStatus["ConfigurationSetSendingPaused"] = "CONFIGURATION_SET_SENDING_PAUSED";
    /**
     * One or more of the parameters you specified when calling this operation was invalid. See the
     * error message for additional information.
     */
    BulkEmailStatus["InvalidParameterValue"] = "INVALID_PARAMETER_VALUE";
    /** Amazon SES was unable to process your request because of a temporary issue. */
    BulkEmailStatus["TransientFailure"] = "TRANSIENT_FAILURE";
    /** Amazon SES was unable to process your request. See the error message for additional information. */
    BulkEmailStatus["Failed"] = "FAILED";
})(BulkEmailStatus || (BulkEmailStatus = {}));
//# sourceMappingURL=types_bulk.js.map