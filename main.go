// SESv2 API interavtions through AWS Lambda
// Copyright 2021 Luke Zhang
// BSD-3-Clause License
package main

import (
	"context"
	"errors"
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
	if input.Content == nil {
		return nil, errors.New("Content is required")
	} else if input.Destination == nil {
		return nil, errors.New("Destination is required")
	}

	emailTags := createEmailTags(input.EmailTags)

	functionInput := &sesv2.SendEmailInput{
		Content: &types.EmailContent{},

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

		ListManagementOptions: nil,

		ReplyToAddresses: input.ReplyToAddresses,
	}

	if input.Content.Body != nil && input.Content.Subject != nil {
		var htmlContent *types.Content
		var textContent *types.Content

		if input.Content.Body.Html != nil {
			htmlContent = &types.Content{
				Data:    input.Content.Body.Html.Data,
				Charset: input.Content.Body.Html.Charset,
			}
		} else if input.Content.Body.Text != nil {
			textContent = &types.Content{
				Data:    input.Content.Body.Text.Data,
				Charset: input.Content.Body.Text.Charset,
			}
		}

		functionInput.Content.Simple = &types.Message{
			Body: &types.Body{
				Html: htmlContent,
				Text: textContent,
			},
			Subject: &types.Content{
				Data:    input.Content.Subject.Data,
				Charset: input.Content.Subject.Charset,
			},
		}
	} else if input.Content.Simple != nil && input.Content.Simple.Body != nil && input.Content.Simple.Subject != nil {
		var htmlContent *types.Content
		var textContent *types.Content

		if input.Content.Simple.Body.Html != nil {
			htmlContent = &types.Content{
				Data:    input.Content.Simple.Body.Html.Data,
				Charset: input.Content.Simple.Body.Html.Charset,
			}
		} else if input.Content.Simple.Body.Text != nil {
			textContent = &types.Content{
				Data:    input.Content.Simple.Body.Text.Data,
				Charset: input.Content.Simple.Body.Text.Charset,
			}
		}

		functionInput.Content.Simple = &types.Message{
			Body: &types.Body{
				Html: htmlContent,
				Text: textContent,
			},
			Subject: &types.Content{
				Data:    input.Content.Simple.Subject.Data,
				Charset: input.Content.Simple.Subject.Charset,
			},
		}
	}

	if input.Content.Raw != nil {
		functionInput.Content.Raw = &types.RawMessage{
			Data: input.Content.Raw.Data,
		}
	}

	if input.Content.Template != nil {
		functionInput.Content.Template = &types.Template{
			TemplateArn:  input.Content.Template.TemplateArn,
			TemplateData: input.Content.Template.TemplateData,
			TemplateName: input.Content.Template.TemplateName,
		}
	}

	if input.ListManagementOptions != nil {
		functionInput.ListManagementOptions = &types.ListManagementOptions{
			ContactListName: input.ListManagementOptions.ContactListName,
			TopicName:       input.ListManagementOptions.TopicName,
		}
	}

	return ses.SendEmail(ctx, functionInput)
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

		if entry.Destination == nil {
			return nil, errors.New("Destination is required")
		}

		functionInput := &types.BulkEmailEntry{
			Destination: &types.Destination{
				BccAddresses: entry.Destination.BccAddresses,
				CcAddresses:  entry.Destination.CcAddresses,
				ToAddresses:  entry.Destination.ToAddresses,
			},

			ReplacementEmailContent: nil,

			ReplacementTags: replacementEmailTags,
		}

		if entry.ReplacementEmailContent != nil &&
			entry.ReplacementEmailContent.ReplacementTemplate != nil &&
			entry.ReplacementEmailContent.ReplacementTemplate.ReplacementTemplateData != nil {

			functionInput.ReplacementEmailContent = &types.ReplacementEmailContent{
				ReplacementTemplate: &types.ReplacementTemplate{
					ReplacementTemplateData: entry.ReplacementEmailContent.ReplacementTemplate.ReplacementTemplateData,
				},
			}
		}

		bulkEmailEntries = append(bulkEmailEntries, *functionInput)
	}

	defaultEmailTags := createEmailTags(input.DefaultEmailTags)

	functionInput := &sesv2.SendBulkEmailInput{
		BulkEmailEntries: bulkEmailEntries,

		DefaultContent: &types.BulkEmailContent{},

		ConfigurationSetName:                      input.ConfigurationSetName,
		DefaultEmailTags:                          defaultEmailTags,
		FeedbackForwardingEmailAddress:            input.FeedbackForwardingEmailAddress,
		FeedbackForwardingEmailAddressIdentityArn: input.FeedbackForwardingEmailAddressIdentityArn,
		FromEmailAddress:                          input.FeedbackForwardingEmailAddress,
		FromEmailAddressIdentityArn:               input.FromEmailAddressIdentityArn,
		ReplyToAddresses:                          input.ReplyToAddresses,
	}
	if input.DefaultContent != nil && input.DefaultContent.Template != nil {
		functionInput.DefaultContent.Template = &types.Template{
			TemplateArn:  input.DefaultContent.Template.TemplateArn,
			TemplateData: input.DefaultContent.Template.TemplateData,
			TemplateName: input.DefaultContent.Template.TemplateName,
		}
	}

	return ses.SendBulkEmail(context.TODO(), functionInput)
}

type HandlerInput struct {
	Email     *SendEmailInput     `json:"email"`
	Emails    []*SendEmailInput   `json:"emails"`
	BulkEmail *SendBulkEmailInput `json:"bulkEmail"`
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
	if output == nil {
		return &SendEmailOutput{}
	}

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
