import * as Engine from '../src/flow-engine';
import { createFlowDefinition } from '../src/flow-definition';
import { FlowStatus } from '../src/flow-status';
import { createDataInputStep } from '../src/data-input-step';
import { createFieldDefinition } from '../src/field-definition';
import { equals } from '../src/object-conditions';

describe("FlowEngine", () => {
    const simpleFlow = createFlowDefinition("simple", "simple")
        .setStartStep(createDataInputStep("start", "Start Step"))
        .addStep(createDataInputStep("a", "Step A")).afterStepWithId("start")
        .addStep(
            createDataInputStep("b", "Step B", FlowStatus.Completed)
        ).afterStepWithId("a")
        ;
    const decisionFlow = createFlowDefinition("decision", "decision")
        .setStartStep(createDataInputStep("start", "Start Decision"))
        .addStep(
            createDataInputStep("a", "Step A")
                .addField(createFieldDefinition('fa', 'number', 'Field A'))
        ).afterStepWithId("start")
        .addStep(
            createDataInputStep("b1", "Step B1")
        ).afterStepWithId("a", equals('fa', 10))
        ;

    it("Should create a Flow from a FlowDefinition", () => {
        let flow = Engine.create(simpleFlow);
        expect(flow.status).toBe(FlowStatus.Created);
        expect(flow.id).not.toBeNull();
        expect(flow.createdAt).toBeInstanceOf(Date);
        expect(flow.currentStep).toBeNull();
    });

    it("Should start a Flow", () => {
        let flow = Engine.start(
            Engine.create(simpleFlow),
            {}
        );
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(simpleFlow.startStep);
    });

    it("Should complete a Flow START -> A -> B", () => {
        let flow = Engine.create(simpleFlow);
        let stepA = simpleFlow.getStep('a');
        let stepB = simpleFlow.getStep('b');
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, {}, stepA);
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(stepA);
        flow = Engine.submit(flow, {}, stepB);
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(stepB);
        expect(flow.status).toBe(FlowStatus.Completed);
    });

    it("Should complete a flow on a decision branch based on a condition START -> A -> (condition) -> B1", () => {
        let flow = Engine.create(decisionFlow);
        let stepA = decisionFlow.getStep('a');
        let stepB1 = decisionFlow.getStep('b1');
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, {}, stepA);
        flow = Engine.submit(flow, { fa: 10 }, stepB1);
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(stepB1);
    });

    it("Should complete a set of parallel steps correctly in order to advance", () => {

    });
});
