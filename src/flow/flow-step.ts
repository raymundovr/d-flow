import Flow from './flow';
import StepDefinition from '../step/step-definition';

export default class FlowStep {
    public completedAt: Date;
    public data: any;
    private _flow: Flow;
    private _definition: StepDefinition;
    private _flowCycle: number;
    private _origin: FlowStep | null;    

    constructor(flow: Flow, definition: StepDefinition, data: any, origin: FlowStep | null) {
        this._flow = flow;
        this._flowCycle = flow.cycleCount;
        this._definition = definition;
        this.completedAt = new Date();
        this.data = data;
        this._origin = origin;
    }

    get flow(): Flow {
        return this._flow;
    }

    get definition(): StepDefinition {
        return this._definition;
    }

    get flowCycle(): number {
        return this._flowCycle;
    }

    get origin(): FlowStep | null {
        return this._origin;
    }

    get definitionId(): any {
        return this._definition.id;
    }
}
