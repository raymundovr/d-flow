import Flow from './flow';
import FlowDefinition from './flow-definition';
import FlowStep from './flow-step';
import { FlowStatus } from './flow-status';
import StepDefinition from './step-definition';

function haveVisitedStep(flow: Flow, stepDefinition: StepDefinition): boolean {
    return !!flow.steps.find((s: FlowStep) => s.definition.id === stepDefinition.id);
}

export function createFlow(definition: FlowDefinition): Flow {
    //TODO: Replace id generation
    let id = definition.id.toString() + (new Date()).toTimeString();
    return new Flow(id, definition);
}

export function start(flow: Flow, data: any): Flow {
    if (!flow.definition.startStep) {
        throw new Error(`Cannot start flow ${flow.id}: Start step not defined`);
    }
    flow.currentStep = new FlowStep(flow, flow.definition.startStep, data);
    flow.currentStep.completedAt = new Date();
    flow.status = FlowStatus.Active;
    return flow;
}

export function advance(flow: Flow, stepDefinition: StepDefinition, data: any): Flow {
    if (flow.status !== FlowStatus.Active || !flow.currentStep) {
        throw new Error(`Cannot advance Flow: Advance can only be applied to Active Flows`);
    }

    let transition = flow.definition.getTransition(flow.currentStep.definition.id, stepDefinition.id);
    if (!transition) {
        throw new Error(`Cannot advance Flow: No transition from Current Step to Step ${step.definition.id} found`);
    }

    if (haveVisitedStep(flow, stepDefinition)) {
        flow.updateTag();
    }

    flow.currentStep = new FlowStep(flow, stepDefinition, data);
    flow.status = stepDefinition.flowStatus || flow.status;
    flow.lastTransition = transition;
    return flow;
}
