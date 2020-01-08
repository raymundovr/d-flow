import * as Engine from "../src/flow/flow-engine";
import FlowDefinition from "../src/flow/flow-definition";
import { FlowStatus } from "../src/flow/flow-status";
import DataInputStep from "../src/step/data-input-step";
import { createFieldDefinition } from "../src/step/field-definition";
import { equals } from "../src/transition/object-conditions";
import { requiresAll } from "../src/transition/transition-requires-all";
import { requiresAny } from "../src/transition/transition-requires-any";
import { createTransition } from "../src/transition/transition";

describe("FlowEngine", () => {
    const simpleFlow = new FlowDefinition("simple", "simple")
        .setStartStep(new DataInputStep("start", "Start Step"))
        .addStep(new DataInputStep("a", "Step A"))
        .addStep(new DataInputStep("b", "Step B"))
        .addTransition(createTransition("start", "a"))
        .addTransition(createTransition("a", "b"))
        .setStatusOnCompletedStep("b", FlowStatus.Completed)
        ;
    const decisionFlow = new FlowDefinition("decision", "decision")
        .setStartStep(new DataInputStep("start", "Start Decision"))
        .addStep(new DataInputStep("a", "Step A").addField(createFieldDefinition("fa", "number", "Field A")))
        .addStep(new DataInputStep("b1", "Step B1"))
        .addTransition(createTransition("start", "a"))
        .addTransition(createTransition("a", "b1").setCondition(equals("fa", 10)))
        ;

    const parallelFlow = new FlowDefinition("parallel", "parallel")
        .setStartStep(new DataInputStep("start", "Start Parallel"))
        .addStep(new DataInputStep("a1", "A1"))
        .addStep(new DataInputStep("a2", "A2"))
        .addStep(new DataInputStep("a3", "A3"))
        .addStep(new DataInputStep("b", "B"))
        .addTransition(createTransition("start", "a1"))
        .addTransition(createTransition("start", "a2"))
        .addTransition(createTransition("start", "a3"))
        .addTransition(createTransition("a1", "b").setRequirements([requiresAll(["a2", "a3"])]))
        .addTransition(createTransition("a2", "b").setRequirements([requiresAll(["a1", "a3"])]))
        .addTransition(createTransition("a3", "b").setRequirements([requiresAll(["a2", "a1"])]))
        ;

    const parallelFlowWithDecision = new FlowDefinition("parallel", "parallel")
        .setStartStep(new DataInputStep("start", "Start Parallel"))
        .addStep(new DataInputStep("a", "A").addField(createFieldDefinition("fa", "number", "Field A")))
        .addStep(new DataInputStep("a1", "A1"))
        .addStep(new DataInputStep("a2", "A2"))
        .addStep(new DataInputStep("b", "B"))
        .addStep(new DataInputStep("c", "C"))
        .addStep(new DataInputStep("d", "D"))
        .addTransition(createTransition("start", "a"))
        .addTransition(createTransition("a", "a1").setCondition(equals("fa", 10)))
        .addTransition(createTransition("a", "a2").setCondition(equals("fa", 20)))
        .addTransition(createTransition("start", "b"))
        .addTransition(createTransition("start", "c"))
        .addTransition(createTransition("a1", "d").setRequirements([requiresAll(["b", "c"])]))
        .addTransition(createTransition("a2", "d").setRequirements([requiresAll(["b", "c"])]))
        .addTransition(createTransition("b", "d").setRequirements([requiresAny(["a2", "a1"]), requiresAll(["c"])]))
        .addTransition(createTransition("c", "d").setRequirements([requiresAny(["a2", "a1"]), requiresAll(["b"])]))
        ;

    const cyclicFlow = new FlowDefinition("cyclic", "cyclic")
        .setStartStep(new DataInputStep("start", "Start Cyclic"))
        .addStep(new DataInputStep("a", "A"))
        .addTransition(createTransition("start", "a"))
        .addTransition(createTransition("a", "start"));

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
        expect(flow.currentStep!.definition).toMatchObject(simpleFlow.startStep!);
    });

    it("Should fail when trying to submit a non-existent step", () => {
        let flow = Engine.start(Engine.create(simpleFlow), {});
        expect(() => Engine.submit(flow, {}, "non-existent")).toThrow();
    });

    it("Should complete a Flow START -> A -> B", () => {
        let flow = Engine.create(simpleFlow);
        let stepA = simpleFlow.getStep("a");
        let stepB = simpleFlow.getStep("b");
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, {}, "a");
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(stepA!);
        flow = Engine.submit(flow, {}, "b");
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(stepB!);
        expect(flow.status).toBe(FlowStatus.Completed);
        expect(flow.toObject()).toMatchObject({
            status: "COMPLETED",
            definition: "simple",
            cycleCount: 0,
        });
    });

    it("Should complete a flow on a decision branch based on a condition START -> A -> (condition) -> B1", () => {
        let flow = Engine.create(decisionFlow);
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, { fa: 10 }, "a");
        flow = Engine.submit(flow, {}, "b1");
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(decisionFlow.getStep("b1")!);
    });

    it("Should complete a set of parallel steps correctly in order to advance", () => {
        let flow = Engine.create(parallelFlow);
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, {}, "a1");
        expect(() => Engine.submit(flow, {}, "b")).toThrow();
        flow = Engine.submit(flow, {}, "a2");
        flow = Engine.submit(flow, {}, "a3");
        flow = Engine.submit(flow, {}, "b");
        expect(flow.currentStep!.definition).toMatchObject(
            parallelFlow.getStep("b")!
        );
    });

    it("Should complete a set of parallel steps, some of them optional due to diverge, correctly in order to advance", () => {
        let flow = Engine.create(parallelFlowWithDecision);
        flow = Engine.start(flow, {});
        flow = Engine.submit(flow, { fa: 10 }, "a");
        expect(() => Engine.submit(flow, {}, "d")).toThrow();
        flow = Engine.submit(flow, {}, "a1");
        flow = Engine.submit(flow, {}, "b");
        flow = Engine.submit(flow, {}, "c");
        flow = Engine.submit(flow, {}, "d");
        expect(flow.currentStep!.definition).toMatchObject(
            parallelFlowWithDecision.getStep("d")!
        );
    });

    it("Should update a flow tag when cycle is encountered", () => {
        let flow = Engine.create(cyclicFlow);
        flow = Engine.start(flow, {});
        let firstTag = flow.cycleCount; //Ensure copy
        flow = Engine.submit(flow, {}, "a");
        expect(flow.cycleCount).toEqual(firstTag);
        flow = Engine.submit(flow, {}, "start");
        expect(flow.cycleCount).not.toEqual(firstTag);
    });
});
