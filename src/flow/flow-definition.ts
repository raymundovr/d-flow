import StepDefinition from '../step/step-definition';
import Transition from '../transition/transition';
import { FlowStatus } from './flow-status';

export default class FlowDefinition {
    private _id: any;
    public description: string;
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

    getStep(id: any) {
        return this.steps.find((step: StepDefinition) => step.id === id) || null;
    }

    get startStep() {
        return this._startStep;
    }

    setStartStep(s: StepDefinition) {
        this.addStep(s);
        this._startStep = s;
        return this;
    }

    get transitions() {
        return this._transitions;
    }

    addTransition(t: Transition) {        
        if (this.getStep(t.origin) === null || this.getStep(t.destination) === null) {
            throw new Error(`Cannot add transition ${t.id} origin and destination are not steps within this flow`);
        }

        this._transitions.push(t);
        return this;
    }

    removeTransitionById(id: any) {
        this._transitions = this._transitions.filter((t: Transition) => t.id !== id);
        return this;
    }

    addStep(step: StepDefinition) {
        this._steps.push(step);
        return this;
    }

    getTransition(originId: any, destinationId: any) {
        return this.transitions.find((t: Transition) => t.origin === originId && t.destination === destinationId) || null;
    }

    getTransitionsFrom(id: any) {
        return this.transitions.filter((t: Transition) => t.origin === id);
    }

    getTransitionsTo(id: any) {
        return this.transitions.filter((t: Transition) => t.destination === id);
    }

    getDestinationsFrom(id: any) {
        let transitions = this.getTransitionsFrom(id);
        if (!transitions.length) {
            return [];
        }
        return (transitions as Array<Transition>).map((t: Transition) => t.destination);
    }

    setStatusOnCompletedStep(stepId: any, status: FlowStatus) {
        this._statusToApplyOnStepCompletion[stepId.toString()] = status;
        return this;
    }

    getStatusOnCompletedStep(stepId:any): FlowStatus | undefined {
        return stepId.toString() in this._statusToApplyOnStepCompletion ? 
            this._statusToApplyOnStepCompletion[stepId.toString()] : undefined;
    }
}
