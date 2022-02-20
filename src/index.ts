/**
 * Node JS Client for Lambda-SES
 *
 * @license BSD-3-Clause
 * @copyright 2021 - 2022 Luke Zhang
 */

import {
    InvocationType as InvocationTypes,
    type InvokeCommandInput,
    LambdaClient,
    LogType as LogTypes,
    InvokeCommand,
    InvokeCommandOutput,
} from "@aws-sdk/client-lambda"
import {SendBulkEmailInput, SendBulkEmailOutput} from "./types_bulk"
import {SendEmailInput, SendEmailOutput} from "./types"
import {type ResponseMetadata} from "@aws-sdk/types"

export interface Input {
    /**
     * Send a single email
     *
     * @example
     *
     * ```ts
     * lambdaSes.send({
     *     email: {
     *         from: "luke_zhang_04@protonmail.com",
     *         dest: {
     *             to: ["luke_zhang_04@protonmail.com"],
     *         },
     *         content: {
     *             simple: {
     *                 body: {
     *                     html: {
     *                         charset: "UTF-8",
     *                         data: "<h1>Hello!</h1><br/><p>This is a message</p>",
     *                     },
     *                 },
     *                 subject: {
     *                     charset: "UTF-8",
     *                     data: "no",
     *                 },
     *             },
     *         },
     *     },
     * })
     * ```
     */
    email?: SendEmailInput

    /**
     * Send multiple emails
     *
     * @example
     *
     * ```ts
     * lambdaSes.send({
     *     emails: [{
     *         from: "luke_zhang_04@protonmail.com",
     *         dest: {
     *             to: ["luke_zhang_04@protonmail.com"],
     *         },
     *         content: {
     *             simple: {
     *                 body: {
     *                     html: {
     *                         charset: "UTF-8",
     *                         data: "<h1>Hello!</h1><br/><p>This is a message</p>",
     *                     },
     *                 },
     *                 subject: {
     *                     charset: "UTF-8",
     *                     data: "no",
     *                 },
     *             },
     *         },
     *     },
     * }])
     * ```
     */
    emails?: SendEmailInput[]

    /** Send bulk emails with a AWS SES template */
    bulkEmail?: SendBulkEmailInput
}

export interface EmailOutput {
    email: SendEmailOutput | null
    error: string | null
}

export interface EmailsOutput {
    emails: SendEmailOutput[] | null
    errors: string[] | null
}

export interface BulkEmailOutput {
    bulkEmail: SendBulkEmailOutput | null
    bulkEmailError: string | null
}

export interface Output extends EmailOutput, EmailsOutput, BulkEmailOutput {}

export interface InvocationResponse<
    _Output extends EmailOutput | EmailsOutput | BulkEmailOutput | Output = Output,
> {
    /**
     * The HTTP status code is in the 200 range for a successful request. For the `RequestResponse`
     * invocation type, this status code is 200. For the `Event` invocation type, this status code
     * is 202. For the `DryRun` invocation type, the status code is 204.
     */
    status?: number

    /**
     * If present, indicates that an error occurred during function execution. Details about the
     * error are included in the response payload.
     */
    error?: string

    /** The last 4 KB of the execution log, which is base64 encoded. */
    logs?: string

    /** The response from the function, or an error object. */
    payload?:
        | _Output
        | {
              errorMessage: string
              errorType: string
          }

    /**
     * The version of the function that executed. When you invoke a function with an alias, this
     * indicates which version the alias resolved to.
     */
    version?: string

    /** Metadata pertaining to this request. */
    $metadata: ResponseMetadata
}

export class LambdaSesError extends Error implements InvocationResponse {
    public readonly name = "LambdaSesError"
    public readonly payload: {
        errorMessage: string
        errorType: string
    }
    public readonly status?: number
    public readonly error?: string
    public readonly logs?: string
    public readonly version?: string
    public readonly $metadata: ResponseMetadata

    public constructor(result: InvokeCommandOutput) {
        super()

        this.payload = JSON.parse(new TextDecoder().decode(result.Payload)) as {
            errorMessage: string
            errorType: string
        }

        if (result.Payload) {
            this.message = `${this.payload.errorType}: ${this.payload.errorMessage}`
        }

        this.status = result.StatusCode
        this.error = result.FunctionError
        this.logs = result.LogResult
            ? Buffer.from(result.LogResult, "base64").toString("utf-8")
            : undefined
        this.version = result.ExecutedVersion
        this.$metadata = result.$metadata
    }
}

export class LambdaSes {
    public constructor(public lambdaInstance: LambdaClient, public functionName = "lambda-ses") {}

    /** Use AWS SES to an email(s) */
    public async send(
        payload: Input,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: false,
    ): Promise<InvocationResponse & {error: undefined; payload: Output}>

    /** Use AWS SES to an email(s) */
    public async send(
        payload: Input,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">> | undefined,
        throwError: true,
    ): Promise<InvocationResponse>

    public async send(
        payload: Input,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: boolean,
    ): Promise<
        typeof throwError extends true
            ? InvocationResponse
            : InvocationResponse & {error: undefined; payload: Output}
    >

    public async send(
        payload: Input,
        {
            InvocationType,
            LogType,
            ...input
        }: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">> = {},
        throwError = false,
    ): Promise<InvocationResponse> {
        const config = new InvokeCommand({
            FunctionName: this.functionName,
            InvocationType: InvocationType ?? InvocationTypes.RequestResponse,
            LogType: LogType ?? LogTypes.Tail,
            Payload: new Uint8Array(Buffer.from(JSON.stringify(payload))),
            ...input,
        })

        const result = await this.lambdaInstance.send(config)

        const resultPayload = result.Payload ? new TextDecoder().decode(result.Payload) : undefined

        if (result.FunctionError && throwError) {
            throw new LambdaSesError(result)
        }

        return {
            status: result.StatusCode,
            error: result.FunctionError,
            logs: result.LogResult
                ? Buffer.from(result.LogResult, "base64").toString("utf-8")
                : undefined,
            payload: resultPayload ? (JSON.parse(resultPayload) as Output) : undefined,
            version: result.ExecutedVersion,
            $metadata: result.$metadata,
        }
    }

    /**
     * Send a single email
     *
     * @example
     *
     * ```ts
     * lambdaSes.send({
     *     email: {
     *         from: "luke_zhang_04@protonmail.com",
     *         dest: {
     *             to: ["luke_zhang_04@protonmail.com"],
     *         },
     *         content: {
     *             simple: {
     *                 body: {
     *                     html: {
     *                         charset: "UTF-8",
     *                         data: "<h1>Hello!</h1><br/><p>This is a message</p>",
     *                     },
     *                 },
     *                 subject: {
     *                     charset: "UTF-8",
     *                     data: "no",
     *                 },
     *             },
     *         },
     *     },
     * })
     * ```
     */
    public async sendEmail(
        payload: Exclude<Input["email"], undefined>,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: false,
    ): Promise<InvocationResponse<EmailOutput> & {error: undefined; payload: Output}>

    /**
     * Send a single email
     *
     * @example
     *
     * ```ts
     * lambdaSes.send({
     *     email: {
     *         from: "luke_zhang_04@protonmail.com",
     *         dest: {
     *             to: ["luke_zhang_04@protonmail.com"],
     *         },
     *         content: {
     *             simple: {
     *                 body: {
     *                     html: {
     *                         charset: "UTF-8",
     *                         data: "<h1>Hello!</h1><br/><p>This is a message</p>",
     *                     },
     *                 },
     *                 subject: {
     *                     charset: "UTF-8",
     *                     data: "no",
     *                 },
     *             },
     *         },
     *     },
     * })
     * ```
     */
    public async sendEmail(
        payload: Exclude<Input["email"], undefined>,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError: true,
    ): Promise<InvocationResponse<EmailOutput>>

    public async sendEmail(
        payload: Exclude<Input["email"], undefined>,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: boolean,
    ): Promise<
        typeof throwError extends true
            ? InvocationResponse<EmailOutput>
            : InvocationResponse<EmailOutput> & {error: undefined; payload: Output}
    >

    public async sendEmail(
        payload: Exclude<Input["email"], undefined>,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">> = {},
        throwError = false,
    ): Promise<InvocationResponse<EmailOutput>> {
        return await this.send({email: payload}, params, throwError)
    }

    /**
     * Send multiple emails
     *
     * @example
     *
     * ```ts
     * lambdaSes.send({
     *     emails: [{
     *         from: "luke_zhang_04@protonmail.com",
     *         dest: {
     *             to: ["luke_zhang_04@protonmail.com"],
     *         },
     *         content: {
     *             simple: {
     *                 body: {
     *                     html: {
     *                         charset: "UTF-8",
     *                         data: "<h1>Hello!</h1><br/><p>This is a message</p>",
     *                     },
     *                 },
     *                 subject: {
     *                     charset: "UTF-8",
     *                     data: "no",
     *                 },
     *             },
     *         },
     *     },
     * }])
     * ```
     */
    public async sendEmails(
        payload: Exclude<Input["emails"], undefined>,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: false,
    ): Promise<InvocationResponse<EmailsOutput> & {error: undefined; payload: Output}>

    /**
     * Send multiple emails
     *
     * @example
     *
     * ```ts
     * lambdaSes.send({
     *     emails: [{
     *         from: "luke_zhang_04@protonmail.com",
     *         dest: {
     *             to: ["luke_zhang_04@protonmail.com"],
     *         },
     *         content: {
     *             simple: {
     *                 body: {
     *                     html: {
     *                         charset: "UTF-8",
     *                         data: "<h1>Hello!</h1><br/><p>This is a message</p>",
     *                     },
     *                 },
     *                 subject: {
     *                     charset: "UTF-8",
     *                     data: "no",
     *                 },
     *             },
     *         },
     *     },
     * }])
     * ```
     */
    public async sendEmails(
        payload: Exclude<Input["emails"], undefined>,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError: true,
    ): Promise<InvocationResponse<EmailsOutput>>

    public async sendEmails(
        payload: Exclude<Input["emails"], undefined>,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: boolean,
    ): Promise<
        typeof throwError extends true
            ? InvocationResponse<EmailsOutput>
            : InvocationResponse<EmailsOutput> & {error: undefined; payload: Output}
    >

    public async sendEmails(
        payload: Exclude<Input["emails"], undefined>,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">> = {},
        throwError = false,
    ): Promise<InvocationResponse<EmailsOutput>> {
        return await this.send({emails: payload}, params, throwError)
    }

    /** Send bulk emails with a AWS SES template */
    public async sendBulkEmail(
        payload: Exclude<Input["bulkEmail"], undefined>,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: false,
    ): Promise<InvocationResponse<BulkEmailOutput> & {error: undefined; payload: Output}>

    /** Send bulk emails with a AWS SES template */
    public async sendBulkEmail(
        payload: Exclude<Input["bulkEmail"], undefined>,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError: true,
    ): Promise<InvocationResponse<BulkEmailOutput>>

    public async sendBulkEmail(
        payload: Exclude<Input["bulkEmail"], undefined>,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: boolean,
    ): Promise<
        typeof throwError extends true
            ? InvocationResponse<BulkEmailOutput>
            : InvocationResponse<BulkEmailOutput> & {error: undefined; payload: Output}
    >

    public async sendBulkEmail(
        payload: Exclude<Input["bulkEmail"], undefined>,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">> = {},
        throwError = false,
    ): Promise<InvocationResponse<BulkEmailOutput>> {
        return await this.send({bulkEmail: payload}, params, throwError)
    }
}

export default LambdaSes
