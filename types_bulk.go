// Redefinition of SESV2 types with json field declarations
// Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Copyright 2014-2015 Stripe, Inc.
// Copyright 2021 - 2022 Luke Zhang
// BSD-3-Clause License
package main

import "github.com/aws/smithy-go/middleware"

type BulkEmailStatus string

// An object which contains ReplacementTemplateData to be used for a specific
// BulkEmailEntry.
type ReplacementTemplate struct {

	// A list of replacement values to apply to the template. This parameter is a JSON
	// object, typically consisting of key-value pairs in which the keys correspond to
	// replacement tags in the email template.
	ReplacementTemplateData *string `json:"data"`
}

// The ReplaceEmailContent object to be used for a specific BulkEmailEntry. The
// ReplacementTemplate can be specified within this object.
type ReplacementEmailContent struct {

	// The ReplacementTemplate associated with ReplacementEmailContent.
	ReplacementTemplate *ReplacementTemplate `json:"replacementTemplate"`
}

type BulkEmailEntry struct {

	// Represents the destination of the message, consisting of To:, CC:, and BCC:
	// fields. Amazon SES does not support the SMTPUTF8 extension, as described in
	// RFC6531 (https://tools.ietf.org/html/rfc6531). For this reason, the local part
	// of a destination email address (the part of the email address that precedes the
	// @ sign) may only contain 7-bit ASCII characters
	// (https://en.wikipedia.org/wiki/Email_address#Local-part). If the domain part of
	// an address (the part after the @ sign) contains non-ASCII characters, they must
	// be encoded using Punycode, as described in RFC3492
	// (https://tools.ietf.org/html/rfc3492.html).
	//
	// This member is required.
	Destination *Destination `json:"destination"`

	// The ReplacementEmailContent associated with a BulkEmailEntry.
	ReplacementEmailContent *ReplacementEmailContent `json:"content"`

	// A list of tags, in the form of name/value pairs, to apply to an email that you
	// send using the SendBulkTemplatedEmail operation. Tags correspond to
	// characteristics of the email that you define, so that you can publish email
	// sending events.
	ReplacementTags MessageTag `json:"tags"`
}

// An object that contains the body of the message. You can specify a template
// message.
type BulkEmailContent struct {

	// The template to use for the bulk email message.
	Template *Template `json:"temaplte"`
}

// Represents a request to send email messages to multiple destinations using
// Amazon SES. For more information, see the Amazon SES Developer Guide
// (https://docs.aws.amazon.com/ses/latest/DeveloperGuide/send-personalized-email-api.html).
type SendBulkEmailInput struct {

	// The list of bulk email entry objects.
	//
	// This member is required.
	BulkEmailEntries []BulkEmailEntry `json:"entries"`

	// An object that contains the body of the message. You can specify a template
	// message.
	//
	// This member is required.
	DefaultContent *BulkEmailContent `json:"defaultContent"`

	// The name of the configuration set to use when sending the email.
	ConfigurationSetName *string `json:"configSetName"`

	// A list of tags, in the form of name/value pairs, to apply to an email that you
	// send using the SendEmail operation. Tags correspond to characteristics of the
	// email that you define, so that you can publish email sending events.
	DefaultEmailTags MessageTag `json:"defaultTags"`

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
	FromEmailAddressIdentityArn *string `json:"fromarn"`

	// The "Reply-to" email addresses for the message. When the recipient replies to
	// the message, each Reply-to address receives the reply.
	ReplyToAddresses []string `json:"replyTo"`
}

// The result of the SendBulkEmail operation of each specified BulkEmailEntry.
type BulkEmailEntryResult struct {

	// A description of an error that prevented a message being sent using the
	// SendBulkTemplatedEmail operation.
	Error *string `json:"error"`

	// The unique message identifier returned from the SendBulkTemplatedEmail
	// operation.
	MessageId *string `json:"messageId"`

	// The status of a message sent using the SendBulkTemplatedEmail operation.
	// Possible values for this parameter include:
	//
	// * SUCCESS: Amazon SES accepted the
	// message, and will attempt to deliver it to the recipients.
	//
	// * MESSAGE_REJECTED:
	// The message was rejected because it contained a virus.
	//
	// *
	// MAIL_FROM_DOMAIN_NOT_VERIFIED: The sender's email address or domain was not
	// verified.
	//
	// * CONFIGURATION_SET_DOES_NOT_EXIST: The configuration set you
	// specified does not exist.
	//
	// * TEMPLATE_DOES_NOT_EXIST: The template you specified
	// does not exist.
	//
	// * ACCOUNT_SUSPENDED: Your account has been shut down because of
	// issues related to your email sending practices.
	//
	// * ACCOUNT_THROTTLED: The number
	// of emails you can send has been reduced because your account has exceeded its
	// allocated sending limit.
	//
	// * ACCOUNT_DAILY_QUOTA_EXCEEDED: You have reached or
	// exceeded the maximum number of emails you can send from your account in a
	// 24-hour period.
	//
	// * INVALID_SENDING_POOL_NAME: The configuration set you
	// specified refers to an IP pool that does not exist.
	//
	// * ACCOUNT_SENDING_PAUSED:
	// Email sending for the Amazon SES account was disabled using the
	// UpdateAccountSendingEnabled
	// (https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateAccountSendingEnabled.html)
	// operation.
	//
	// * CONFIGURATION_SET_SENDING_PAUSED: Email sending for this
	// configuration set was disabled using the UpdateConfigurationSetSendingEnabled
	// (https://docs.aws.amazon.com/ses/latest/APIReference/API_UpdateConfigurationSetSendingEnabled.html)
	// operation.
	//
	// * INVALID_PARAMETER_VALUE: One or more of the parameters you
	// specified when calling this operation was invalid. See the error message for
	// additional information.
	//
	// * TRANSIENT_FAILURE: Amazon SES was unable to process
	// your request because of a temporary issue.
	//
	// * FAILED: Amazon SES was unable to
	// process your request. See the error message for additional information.
	Status BulkEmailStatus `json:"status"`
}

// The following data is returned in JSON format by the service.
type SendBulkEmailOutput struct {

	// One object per intended recipient. Check each response object and retry any
	// messages with a failure status.
	//
	// This member is required.
	BulkEmailEntryResults []BulkEmailEntryResult `json:"result"`

	// Metadata pertaining to the operation's result.
	ResultMetadata middleware.Metadata `json:"metaData"`
}
