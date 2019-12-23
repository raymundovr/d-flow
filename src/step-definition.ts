import { FlowStatus } from './flow-status';

export default abstract class StepDefinition {
    protected _id: any;
    public name: string;
    public applyStatusToFlow: FlowStatus;

    constructor(id: any, name: string, status: FlowStatus = FlowStatus.Active) {
        this._id = id;
        this.name = name;
        this.applyStatusToFlow = status;
    }

    get id(): any {
        return this._id;
    }
}
