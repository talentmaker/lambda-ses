/**
 * Node JS Client for Lambda-SES
 *
 * @license BSD-3-Clause
 * @copyright 2021 - 2022 Luke Zhang
 */
import { type InvokeCommandInput, LambdaClient, InvokeCommandOutput } from "@aws-sdk/client-lambda";
import { SendBulkEmailInput, SendBulkEmailOutput } from "./types_bulk";
import { SendEmailInput, SendEmailOutput } from "./types";
import { type ResponseMetadata } from "@aws-sdk/types";
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
    email?: SendEmailInput;
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
    emails?: SendEmailInput[];
    /** Send bulk emails with a AWS SES template */
    bulkEmail?: SendBulkEmailInput;
}
export interface EmailOutput {
    email: SendEmailOutput | null;
    error: string | null;
}
export interface EmailsOutput {
    emails: SendEmailOutput[] | null;
    errors: string[] | null;
}
export interface BulkEmailOutput {
    bulkEmail: SendBulkEmailOutput | null;
    bulkEmailError: string | null;
}
export interface Output extends EmailOutput, EmailsOutput, BulkEmailOutput {
}
export interface InvocationResponse<_Output extends EmailOutput | EmailsOutput | BulkEmailOutput | Output = Output> {
    /**
     * The HTTP status code is in the 200 range for a successful request. For the `RequestResponse`
     * invocation type, this status code is 200. For the `Event` invocation type, this status code
     * is 202. For the `DryRun` invocation type, the status code is 204.
     */
    status?: number;
    /**
     * If present, indicates that an error occurred during function execution. Details about the
     * error are included in the response payload.
     */
    error?: string;
    /** The last 4 KB of the execution log, which is base64 encoded. */
    logs?: string;
    /** The response from the function, or an error object. */
    payload?: _Output | {
        errorMessage: string;
        errorType: string;
    };
    /**
     * The version of the function that executed. When you invoke a function with an alias, this
     * indicates which version the alias resolved to.
     */
    version?: string;
    /** Metadata pertaining to this request. */
    $metadata: ResponseMetadata;
}
export declare class LambdaSesError extends Error implements InvocationResponse {
    readonly name = "LambdaSesError";
    readonly payload: {
        errorMessage: string;
        errorType: string;
    };
    readonly status?: number;
    readonly error?: string;
    readonly logs?: string;
    readonly version?: string;
    readonly $metadata: ResponseMetadata;
    constructor(result: InvokeCommandOutput);
}
export declare class LambdaSes {
    lambdaInstance: LambdaClient;
    functionName: string;
    constructor(lambdaInstance: LambdaClient, functionName?: string);
    /** Use AWS SES to an email(s) */
    send(payload: Input, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: false): Promise<InvocationResponse & {
        error: undefined;
        payload: Output;
    }>;
    /** Use AWS SES to an email(s) */
    send(payload: Input, params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">> | undefined, throwError: true): Promise<InvocationResponse>;
    send(payload: Input, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: boolean): Promise<typeof throwError extends true ? InvocationResponse : InvocationResponse & {
        error: undefined;
        payload: Output;
    }>;
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
    sendEmail(payload: Exclude<Input["email"], undefined>, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: false): Promise<InvocationResponse<EmailOutput> & {
        error: undefined;
        payload: Output;
    }>;
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
    sendEmail(payload: Exclude<Input["email"], undefined>, params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError: true): Promise<InvocationResponse<EmailOutput>>;
    sendEmail(payload: Exclude<Input["email"], undefined>, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: boolean): Promise<typeof throwError extends true ? InvocationResponse<EmailOutput> : InvocationResponse<EmailOutput> & {
        error: undefined;
        payload: Output;
    }>;
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
    sendEmails(payload: Exclude<Input["emails"], undefined>, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: false): Promise<InvocationResponse<EmailsOutput> & {
        error: undefined;
        payload: Output;
    }>;
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
    sendEmails(payload: Exclude<Input["emails"], undefined>, params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError: true): Promise<InvocationResponse<EmailsOutput>>;
    sendEmails(payload: Exclude<Input["emails"], undefined>, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: boolean): Promise<typeof throwError extends true ? InvocationResponse<EmailsOutput> : InvocationResponse<EmailsOutput> & {
        error: undefined;
        payload: Output;
    }>;
    /** Send bulk emails with a AWS SES template */
    sendBulkEmail(payload: Exclude<Input["bulkEmail"], undefined>, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: false): Promise<InvocationResponse<BulkEmailOutput> & {
        error: undefined;
        payload: Output;
    }>;
    /** Send bulk emails with a AWS SES template */
    sendBulkEmail(payload: Exclude<Input["bulkEmail"], undefined>, params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError: true): Promise<InvocationResponse<BulkEmailOutput>>;
    sendBulkEmail(payload: Exclude<Input["bulkEmail"], undefined>, params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>, throwError?: boolean): Promise<typeof throwError extends true ? InvocationResponse<BulkEmailOutput> : InvocationResponse<BulkEmailOutput> & {
        error: undefined;
        payload: Output;
    }>;
}
export default LambdaSes;
