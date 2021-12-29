// Redefinition of SESV2 types with json field declarations
// Copyright 2021 Luke Zhang
// BSD-3-Clause License
package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	sesv2 "github.com/aws/aws-sdk-go-v2/service/sesv2"

	_ "github.com/joho/godotenv/autoload"
)

var ses *sesv2.Client

type Test struct {
	ConfigurationSetName *string
}

func sendEmail(input *sesv2.SendEmailInput) (*sesv2.SendEmailOutput, error) {
	return ses.SendEmail(context.TODO(), input)
}

func sendEmails(inputs []*sesv2.SendEmailInput) ([]*sesv2.SendEmailOutput, []error) {
	var outputs []*sesv2.SendEmailOutput
	var errors []error
	currentContext := context.TODO()

	for _, input := range inputs {
		output, err := ses.SendEmail(currentContext, input)

		if err == nil {
			outputs = append(outputs, output)
		} else {
			errors = append(errors, err)
		}
	}

	return outputs, errors
}

func sendBulkEmail(input *sesv2.SendBulkEmailInput) (*sesv2.SendBulkEmailOutput, error) {
	return ses.SendBulkEmail(context.TODO(), input)
}

type HandlerInput struct {
	Email     *sesv2.SendEmailInput
	Emails    []*sesv2.SendEmailInput
	BulkEmail *sesv2.SendBulkEmailInput
}

type HandlerOutput struct {
	Email          *sesv2.SendEmailOutput
	EmailError     error
	Emails         []*sesv2.SendEmailOutput
	EmailsErrors   []error
	BulkEmail      *sesv2.SendBulkEmailOutput
	BulkEmailError error
}

func LambdaHandler(event HandlerInput) (HandlerOutput, error) {
	if event.Email != nil {
		output, err := sendEmail(event.Email)

		return HandlerOutput{
			Email:      output,
			EmailError: err,
		}, err
	} else if len(event.Emails) > 0 {
		output, errs := sendEmails(event.Emails)

		if len(errs) == 0 {
			return HandlerOutput{
				Emails: output,
			}, nil
		} else {
			return HandlerOutput{
				Emails:       output,
				EmailsErrors: errs,
			}, nil
		}
	} else if event.BulkEmail != nil {
		output, err := sendBulkEmail(event.BulkEmail)

		return HandlerOutput{
			BulkEmail:      output,
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
