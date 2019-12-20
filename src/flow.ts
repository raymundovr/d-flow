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
    private _cycleCount: number;
    public lastTransition?: Transition;
    public status: FlowStatus;

    constructor(id: any, definition: FlowDefinition) {
        this._id = id;
        this._currentStep = null;
        this._definition = definition;
        this._createdAt = new Date();
        this.status = FlowStatus.Created;
        this._cycleCount = 0;
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
            throw new Error('Cannot assign null to Flow CurrentStep');
        }
        this._currentStep = step;
        this._steps.push(step);
    }

    get steps(): FlowStep[] {
        return this._steps;
    }

    get visitedStepDefinitionsId(): any[] {
        return this._steps.map((s: FlowStep) => s.definitionId);
    }

    get cycleCount(): number {
        return this._cycleCount;
    }

    increaseCycleCount(): void {
        this._cycleCount += 1;
    }

    hasStatus(status: FlowStatus) {
        return this.status === status;
    }

    getTransitionFromCurrentStepTo(stepId: any): Transition | null {
        if (!this.currentStep) {
            return null;
        }

        return this.definition.getTransition(this.currentStep.definitionId, stepId);
    }

    getTransitionFromStepsTo(stepId: any): Transition[] {
        let transitionsTo = this.definition.getTransitionsTo(stepId);
        return transitionsTo.filter((t: Transition) => this.visitedStepDefinitionsId.includes(t.origin.id));
    }

    getLastTransitionFromStepsTo(stepId: any): Transition | null {
        let transitions = this.getTransitionFromStepsTo(stepId);
        if (transitions.length === 0) {
            return null;
        }

        return transitions[0];
    }

    getTransitionToStepWithId(stepId: any): Transition | null {
        return this.getTransitionFromCurrentStepTo(stepId) || this.getLastTransitionFromStepsTo(stepId);
    }

    get currentStepHasPrecedent() {
        return this.currentStep && this.currentStep.origin;
    }

    get currentStepPrecedentTransition(): Transition | null {
        if (!this.currentStepHasPrecedent) {
            return null;
        }

        return this.definition.getTransition(this.currentStep!.definitionId, this.currentStep!.origin!.definitionId);
    }
}
