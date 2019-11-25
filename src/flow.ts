import FlowDefinition from './flow-definition';
import FlowStep from './flow-step';
import Transition from './transition';
import { FlowStatus } from './flow-status';

export default class Flow {
    private _id: any;
    private _createdAt: Date;
    private _definition: FlowDefinition;
    private _steps: FlowStep[] = [];
    private _currentStep: FlowStep | null;
    private _tag: number;
    public lastTransition?: Transition;
    public status: FlowStatus;

    constructor(id: any, definition: FlowDefinition) {
        this._id = id;
        this._currentStep = null;
        this._definition = definition;
        this._createdAt = new Date();
        this.status = FlowStatus.Created;
        this._tag = 0;
    }

    get id(): any {
        return this._id;
    }

    get definition(): FlowDefinition {
        return this._definition;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get currentStep(): FlowStep | null {
        return this._currentStep;
    }

    set currentStep(step: FlowStep | null) {
        if (step === null) {
            throw new Error("Cannot assign null to Flow CurrentStep");
        }
        this._currentStep = step;
        this._steps.push(step);
    }

    get steps(): FlowStep[] {
        return this._steps;
    }

    get tag(): number {
        return this._tag;
    }

    updateTag(): void {
        this._tag += 1;
    }
}
