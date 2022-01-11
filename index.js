import { InvocationType as InvocationTypes, LogType as LogTypes, InvokeCommand, } from "@aws-sdk/client-lambda";
export class LambdaSes {
    constructor(lambdaInstance, functionName = "lambda-ses") {
        this.lambdaInstance = lambdaInstance;
        this.functionName = functionName;
    }
    async send(payload, { InvocationType, LogType, ...input } = {}) {
        const config = new InvokeCommand({
            FunctionName: this.functionName,
            InvocationType: InvocationType !== null && InvocationType !== void 0 ? InvocationType : InvocationTypes.RequestResponse,
            LogType: LogType !== null && LogType !== void 0 ? LogType : LogTypes.Tail,
            Payload: new Uint8Array(Buffer.from(JSON.stringify(payload))),
            ...input,
        });
        const result = await this.lambdaInstance.send(config);
        const resultPayload = result.Payload ? new TextDecoder().decode(result.Payload) : undefined;
        console.log(resultPayload);
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
export default LambdaSes;
//# sourceMappingURL=index.js.map