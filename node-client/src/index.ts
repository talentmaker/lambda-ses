import {
    InvocationType as InvocationTypes,
    type InvokeCommandInput,
    type LambdaClient,
    LogType as LogTypes,
    InvokeCommand,
    InvokeCommandOutput,
} from "@aws-sdk/client-lambda"
import {SendBulkEmailInput, SendBulkEmailOutput} from "./types_bulk"
import {SendEmailInput, SendEmailOutput} from "./types"
import {type ResponseMetadata} from "@aws-sdk/types"

export interface Input {
    email?: SendEmailInput
    emails?: SendEmailInput[]
    bulkEmail?: SendBulkEmailInput
}

export interface Output {
    email: SendEmailOutput | null
    error: string | null
    emails: SendEmailOutput[] | null
    errors: string[] | null
    bulkEmail: SendBulkEmailOutput | null
    bulkEmailError: string | null
}

export interface InvocationResponse {
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
        | Output
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

    public async send(
        payload: Input,
        params?: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError?: false,
    ): Promise<InvocationResponse>

    public async send(
        payload: Input,
        params: Partial<Omit<InvokeCommandInput, "Payload" | "FunctionName">>,
        throwError: true,
    ): Promise<InvocationResponse & {error: undefined; payload: Output}>

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
}

export default LambdaSes
