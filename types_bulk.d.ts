/**
 * Redefinition of SESV2 types in Typescript
 *
 * @license BSD-3-Clause
 * @copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * @copyright 2014-2015 Stripe, Inc.
 * @copyright 2021 - 2022 Luke Zhang
 */
import { Destination, MessageTag, Template } from "./types";
/** The status of a message sent using the SendBulkTemplatedEmail operation. */
export declare enum BulkEmailStatus {
    /** Amazon SES accepted the message, and will attempt to deliver it to the recipients. */
    Success = "SUCCESS",
    /** The message was rejected because it contained a virus. */
    MessageRejected = "MESSAGE_REJECTED",
    /** The sender's email address or domain was not verified. */
    MailFromDomainNotVerified = "MAIL_FROM_DOMAIN_NOT_VERIFIED",
    /** The configuration set you specified does not exist. */
    ConfigurationSetNameDoesNotExist = "CONFIGURATION_SET_DOES_NOT_EXIST",
    /** The template you specified does not exist. */
    TemplateDoesNotExist = "TEMPLATE_DOES_NOT_EXIST",
    /** Your account has been shut down because of issues related to your email sending practices. */
    AccountSuspended = "ACCOUNT_SUSPENDED",
    /** The number of emails you can send has been reduced because your account */
    AccountThrottled = "ACCOUNT_THROTTLED",
    /**
     * You have reached or exceeded the maximum number of emails you can send from your account in
     * a 24-hour period.
     */
    AccountDailyQuotaExceeded = "ACCOUNT_DAILY_QUOTA_EXCEEDED",
    /** The configuration set you specified refers to an IP pool that does not exist. */
    InvalidSendingPoolName = "INVALID_SENDING_POOL_NAME",
    /**
     * Email sending for the Amazon SES account was disabled using the
     * `UpdateAccountSendingEnabled`
     * (https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateAccountSendingEnabled.html) operation.
     */
    AccountSendingPaused = "ACCOUNT_SENDING_PAUSED",
    /**
     * Email sending for this configuration set was disabled using the
     * `UpdateConfigurationSetSendingEnabled`
     * (https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateConfigurationSetSendingEnabled.html)
     * operation.
     */
    ConfigurationSetSendingPaused = "CONFIGURATION_SET_SENDING_PAUSED",
    /**
     * One or more of the parameters you specified when calling this operation was invalid. See the
     * error message for additional information.
     */
    InvalidParameterValue = "INVALID_PARAMETER_VALUE",
    /** Amazon SES was unable to process your request because of a temporary issue. */
    TransientFailure = "TRANSIENT_FAILURE",
    /** Amazon SES was unable to process your request. See the error message for additional information. */
    Failed = "FAILED"
}
/** An object which contains ReplacementTemplateData to be used for a specific `BulkEmailEntry`. */
export interface ReplacementTemplate {
    /**
     * A list of replacement values to apply to the template. This parameter is a JSON object,
     * typically consisting of key-value pairs in which the keys correspond to replacement tags in
     * the email template.
     */
    data: string;
}
/**
 * The ReplaceEmailContent object to be used for a specific `BulkEmailEntry`. The
 * `ReplacementTemplate` can be specified within this object.
 */
export interface ReplacementEmailContent {
    /** The `ReplacementTemplate` associated with `ReplacementEmailContent`. */
    replacementTemplate: ReplacementTemplate;
}
export interface BulkEmailEntry {
    /**
     * Represents the destination of the message, consisting of To:, CC:, and BCC: fields. Amazon
     * SES does not support the SMTPUTF8 extension, as described in RFC6531
     * (https://tools.ietf.org/html/rfc6531). For this reason, the local part of a destination
     * email address (the part of the email address that precedes the @ sign) may only contain
     * 7-bit ASCII characters (https://en.wikipedia.org/wiki/Email_address#Local-part). If the
     * domain part of an address (the part after the @ sign) contains non-ASCII characters, they
     * must be encoded using Punycode, as described in RFC3492 (https://tools.ietf.org/html/rfc3492.html).
     */
    destination: Destination;
    /** The `ReplacementEmailContent` associated with a `BulkEmailEntry`. */
    content?: ReplacementEmailContent;
    /**
     * A list of tags, in the form of name/value pairs, to apply to an email that you send using
     * the `SendBulkTemplatedEmail` operation. Tags correspond to characteristics of the email that
     * you define, so that you can publish email sending events.
     */
    tags?: MessageTag;
}
/** An object that contains the body of the message. You can specify a template message. */
export interface BulkEmailContent {
    /** The template to use for the bulk email message. */
    template: Template;
}
/**
 * Represents a request to send email messages to multiple destinations using Amazon SES. For more
 * information, see the Amazon SES Developer Guide
 * (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html).
 */
export interface SendBulkEmailInput {
    /** The list of bulk email entry objects. */
    entries: BulkEmailEntry[];
    /** An object that contains the body of the message. You can specify a template message. */
    defaultContent: BulkEmailContent;
    /** The name of the configuration set to use when sending the email. */
    configSetName?: string;
    /**
     * A list of tags, in the form of name/value pairs, to apply to an email that you send using
     * the SendEmail operation. Tags correspond to characteristics of the email that you define, so
     * that you can publish email sending events.
     */
    defaultTags?: MessageTag;
    /** The address that you want bounce and complaint notifications to be sent to. */
    feedbackForwardingEmailAddress?: string;
    /**
     * This parameter is used only for sending authorization. It is the ARN of the identity that is
     * associated with the sending authorization policy that permits you to use the email address
     * specified in the `feedbackForwardingEmailAddress` parameter. For example, if the owner of
     * example.com (which has ARN `arn:aws:ses:us-east-1:123456789012:identity/example.com`)
     * attaches a policy to it that authorizes you to use feedback@example.com, then you would
     * specify the `feedbackForwardingEmailAddressIdentityArn` to be
     * `arn:aws:ses:us-east-1:123456789012:identity/example.com`, and the
     * `feedbackForwardingEmailAddress` to be feedback@example.com. For more information about
     * sending authorization, see the Amazon SES Developer Guide
     * (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html).
     */
    feedbackForwardingEmailAddressIdentityArn?: string;
    /**
     * The email address to use as the "From" address for the email. The address that you specify
     * has to be verified.
     */
    from: string;
    /**
     * This parameter is used only for sending authorization. It is the ARN of the identity that is
     * associated with the sending authorization policy that permits you to use the email address
     * specified in the `from` parameter. For example, if the owner of example.com (which has ARN
     * `arn:aws:ses:us-east-1:123456789012:identity/example.com`) attaches a policy to it that
     * authorizes you to use sender@example.com, then you would specify the `fromArn` to be
     * `arn:aws:ses:us-east-1:123456789012:identity/example.com`, and the `from` to be
     * sender@example.com. For more information about sending authorization, see the Amazon SES
     * Developer Guide (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html).
     */
    fromArn?: string;
    /**
     * The "Reply-to" email addresses for the message. When the recipient replies to the message,
     * each Reply-to address receives the reply.
     */
    replyTo?: string[];
}
/** The result of the SendBulkEmail operation of each specified BulkEmailEntry. */
export interface BulkEmailEntryResult {
    /**
     * A description of an error that prevented a message being sent using the
     * SendBulkTemplatedEmail operation.
     */
    error?: string;
    /** The unique message identifier returned from the SendBulkTemplatedEmail operation. */
    messageId: string;
    /** The status of a message sent using the SendBulkTemplatedEmail operation. */
    status: BulkEmailStatus;
}
/** The following data is returned in JSON format by the service. */
export interface SendBulkEmailOutput {
    /**
     * One object per intended recipient. Check each response object and retry any messages with a
     * failure status.
     */
    result: BulkEmailEntryResult[];
    /** Metadata pertaining to the operation's result. */
    metaData?: {
        [key: string]: unknown;
    };
}
