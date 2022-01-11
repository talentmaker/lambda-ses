"use strict";
/**
 * Node JS Client for Lambda-SES
 *
 * @license BSD-3-Clause
 * @copyright 2021 - 2022 Luke Zhang
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaSes = exports.LambdaSesError = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
class LambdaSesError extends Error {
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
exports.LambdaSesError = LambdaSesError;
class LambdaSes {
    constructor(lambdaInstance, functionName = "lambda-ses") {
        this.lambdaInstance = lambdaInstance;
        this.functionName = functionName;
    }
    async send(payload, { InvocationType, LogType, ...input } = {}, throwError = false) {
        const config = new client_lambda_1.InvokeCommand({
            FunctionName: this.functionName,
            InvocationType: InvocationType !== null && InvocationType !== void 0 ? InvocationType : client_lambda_1.InvocationType.RequestResponse,
            LogType: LogType !== null && LogType !== void 0 ? LogType : client_lambda_1.LogType.Tail,
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
exports.LambdaSes = LambdaSes;
exports.default = LambdaSes;
//# sourceMappingURL=index.js.map