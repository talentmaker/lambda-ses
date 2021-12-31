// SESv2 API interavtions through AWS Lambda
// Copyright 2021 Luke Zhang
// BSD-3-Clause License
package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	sesv2 "github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"

	_ "github.com/joho/godotenv/autoload"
)

var ses *sesv2.Client

type Test struct {
	ConfigurationSetName *string
}

func createEmailTags(inputTags MessageTag) []types.MessageTag {
	var emailTags []types.MessageTag

	for key, value := range inputTags {
		emailTags = append(emailTags, types.MessageTag{
			Name:  aws.String(key),
			Value: aws.String(value),
		})
	}

	return emailTags
}

func sendEmailWithContext(ctx context.Context, input *SendEmailInput) (*sesv2.SendEmailOutput, error) {
	emailTags := createEmailTags(input.EmailTags)

	var simpleMessage types.Message

	if input.Content.Body != nil && input.Content.Subject != nil {
		simpleMessage = types.Message{
			Body: &types.Body{
				Html: &types.Content{
					Data:    input.Content.Body.Html.Data,
					Charset: input.Content.Body.Html.Charset,
				},
				Text: &types.Content{
					Data:    input.Content.Body.Text.Data,
					Charset: input.Content.Body.Text.Charset,
				},
			},
			Subject: &types.Content{
				Data:    input.Content.Subject.Data,
				Charset: input.Content.Subject.Charset,
			},
		}
	} else {
		simpleMessage = types.Message{
			Body: &types.Body{
				Html: &types.Content{
					Data:    input.Content.Simple.Body.Html.Data,
					Charset: input.Content.Simple.Body.Html.Charset,
				},
				Text: &types.Content{
					Data:    input.Content.Simple.Body.Text.Data,
					Charset: input.Content.Simple.Body.Text.Charset,
				},
			},
			Subject: &types.Content{
				Data:    input.Content.Simple.Subject.Data,
				Charset: input.Content.Simple.Subject.Charset,
			},
		}
	}

	return ses.SendEmail(ctx, &sesv2.SendEmailInput{
		Content: &types.EmailContent{
			Raw: &types.RawMessage{
				Data: input.Content.Raw.Data,
			},
			Simple: &simpleMessage,
			Template: &types.Template{
				TemplateArn:  input.Content.Template.TemplateArn,
				TemplateData: input.Content.Template.TemplateData,
				TemplateName: input.Content.Template.TemplateName,
			},
		},

		ConfigurationSetName: input.ConfigurationSetName,

		Destination: &types.Destination{
			BccAddresses: input.Destination.BccAddresses,
			CcAddresses:  input.Destination.CcAddresses,
			ToAddresses:  input.Destination.ToAddresses,
		},

		EmailTags:                                 emailTags,
		FeedbackForwardingEmailAddress:            input.FeedbackForwardingEmailAddress,
		FeedbackForwardingEmailAddressIdentityArn: input.FeedbackForwardingEmailAddressIdentityArn,
		FromEmailAddress:                          input.FromEmailAddress,
		FromEmailAddressIdentityArn:               input.FromEmailAddressIdentityArn,

		ListManagementOptions: &types.ListManagementOptions{
			ContactListName: input.ListManagementOptions.ContactListName,
			TopicName:       input.ListManagementOptions.TopicName,
		},

		ReplyToAddresses: input.ReplyToAddresses,
	})
}

func sendEmail(input *SendEmailInput) (*sesv2.SendEmailOutput, error) {
	return sendEmailWithContext(context.TODO(), input)
}

func sendEmails(inputs []*SendEmailInput) ([]*sesv2.SendEmailOutput, []error) {
	var outputs []*sesv2.SendEmailOutput
	var errors []error
	currentContext := context.TODO()

	for _, input := range inputs {
		output, err := sendEmailWithContext(currentContext, input)

		if err == nil {
			outputs = append(outputs, output)
		} else {
			errors = append(errors, err)
		}
	}

	return outputs, errors
}

func sendBulkEmail(input *SendBulkEmailInput) (*sesv2.SendBulkEmailOutput, error) {
	var bulkEmailEntries []types.BulkEmailEntry

	for _, entry := range input.BulkEmailEntries {
		replacementEmailTags := createEmailTags(entry.ReplacementTags)

		bulkEmailEntries = append(bulkEmailEntries, types.BulkEmailEntry{
			Destination: &types.Destination{
				BccAddresses: entry.Destination.BccAddresses,
				CcAddresses:  entry.Destination.CcAddresses,
				ToAddresses:  entry.Destination.ToAddresses,
			},

			ReplacementEmailContent: &types.ReplacementEmailContent{
				ReplacementTemplate: &types.ReplacementTemplate{
					ReplacementTemplateData: entry.ReplacementEmailContent.ReplacementTemplate.ReplacementTemplateData,
				},
			},

			ReplacementTags: replacementEmailTags,
		})
	}

	defaultEmailTags := createEmailTags(input.DefaultEmailTags)

	return ses.SendBulkEmail(context.TODO(), &sesv2.SendBulkEmailInput{
		BulkEmailEntries: bulkEmailEntries,

		DefaultContent: &types.BulkEmailContent{
			Template: &types.Template{
				TemplateArn:  input.DefaultContent.Template.TemplateArn,
				TemplateData: input.DefaultContent.Template.TemplateData,
				TemplateName: input.DefaultContent.Template.TemplateName,
			},
		},

		ConfigurationSetName:                      input.ConfigurationSetName,
		DefaultEmailTags:                          defaultEmailTags,
		FeedbackForwardingEmailAddress:            input.FeedbackForwardingEmailAddress,
		FeedbackForwardingEmailAddressIdentityArn: input.FeedbackForwardingEmailAddressIdentityArn,
		FromEmailAddress:                          input.FeedbackForwardingEmailAddress,
		FromEmailAddressIdentityArn:               input.FromEmailAddressIdentityArn,
		ReplyToAddresses:                          input.ReplyToAddresses,
	})
}

type HandlerInput struct {
	Email     *SendEmailInput
	Emails    []*SendEmailInput
	BulkEmail *SendBulkEmailInput
}

type HandlerOutput struct {
	Email          *SendEmailOutput     `json:"email"`
	EmailError     error                `json:"error"`
	Emails         []*SendEmailOutput   `json:"emails"`
	EmailsErrors   []error              `json:"errors"`
	BulkEmail      *SendBulkEmailOutput `json:"bulkEmail"`
	BulkEmailError error                `json:"bulkEmailError"`
}

func convertSendEmailOutput(output *sesv2.SendEmailOutput) *SendEmailOutput {
	return &SendEmailOutput{
		MessageId:      output.MessageId,
		ResultMetadata: output.ResultMetadata,
	}
}

func LambdaHandler(event HandlerInput) (HandlerOutput, error) {
	if event.Email != nil {
		output, err := sendEmail(event.Email)
		convertedOutput := convertSendEmailOutput(output)

		return HandlerOutput{
			Email:      convertedOutput,
			EmailError: err,
		}, err
	} else if len(event.Emails) > 0 {
		output, errs := sendEmails(event.Emails)
		var convertedOutput []*SendEmailOutput

		for _, arrayItem := range output {
			convertedOutput = append(convertedOutput, convertSendEmailOutput(arrayItem))
		}

		if len(errs) == 0 {
			return HandlerOutput{
				Emails: convertedOutput,
			}, nil
		} else {
			return HandlerOutput{
				Emails:       convertedOutput,
				EmailsErrors: errs,
			}, nil
		}
	} else if event.BulkEmail != nil {
		output, err := sendBulkEmail(event.BulkEmail)
		var bulkEmailEntryResults []BulkEmailEntryResult

		for _, arrayItem := range output.BulkEmailEntryResults {
			bulkEmailEntryResults = append(bulkEmailEntryResults, BulkEmailEntryResult{
				Error:     arrayItem.Error,
				MessageId: arrayItem.MessageId,
				Status:    BulkEmailStatus(arrayItem.Status),
			})
		}

		convertedOutput := &SendBulkEmailOutput{
			BulkEmailEntryResults: bulkEmailEntryResults,
			ResultMetadata:        output.ResultMetadata,
		}

		return HandlerOutput{
			BulkEmail:      convertedOutput,
			BulkEmailError: err,
		}, err
	}

	return HandlerOutput{}, nil
}

func main() {
	cfg, err := config.LoadDefaultConfig(context.TODO())

	if err != nil {
		log.Fatalf("failed to load configuration, %v", err)
	}

	ses = sesv2.New(sesv2.Options{
		Region:      cfg.Region,
		Credentials: cfg.Credentials,
	})

	lambda.Start(LambdaHandler)
}
