"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaSes = void 0;
const client_lambda_1 = require("@aws-sdk/client-lambda");
class LambdaSes {
    constructor(lambdaInstance, functionName = "lambda-ses") {
        this.lambdaInstance = lambdaInstance;
        this.functionName = functionName;
    }
    async invokeFunction(payload, { InvocationType, LogType, ...input } = {}) {
        var _a;
        const config = new client_lambda_1.InvokeCommand({
            FunctionName: this.functionName,
            InvocationType: InvocationType !== null && InvocationType !== void 0 ? InvocationType : client_lambda_1.InvocationType.RequestResponse,
            LogType: LogType !== null && LogType !== void 0 ? LogType : client_lambda_1.LogType.Tail,
            Payload: new Uint8Array(Buffer.from(JSON.stringify(payload))),
            ...input,
        });
        const result = await this.lambdaInstance.send(config);
        const resultPayload = (_a = result.Payload) === null || _a === void 0 ? void 0 : _a.toString();
        return {
            status: result.StatusCode,
            error: result.FunctionError,
            logs: result.LogResult,
            payload: resultPayload ? JSON.parse(resultPayload) : undefined,
            version: result.ExecutedVersion,
            $metadata: result.$metadata,
        };
    }
}
exports.LambdaSes = LambdaSes;
//# sourceMappingURL=index.js.map