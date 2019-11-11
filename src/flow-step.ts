import Flow from "./flow";
import StepDefinition from "./step-definition";

export default class FlowStep {
    private _flow: Flow
    private _definition: StepDefinition;
    private _flowTag: number;
    public completedAt: Date | null;
    public data: any;

    constructor(flow: Flow, definition: StepDefinition, data: any) {
        this._flow = flow;
        this._flowTag = flow.tag;
        this._definition = definition;
        this.completedAt = null;
        this.data = data;
    }

    get flow() {
        return this._flow;
    }

    get definition() {
        return this._definition;
    }

    get flowTag(): number {
        return this._flowTag;
    }
}
