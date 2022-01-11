/**
 * Node JS Client for Lambda-SES
 *
 * @license BSD-3-Clause
 * @copyright 2021 - 2022 Luke Zhang
 */
import { InvocationType as InvocationTypes, LogType as LogTypes, InvokeCommand, } from "@aws-sdk/client-lambda";
export class LambdaSesError extends Error {
    constructor(result) {
        super();
        this.name = "LambdaSesError";
        this.payload = JSON.parse(new TextDecoder().decode(result.Payload));
        if (result.Payload) {
            this.message = `${this.payload.errorType}: ${this.payload.errorMessage}`;
        }
        this.status = result.StatusCode;
        this.error = result.FunctionError;
        this.logs = result.LogResult
            ? Buffer.from(result.LogResult, "base64").toString("utf-8")
            : undefined;
        this.version = result.ExecutedVersion;
        this.$metadata = result.$metadata;
    }
}
export class LambdaSes {
    constructor(lambdaInstance, functionName = "lambda-ses") {
        this.lambdaInstance = lambdaInstance;
        this.functionName = functionName;
    }
    async send(payload, { InvocationType, LogType, ...input } = {}, throwError = false) {
        const config = new InvokeCommand({
            FunctionName: this.functionName,
            InvocationType: InvocationType !== null && InvocationType !== void 0 ? InvocationType : InvocationTypes.RequestResponse,
            LogType: LogType !== null && LogType !== void 0 ? LogType : LogTypes.Tail,
            Payload: new Uint8Array(Buffer.from(JSON.stringify(payload))),
            ...input,
        });
        const result = await this.lambdaInstance.send(config);
        const resultPayload = result.Payload ? new TextDecoder().decode(result.Payload) : undefined;
        if (result.FunctionError && throwError) {
            throw new LambdaSesError(result);
        }
        return {
            status: result.StatusCode,
            error: result.FunctionError,
            logs: result.LogResult
                ? Buffer.from(result.LogResult, "base64").toString("utf-8")
                : undefined,
            payload: resultPayload ? JSON.parse(resultPayload) : undefined,
            version: result.ExecutedVersion,
            $metadata: result.$metadata,
        };
    }
}
export default LambdaSes;
//# sourceMappingURL=index.js.map