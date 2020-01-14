export default interface FlowEmitterException {
    readonly action: string;
    readonly exception: Error;
    readonly subject: any;
}
