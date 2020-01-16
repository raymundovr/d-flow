import Flow from '../flow/flow';
import FlowDefinition from '../flow/flow-definition';
import { FlowStatus } from '../flow/flow-status';
import FlowStep from '../flow/flow-step';
import StepDefinition from '../step/step-definition';
import Transition from '../transition/transition';
import Requirements from '../transition/transition-requirements';

function haveVisitedStep(flow: Flow, stepDefinition: StepDefinition): boolean {
    return !!flow.steps.find((s: FlowStep) => s.definition.id === stepDefinition.id);
}

function generateSuffix(): string {
    const pseudorand = Math.random().toString(16);
    const now = new Date().getTime().toString();
    return pseudorand.substring(pseudorand.length - 2) + now.substring(now.length - 4);
}

export function create(definition: FlowDefinition): Flow {
    // TODO: Replace id generation
    const suffix = generateSuffix();
    const id = `${definition.id.toString()}-${suffix}`;
    return new Flow(id, definition);
}

export function start(flow: Flow, data: any): Flow {
    if (!flow.definition.startStep) {
        throw new Error(`Cannot start flow ${flow.id}: Start step not defined`);
    }

    flow.currentStep = new FlowStep(flow, flow.definition.startStep, data, null);
    flow.currentStep.completedAt = new Date();
    flow.status = FlowStatus.Active;
    return flow;
}

function flowIsActive(flow: Flow) {
    return flow.hasStatus(FlowStatus.Active) && flow.currentStep;
}

function submittedStepIsStart(stepId: any, flowDefinition: FlowDefinition) {
    return stepId === flowDefinition.startStep!.id;
}

function isTransitionConditionSatisfied(transition: Transition, data: any) {
    if (transition.condition) {
        return transition.condition.satisfies(data);
    }

    return true;
}

function areTransitionRequirementsSatisfied(transition: Transition, flow: Flow) {
    if (transition.requirements) {
        return transition.requirements.every((r: Requirements) => r.isSatisfied(flow));
    }
    return true;
}

export function submit(flow: Flow, data: any, stepDefinitionId: string): Flow {
    const stepDefinition = flow.definition.getStep(stepDefinitionId);
    if (stepDefinition === null) {
        throw new Error(`Invalid submission for Flow ${flow.id}: step with ID ${stepDefinitionId} does not exist`);
    }
    if (flow.hasStatus(FlowStatus.Created)) {
        if (!submittedStepIsStart(stepDefinition.id, flow.definition)) {
            throw new Error(`Invalid submission for Flow ${flow.id}: incorrect start step`);
        }
        return start(flow, data);
    }

    if (!flowIsActive(flow)) {
        throw new Error(`Cannot advance Flow ${flow.id}: Advance can only be applied to Active Flows`);
    }

    const transitionToSubmitted = flow.getTransitionToStepWithId(stepDefinition.id);

    if (!transitionToSubmitted) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: No transition found from any visited step into step "${stepDefinition.id}"`,
        );
    }

    const lastStepFromOrigin = flow.getLastSubmittedStepWithDefinitionId(transitionToSubmitted.origin);
    if (!lastStepFromOrigin) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: Cannot find last submitted step with step definition ${transitionToSubmitted.origin}`,
        );
    }

    if (!isTransitionConditionSatisfied(transitionToSubmitted, lastStepFromOrigin.data)) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: Transition condition to step ${stepDefinition.id} is not satisfied`,
        );
    }

    if (!areTransitionRequirementsSatisfied(transitionToSubmitted, flow)) {
        throw new Error(
            `Cannot advance Flow ${flow.id}: Transition dependencies for step ${stepDefinition.id} are not satisfied`,
        );
    }

    if (haveVisitedStep(flow, stepDefinition)) {
        flow.increaseCycleCount();
    }

    const output = stepDefinition.process(data);
    flow.currentStep = new FlowStep(flow, stepDefinition, output, lastStepFromOrigin);
    flow.lastTransition = transitionToSubmitted;
    return flow;
}
