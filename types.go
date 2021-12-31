// Redefinition of SESV2 types with json field declarations
// Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Copyright 2014-2015 Stripe, Inc.
// Copyright 2021 Luke Zhang
// BSD-3-Clause License
package main

import "github.com/aws/smithy-go/middleware"

// An object that represents the content of the email, and optionally a character
// set specification.
type Content struct {

	// The content of the message itself.
	//
	// This member is required.
	Data *string `json:"data"`

	// The character set for the content. Because of the constraints of the SMTP
	// protocol, Amazon SES uses 7-bit ASCII by default. If the text includes
	// characters outside of the ASCII range, you have to specify a character set. For
	// example, you could specify UTF-8, ISO-8859-1, or Shift_JIS.
	Charset *string `json:"charset"`
}

// Represents the raw content of an email message.
type RawMessage struct {

	// The raw email message. The message has to meet the following criteria:
	//
	// * The
	// message has to contain a header and a body, separated by one blank line.
	//
	// * All
	// of the required header fields must be present in the message.
	//
	// * Each part of a
	// multipart MIME message must be formatted properly.
	//
	// * Attachments must be in a
	// file format that the Amazon SES supports.
	//
	// * The entire message must be Base64
	// encoded.
	//
	// * If any of the MIME parts in your message contain content that is
	// outside of the 7-bit ASCII character range, you should encode that content to
	// ensure that recipients' email clients render the message properly.
	//
	// * The length
	// of any single line of text in the message can't exceed 1,000 characters. This
	// restriction is defined in RFC 5321 (https://tools.ietf.org/html/rfc5321).
	//
	// This member is required.
	Data []byte `json:"data"`
}

// Represents the body of the email message.
type Body struct {

	// An object that represents the version of the message that is displayed in email
	// clients that support HTML. HTML messages can include formatted text, hyperlinks,
	// images, and more.
	Html *Content `json:"html"`

	// An object that represents the version of the message that is displayed in email
	// clients that don't support HTML, or clients where the recipient has disabled
	// HTML rendering.
	Text *Content `json:"text"`
}

// Represents the email message that you're sending. The Message object consists of
// a subject line and a message body.
type Message struct {

	// The body of the message. You can specify an HTML version of the message, a
	// text-only version of the message, or both.
	//
	// This member is required.
	Body *Body `json:"body"`

	// The subject line of the email. The subject line can only contain 7-bit ASCII
	// characters. However, you can specify non-ASCII characters in the subject line by
	// using encoded-word syntax, as described in RFC 2047
	// (https://tools.ietf.org/html/rfc2047).
	//
	// This member is required.
	Subject *Content `json:"subject"`
}

// An object that defines the email template to use for an email message, and the
// values to use for any message variables in that template. An email template is a
// type of message template that contains content that you want to define, save,
// and reuse in email messages that you send.
type Template struct {

	// The Amazon Resource Name (ARN) of the template.
	TemplateArn *string `json:"arn"`

	// An object that defines the values to use for message variables in the template.
	// This object is a set of key-value pairs. Each key defines a message variable in
	// the template. The corresponding value defines the value to use for that
	// variable.
	TemplateData *string `json:"data"`

	// The name of the template. You will refer to this name when you send email using
	// the SendTemplatedEmail or SendBulkTemplatedEmail operations.
	TemplateName *string `json:"name"`
}

// An object that defines the entire content of the email, including the message
// headers and the body content. You can create a simple email message, in which
// you specify the subject and the text and HTML versions of the message body. You
// can also create raw messages, in which you specify a complete MIME-formatted
// message. Raw messages can include attachments and custom headers.
type EmailContent struct {

	// Shortcut for a simple message.
	// The body of the message. You can specify an HTML version of the message, a
	// text-only version of the message, or both.
	Body *Body `json:"body"`

	// Shortcut for a simple message.
	// The subject line of the email. The subject line can only contain 7-bit ASCII
	// characters. However, you can specify non-ASCII characters in the subject line by
	// using encoded-word syntax, as described in RFC 2047
	// (https://tools.ietf.org/html/rfc2047).
	Subject *Content `json:"subject"`

	// The raw email message. The message has to meet the following criteria:
	//
	// * The
	// message has to contain a header and a body, separated by one blank line.
	//
	// * All
	// of the required header fields must be present in the message.
	//
	// * Each part of a
	// multipart MIME message must be formatted properly.
	//
	// * If you include
	// attachments, they must be in a file format that the Amazon SES API v2
	// supports.
	//
	// * The entire message must be Base64 encoded.
	//
	// * If any of the MIME
	// parts in your message contain content that is outside of the 7-bit ASCII
	// character range, you should encode that content to ensure that recipients' email
	// clients render the message properly.
	//
	// * The length of any single line of text in
	// the message can't exceed 1,000 characters. This restriction is defined in RFC
	// 5321 (https://tools.ietf.org/html/rfc5321).
	Raw *RawMessage `json:"raw"`

	// The simple email message. The message consists of a subject and a message body.
	Simple *Message `json:"simple"`

	// The template to use for the email message.
	Template *Template `json:"template"`
}

// An object that describes the recipients for an email. Amazon SES does not
// support the SMTPUTF8 extension, as described in RFC6531
// (https://tools.ietf.org/html/rfc6531). For this reason, the local part of a
// destination email address (the part of the email address that precedes the @
// sign) may only contain 7-bit ASCII characters
// (https://en.wikipedia.org/wiki/Email_address#Local-part). If the domain part of
// an address (the part after the @ sign) contains non-ASCII characters, they must
// be encoded using Punycode, as described in RFC3492
// (https://tools.ietf.org/html/rfc3492.html).
type Destination struct {

	// An array that contains the email addresses of the "BCC" (blind carbon copy)
	// recipients for the email.
	BccAddresses []string `json:"bcc"`

	// An array that contains the email addresses of the "CC" (carbon copy) recipients
	// for the email.
	CcAddresses []string `json:"cc"`

	// An array that contains the email addresses of the "To" recipients for the email.
	ToAddresses []string `json:"to"`
}

// Contains the name and value of a tag that you apply to an email. You can use
// message tags when you publish email sending events.
//
// Key: the name of the message tag. The message tag name has to meet the following
// criteria:
//
// * It can only contain ASCII letters (a–z, A–Z), numbers (0–9),
// underscores (_), or dashes (-).
//
// * It can contain no more than 256 characters.
//
// This member is required.
//
// Value: the value of the message tag. The message tag value has to meet the following
// criteria:
//
// * It can only contain ASCII letters (a–z, A–Z), numbers (0–9),
// underscores (_), or dashes (-).
//
// * It can contain no more than 256 characters.
//
// This member is required.
type MessageTag = map[string]string

// An object used to specify a list or topic to which an email belongs, which will
// be used when a contact chooses to unsubscribe.
type ListManagementOptions struct {

	// The name of the contact list.
	//
	// This member is required.
	ContactListName *string `json:"contactListName"`

	// The name of the topic.
	TopicName *string `json:"topicName"`
}

// Represents a request to send a single formatted email using Amazon SES. For more
// information, see the Amazon SES Developer Guide
// (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-email-formatted.html).
type SendEmailInput struct {

	// An object that contains the body of the message. You can send either a Simple
	// message Raw message or a template Message.
	//
	// This member is required.
	Content *EmailContent `json:"content"`

	// The name of the configuration set to use when sending the email.
	ConfigurationSetName *string `json:"configSetName"`

	// An object that contains the recipients of the email message.
	Destination *Destination `json:"dest"`

	// A list of tags, in the form of name/value pairs, to apply to an email that you
	// send using the SendEmail operation. Tags correspond to characteristics of the
	// email that you define, so that you can publish email sending events.
	EmailTags MessageTag `json:"tags"`

	// The address that you want bounce and complaint notifications to be sent to.
	FeedbackForwardingEmailAddress *string `json:"feedbackForwardingEmailAddress"`

	// This parameter is used only for sending authorization. It is the ARN of the
	// identity that is associated with the sending authorization policy that permits
	// you to use the email address specified in the FeedbackForwardingEmailAddress
	// parameter. For example, if the owner of example.com (which has ARN
	// arn:aws:ses:us-east-1:123456789012:identity/example.com) attaches a policy to it
	// that authorizes you to use feedback@example.com, then you would specify the
	// FeedbackForwardingEmailAddressIdentityArn to be
	// arn:aws:ses:us-east-1:123456789012:identity/example.com, and the
	// FeedbackForwardingEmailAddress to be feedback@example.com. For more information
	// about sending authorization, see the Amazon SES Developer Guide
	// (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html).
	FeedbackForwardingEmailAddressIdentityArn *string `json:"feedbackForwardingEmailAddressIdentityArn"`

	// The email address to use as the "From" address for the email. The address that
	// you specify has to be verified.
	FromEmailAddress *string `json:"from"`

	// This parameter is used only for sending authorization. It is the ARN of the
	// identity that is associated with the sending authorization policy that permits
	// you to use the email address specified in the FromEmailAddress parameter. For
	// example, if the owner of example.com (which has ARN
	// arn:aws:ses:us-east-1:123456789012:identity/example.com) attaches a policy to it
	// that authorizes you to use sender@example.com, then you would specify the
	// FromEmailAddressIdentityArn to be
	// arn:aws:ses:us-east-1:123456789012:identity/example.com, and the
	// FromEmailAddress to be sender@example.com. For more information about sending
	// authorization, see the Amazon SES Developer Guide
	// (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/sending-authorization.html).
	// For Raw emails, the FromEmailAddressIdentityArn value overrides the
	// X-SES-SOURCE-ARN and X-SES-FROM-ARN headers specified in raw email message
	// content.
	FromEmailAddressIdentityArn *string `json:"fromArn"`

	// An object used to specify a list or topic to which an email belongs, which will
	// be used when a contact chooses to unsubscribe.
	ListManagementOptions *ListManagementOptions `json:"listManagementOptions"`

	// The "Reply-to" email addresses for the message. When the recipient replies to
	// the message, each Reply-to address receives the reply.
	ReplyToAddresses []string `json:"replyTo"`
}

// A unique message ID that you receive when an email is accepted for sending.
type SendEmailOutput struct {

	// A unique identifier for the message that is generated when the message is
	// accepted. It's possible for Amazon SES to accept a message without sending it.
	// This can happen when the message that you're trying to send has an attachment
	// contains a virus, or when you send a templated email that contains invalid
	// personalization content, for example.
	MessageId *string `json:"messageId"`

	// Metadata pertaining to the operation's result.
	ResultMetadata middleware.Metadata `json:"metaData"`
}
