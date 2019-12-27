import StepDefinition from '../step/step-definition';
import Transition from '../transition/transition';
import { FlowStatus } from './flow-status';

export default class FlowDefinition {
    public description: string;
    private _id: any;    
    private _transitions: Transition[] = [];
    private _steps: StepDefinition[] = [];
    private _startStep: StepDefinition | null = null;
    private _statusToApplyOnStepCompletion: { [key: string]: FlowStatus } = {};

    constructor(id: any, description: string) {
        this._id = id;
        this.description = description;
    }

    get id() {
        return this._id;
    }

    get steps() {
        return this._steps;
    }

    public getStep(id: any) {
        return this.steps.find((step: StepDefinition) => step.id === id) || null;
    }

    get startStep() {
        return this._startStep;
    }

    public setStartStep(s: StepDefinition) {
        this.addStep(s);
        this._startStep = s;
        return this;
    }

    get transitions() {
        return this._transitions;
    }

    public addTransition(t: Transition) {
        if (this.getStep(t.origin) === null || this.getStep(t.destination) === null) {
            throw new Error(`Cannot add transition ${t.id} origin and destination are not steps within this flow`);
        }

        this._transitions.push(t);
        return this;
    }

    public removeTransition(origin: string, destination: string) {
        this._transitions = this._transitions.filter(
            (t: Transition) => t.origin === origin && t.destination === destination,
        );
        return this;
    }

    public removeTransitionById(id: any) {
        this._transitions = this._transitions.filter((t: Transition) => t.id !== id);
        return this;
    }

    public addStep(step: StepDefinition) {
        this._steps.push(step);
        return this;
    }

    public getTransition(originId: any, destinationId: any) {
        return (
            this.transitions.find((t: Transition) => t.origin === originId && t.destination === destinationId) || null
        );
    }

    public getTransitionsFrom(id: any) {
        return this.transitions.filter((t: Transition) => t.origin === id);
    }

    public getTransitionsTo(id: any) {
        return this.transitions.filter((t: Transition) => t.destination === id);
    }

    public getDestinationsFrom(id: any) {
        const transitions = this.getTransitionsFrom(id);
        if (!transitions.length) {
            return [];
        }
        return (transitions as Transition[]).map((t: Transition) => t.destination);
    }

    public setStatusOnCompletedStep(stepId: any, status: FlowStatus) {
        this._statusToApplyOnStepCompletion[stepId.toString()] = status;
        return this;
    }

    public getStatusOnCompletedStep(stepId: any): FlowStatus | undefined {
        return stepId.toString() in this._statusToApplyOnStepCompletion
            ? this._statusToApplyOnStepCompletion[stepId.toString()]
            : undefined;
    }
}

export function createFlowDefinition(id: any, description: string) {
    return new FlowDefinition(id, description);
}
