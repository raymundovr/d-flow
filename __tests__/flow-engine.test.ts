import * as Engine from '../src/flow-engine';
import { createFlowDefinition } from '../src/flow-definition';
import { FlowStatus } from '../src/flow-status';
import { createDataInputStep } from "../src/data-input-step";

describe("FlowEngine", () => {
    const flowDefinition = createFlowDefinition("test", "test")
        .setStartStep(createDataInputStep("start", "Start Step"))
        .addStep(createDataInputStep("a", "Step A")).afterStepWithId("start")
        .addStep(createDataInputStep("b", "Step B")).afterStepWithId("a")
        ;

    it("Should create a Flow from a FlowDefinition", () => {
        let flow = Engine.createFlow(flowDefinition);
        expect(flow.status).toBe(FlowStatus.Created);
        expect(flow.id).not.toBeNull();
        expect(flow.createdAt).toBeInstanceOf(Date);
        expect(flow.currentStep).toBeNull();
    });

    it("Should start a flow", () => {
        let flow = Engine.createFlow(flowDefinition);
        flow = Engine.start(flow, {});
        expect(flow.currentStep).not.toBeNull();
        expect(flow.currentStep!.definition).toMatchObject(flowDefinition.startStep);
    });
});
