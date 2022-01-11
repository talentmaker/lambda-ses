/**
 * Redefinition of SESV2 types in Typescript
 *
 * @license BSD-3-Clause
 * @copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * @copyright 2014-2015 Stripe, Inc.
 * @copyright 2021 - 2022 Luke Zhang
 */

/** An object that represents the content of the email, and optionally a character set specification. */
export interface Content {
    /** The content of the message itself. */
    data: string

    /**
     * The character set for the content. Because of the constraints of the SMTP protocol, Amazon
     * SES uses 7-bit ASCII by default. If the text includes characters outside of the ASCII range,
     * you have to specify a character set. For example, you could specify UTF-8, ISO-8859-1, or Shift_JIS.
     */
    charset?: string
}

/** Represents the raw content of an email message. */
export interface RawMessage {
    data: ArrayBuffer
}

/** Represents the body of the email message. */
export interface Body {
    /**
     * An object that represents the version of the message that is displayed in email clients that
     * support HTML. HTML messages can include formatted text, hyperlinks, images, and more.
     */
    html?: Content

    /**
     * An object that represents the version of the message that is displayed in email clients that
     * don't support HTML, or clients where the recipient has disabled HTML rendering.
     */
    text?: Content
}

/**
 * Represents the email message that you're sending. The Message object consists of a subject line
 * and a message body.
 */
export interface Message {
    /**
     * The body of the message. You can specify an HTML version of the message, a text-only version
     * of the message, or both.
     */
    body: Body

    /**
     * The subject line of the email. The subject line can only contain 7-bit ASCII characters.
     * However, you can specify non-ASCII characters in the subject line by using encoded-word
     * syntax, as described in RFC 2047 (https tools.ietf.org/html/rfc2047).
     */
    subject: Content
}

/**
 * An object that defines the email template to use for an email message, and the values to use for
 * any message variables in that template. An email template is a type of message template that
 * contains content that you want to define, save, and reuse in email messages that you send.
 */
export interface Template {
    /** The Amazon Resource Name (ARN) of the template. */
    arn?: string

    /**
     * An object that defines the values to use for message variables in the template. This object
     * is a set of key-value pairs. Each key defines a message variable in the template. The
     * corresponding value defines the value to use for that variable.
     */
    data?: string

    /**
     * The name of the template. You will refer to this name when you send email using the
     * SendTemplatedEmail or SendBulkTemplatedEmail operations.
     */
    name?: string
}

/**
 * An object that defines the entire content of the email, including the message headers and the
 * body content. You can create a simple email message, in which you specify the subject and the
 * text and HTML versions of the message body. You can also create raw messages, in which you
 * specify a complete MIME-formatted message. Raw messages can include attachments and custom headers.
 */
export interface EmailContent {
    /**
     * Shortcut for a simple message.
     *
     * The body of the message. You can specify an HTML version of the message, a text-only version
     * of the message, or both.
     */
    body?: Body

    /**
     * Shortcut for a simple message.
     *
     * The subject line of the email. The subject line can only contain 7-bit ASCII characters.
     * However, you can specify non-ASCII characters in the subject line by using encoded-word
     * syntax, as described in RFC 2047 (https tools.ietf.org/html/rfc2047).
     */
    subject?: Content

    /**
     * The raw email message. The message has to meet the following criteria:
     *
     * - The message has to contain a header and a body, separated by one blank line.
     * - All of the required header fields must be present in the message.
     * - Each part of a multipart MIME message must be formatted properly.
     * - If you include attachments, they must be in a file format that the Amazon SES API v2 supports.
     * - The entire message must be Base64 encoded.
     * - If any of the MIME parts in your message contain content that is outside of the 7-bit ASCII
     *   character range, you should encode that content to ensure that recipients' email clients
     *   render the message properly.
     * - The length of any single line of text in the message can't exceed 1,000 characters. This
     *   restriction is defined in RFC 5321 (https tools.ietf.org/html/rfc5321).
     */
    raw?: RawMessage

    /** The simple email message. The message consists of a subject and a message body. */
    simple?: Message

    /** The template to use for the email message. */
    template?: Template
}

/**
 * An object that describes the recipients for an email. Amazon SES does not support the SMTPUTF8
 * extension, as described in RFC6531 (https://tools.ietf.org/html/rfc6531). For this reason, the
 * local part of a destination email address (the part of the email address that precedes the @
 * sign) may only contain 7-bit ASCII characters
 * (https://en.wikipedia.org/wiki/Email_address#Local-part). If the domain part of an address (the
 * part after the @ sign) contains non-ASCII characters, they must be encoded using Punycode, as
 * described in RFC3492 (https://tools.ietf.org/html/rfc3492.html).
 */
export interface Destination {
    /** An array that contains the email addresses of the "BCC" (blind carbon copy) recipients for the email. */
    bcc?: string[]

    /** An array that contains the email addresses of the "CC" (carbon copy) recipients for the email. */
    cc?: string[]

    /** An array that contains the email addresses of the "To" recipients for the email. */
    to: [string, ...string[]]
}

/**
 * Contains the name and value of a tag that you apply to an email. You can use message tags when
 * you publish email sending events. Key: the name of the message tag. The message tag name has to
 * meet the following criteria:
 *
 * - It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-).
 * - It can contain no more than 256 characters. This member is required. Value: the value of the
 *   message tag. The message tag value has to meet the following criteria:
 * - It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-).
 * - It can contain no more than 256 characters.
 */
export type MessageTag = {[key: string]: string}

/**
 * An object used to specify a list or topic to which an email belongs, which will be used when a
 * contact chooses to unsubscribe.
 */
export interface ListManagementOptions {
    /** The name of the contact list. */
    contactListName: string

    /** The name of the topic. */
    topicName?: string
}

/**
 * Represents a request to send a single formatted email using Amazon SES. For more information,
 * see the Amazon SES Developer Guide (https
 * docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-formatted.html).
 */
export interface SendEmailInput {
    /**
     * An object that contains the body of the message. You can send either a Simple message Raw
     * message or a template Message.
     */
    content: EmailContent

    /** The name of the configuration set to use when sending the email. */
    configSetName?: string

    /** An object that contains the recipients of the email message. */
    dest: Destination

    /**
     * A list of tags, in the form of name/value pairs, to apply to an email that you send using
     * the SendEmail operation. Tags correspond to characteristics of the email that you define, so
     * that you can publish email sending events.
     */
    tags?: MessageTag

    /** The address that you want bounce and complaint notifications to be sent to. */
    feedbackForwardingEmailAddress?: string

    /**
     * This parameter is used only for sending authorization. It is the ARN of the identity that is
     * associated with the sending authorization policy that permits you to use the email address
     * specified in the `feedbackForwardingEmailAddress` parameter. For example, if the owner of
     * example.com (which has ARN `arn:aws:ses:us-east-1:123456789012:identity/example.com`)
     * attaches a policy to it that authorizes you to use feedback@example.com, then you would
     * specify the `feedbackForwardingEmailAddressIdentityArn` to be
     * `arn:aws:ses:us-east-1:123456789012:identity/example.com`, and the
     * `feedbackForwardingEmailAddress` to be feedback@example.com. For more information about
     * sending authorization, see the Amazon SES Developer Guide (https
     * docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html).
     */
    feedbackForwardingEmailAddressIdentityArn?: string

    /**
     * The email address to use as the "From" address for the email. The address that you specify
     * has to be verified.
     */
    from: string

    /**
     * This parameter is used only for sending authorization. It is the ARN of the identity that is
     * associated with the sending authorization policy that permits you to use the email address
     * specified in the `from` parameter. For example, if the owner of example.com (which has ARN
     * `arn:aws:ses:us-east-1:123456789012:identity/example.com`) attaches a policy to it that
     * authorizes you to use sender@example.com, then you would specify the `fromArn` to be
     * `arn:aws:ses:us-east-1:123456789012:identity/example.com`, and the `from` to be
     * sender@example.com. For more information about sending authorization, see the Amazon SES
     * Developer Guide (https
     * docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html). For Raw emails,
     * the `fromArn` value overrides the `X-SES-SOURCE-ARN` and `X-SES-FROM-ARN` headers specified
     * in raw email message content.
     */
    fromArn?: string

    /**
     * An object used to specify a list or topic to which an email belongs, which will be used when
     * a contact chooses to unsubscribe.
     */
    listManagementOptions?: ListManagementOptions

    /**
     * The "Reply-to" email addresses for the message. When the recipient replies to the message,
     * each Reply-to address receives the reply.
     */
    replyTo?: string[]
}

/** A unique message ID that you receive when an email is accepted for sending. */
export interface SendEmailOutput {
    /**
     * A unique identifier for the message that is generated when the message is accepted. It's
     * possible for Amazon SES to accept a message without sending it. This can happen when the
     * message that you're trying to send has an attachment contains a virus, or when you send a
     * templated email that contains invalid personalization content, for example.
     */
    messageId: string

    /** Metadata pertaining to the operation's result. */
    metaData?: {[key: string]: unknown}
}
