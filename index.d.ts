import { type InvokeCommandInput, type LambdaClient } from "@aws-sdk/client-lambda";
import { SendBulkEmailInput, SendBulkEmailOutput } from "./types_bulk";
import { SendEmailInput, SendEmailOutput } from "./types";
import { type ResponseMetadata } from "@aws-sdk/types";
export interface Input {
    email?: SendEmailInput;
    emails?: SendEmailInput[];
    bulkEmail?: SendBulkEmailInput;
}
export interface Output {
    email?: SendEmailOutput;
    error?: string;
    emails?: SendEmailOutput[];
    errors?: string[];
    bulkEmail?: SendBulkEmailOutput;
    bulkEmailError: string;
}
export interface InvocationResponse {
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
    payload?: Output;
    /**
     * The version of the function that executed. When you invoke a function with an alias, this
     * indicates which version the alias resolved to.
     */
    version?: string;
    /** Metadata pertaining to this request. */
    $metadata: ResponseMetadata;
}
export declare class LambdaSes {
    lambdaInstance: LambdaClient;
    functionName: string;
    constructor(lambdaInstance: LambdaClient, functionName?: string);
    invokeFunction(payload: Input, { InvocationType, LogType, ...input }?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>): Promise<InvocationResponse>;
}
