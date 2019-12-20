import * as Engine from '../src/flow-engine';
import { createFlowDefinition } from '../src/flow-definition';
import { FlowStatus } from '../src/flow-status';
import { createDataInputStep } from '../src/data-input-step';
import { createFieldDefinition } from '../src/field-definition';
import { equals } from '../src/object-conditions';
import { requiresAll, requiresAny } from '../src/transition-requirements';

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

    const parallelFlow = createFlowDefinition("parallel", "parallel")
        .setStartStep(createDataInputStep("start", "Start Parallel"))
        .addStep(createDataInputStep("a1", "A1")).afterStepWithId("start")
        .addStep(createDataInputStep("a2", "A2")).afterStepWithId("start")
        .addStep(createDataInputStep("a3", "A3")).afterStepWithId("start")
        .addStep(createDataInputStep("b", "B")).done()
        .createTransition("a1", "b", null, [requiresAll(['a2', 'a3'])])
        .createTransition("a2", "b", null, [requiresAll(['a1', 'a3'])])
        .createTransition("a3", "b", null, [requiresAll(['a2', 'a1'])])
        ;

    const parallelFlowWithDecision = createFlowDefinition("parallel", "parallel")
        .setStartStep(createDataInputStep("start", "Start Parallel"))
        .addStep(
            createDataInputStep("a", "A").addField(createFieldDefinition('fa', 'number', 'Field A'))
        ).afterStepWithId("start")
        .addStep(createDataInputStep("a1", "A1")).afterStepWithId("a", equals('fa', 10))
        .addStep(createDataInputStep("a2", "A2")).afterStepWithId("a", equals('fa', 20))
        .addStep(createDataInputStep("b", "B")).afterStepWithId("start")
        .addStep(createDataInputStep("c", "C")).afterStepWithId("start")
        .addStep(createDataInputStep("d", "D")).done()
        .createTransition("a1", "d", null, [requiresAll(['b', 'c'])])
        .createTransition("a2", "d", null, [requiresAll(['b', 'c'])])
        .createTransition("b", "d", null, [requiresAny(['a2', 'a1']), requiresAll(['c'])])
        .createTransition("c", "d", null, [requiresAny(['a2', 'a1']), requiresAll(['b'])])
        ;

    const cyclicFlow = createFlowDefinition("cyclic", "cyclic")
        .setStartStep(createDataInputStep("start", "Start Cyclic"))
        .addStep(createDataInputStep("a", "A")).afterStepWithId("start")
        .createTransition("a", "start");

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
        let flow = Engine.create(parallelFlow);
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, {}, parallelFlow.getStep('a1'));
        expect(() => Engine.submit(flow, {}, parallelFlow.getStep('b'))).toThrow();
        flow = Engine.submit(flow, {}, parallelFlow.getStep('a2'));
        flow = Engine.submit(flow, {}, parallelFlow.getStep('a3'));
        flow = Engine.submit(flow, {}, parallelFlow.getStep('b'));
        expect(flow.currentStep!.definition).toMatchObject(
            parallelFlow.getStep('b')
        );
    });

    it("Should complete a set of parallel steps, some of them optional due to diverge, correctly in order to advance", () => {
        let flow = Engine.create(parallelFlowWithDecision);
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, {}, parallelFlowWithDecision.getStep('a'));
        expect(() => Engine.submit(flow, {}, parallelFlowWithDecision.getStep('d'))).toThrow();
        flow = Engine.submit(flow, { fa: 10 }, parallelFlowWithDecision.getStep('a1'));
        flow = Engine.submit(flow, {}, parallelFlowWithDecision.getStep('b'));
        flow = Engine.submit(flow, {}, parallelFlowWithDecision.getStep('c'));
        flow = Engine.submit(flow, {}, parallelFlowWithDecision.getStep('d'));
        expect(flow.currentStep!.definition).toMatchObject(
            parallelFlowWithDecision.getStep('d')
        );
    });

    it("Should update a flow tag when cycle is encountered", () => {
        let flow = Engine.create(cyclicFlow);
        flow = Engine.start(flow, {});
        let firstTag = flow.cycleCount; //Ensure copy
        flow = Engine.submit(flow, {}, cyclicFlow.getStep("a"));
        expect(flow.cycleCount).toEqual(firstTag);
        flow = Engine.submit(flow, {}, cyclicFlow.getStep("start"));
        expect(flow.cycleCount).not.toEqual(firstTag);
    });
});
