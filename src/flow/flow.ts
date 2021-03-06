import FlowDefinition from './flow-definition';
import FlowStep from './flow-step';
import Transition from '../transition/transition';
import { FlowStatus } from './flow-status';

export default class Flow {
    public lastTransition?: Transition;
    public status: FlowStatus;
    private _id: any;
    private _createdAt: Date;
    private _lastUpdatedAt: Date;
    private _definition: FlowDefinition;
    private _steps: FlowStep[] = [];
    private _currentStep: FlowStep | null;
    private _cycleCount: number;

    constructor(id: any, definition: FlowDefinition) {
        this._id = id;
        this._currentStep = null;
        this._definition = definition;
        this._createdAt = new Date();
        this._lastUpdatedAt = new Date();
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

    get lastUpdatedAt(): Date {
        return this._lastUpdatedAt;
    }

    get currentStep(): FlowStep | null {
        return this._currentStep;
    }

    set currentStep(step: FlowStep | null) {
        if (step === null) {
            throw new Error('Cannot assign null to Flow CurrentStep');
        }
        this.status = this.definition.getStatusOnCompletedStep(step.definitionId) || this.status;
        this._currentStep = step;
        this._steps.push(step);
        this._lastUpdatedAt = new Date();
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

    public increaseCycleCount(): void {
        this._cycleCount += 1;
    }

    public hasStatus(status: FlowStatus) {
        return this.status === status;
    }

    public getTransitionFromCurrentStepTo(stepId: any): Transition | null {
        if (!this.currentStep) {
            return null;
        }

        return this.definition.getTransition(this.currentStep.definitionId, stepId);
    }

    public getTransitionFromStepsTo(stepId: any): Transition[] {
        const transitionsTo = this.definition.getTransitionsTo(stepId);
        return transitionsTo.filter((t: Transition) => this.visitedStepDefinitionsId.includes(t.origin));
    }

    public getTransitionFromLastStepTo(stepId: any): Transition | null {
        const transitions = this.getTransitionFromStepsTo(stepId);
        if (transitions.length === 0) {
            return null;
        } else if (transitions.length === 1) {
            return transitions[0];
        }

        const lastSubmitted = this.getLastSubmittedStepDefinitionIdInIds(transitions.map((t: Transition) => t.origin));

        return transitions.find((t: Transition) => t.origin === lastSubmitted) || null;
    }

    public getTransitionToStepWithId(stepId: any): Transition | null {
        return this.getTransitionFromCurrentStepTo(stepId) || this.getTransitionFromLastStepTo(stepId);
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

    public getLastSubmittedStepDefinitionIdInIds(ids: any[]): any {
        const observables = this._steps.filter((s: FlowStep) => ids.includes(s.definitionId));
        if (observables.length === 0) {
            return null;
        }

        observables.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
        return observables[0].definitionId;
    }

    public getLastSubmittedStepWithDefinitionId(id: any): FlowStep | null {
        return this._steps.find((s: FlowStep) => s.definitionId === id) || null;
    }

    public toObject(): object {
        return {
            id: this._id,
            createdAt: this._createdAt,
            lastUpdatedAt: this._lastUpdatedAt,
            status: this.status,
            definition: this.definition.id,
            steps: this.steps.map((s: FlowStep) => s.toObject()),
            currentStep: this._currentStep !== null ? this._currentStep.toObject() : null,
            cycleCount: this._cycleCount,
        };
    }
}
