import { createFlowDefinition } from '../src/flow/flow-definition';
import { createDataInputStep } from '../src/step/data-input-step';

describe("FlowDefinition", () => {
    test("::createFlowDefinition()", () => {
        expect(
            createFlowDefinition('test', "Test")
        ).toMatchObject({
            id: 'test',
            description: 'Test',
            transitions: {},
            startStep: null
        });
    });

    test("::setStartStep()", () => {
        let start = createDataInputStep('step', 'Step');
        let flow = createFlowDefinition("test", "Test").
            setStartStep(start);
        expect(flow.startStep).toBe(start);
        expect(Object.keys(flow.steps).length).toBe(1);
    });

    test("::addStep().after()", () => {
        let flow = createFlowDefinition("test", "test")
            .setStartStep(createDataInputStep("start", "start"))
            .addStep(createDataInputStep("a", "a")).afterStep("start");
        expect(flow.steps.length).toBe(2);
        expect(flow.transitions.length).toBe(1);
        expect(flow.transitions[0].id).toBe("start-a");
    });

    test("::addStep().before()", () => {
        let flow = createFlowDefinition("test", "test")
            .setStartStep(createDataInputStep("start", "start"))
            .addStep(createDataInputStep("a", "a")).afterStep("start")
            .addStep(createDataInputStep("b", "b")).beforeStep("a");
        expect(flow.transitions.length).toBe(2);
        expect(flow.transitions.map((t: any) => t.id)).toEqual(["start-a", "b-a"]);
    });

    test("::addStep().between()", () => {
        let flow = createFlowDefinition("test", "test")
            .setStartStep(createDataInputStep("start", "start"))
            .addStep(createDataInputStep("b", "b")).afterStep("start")
            .addStep(createDataInputStep("a", "a")).betweenSteps("start", "b");
        expect(flow.transitions.length).toBe(2);
        expect(flow.transitions.map((t: any) => t.id)).toEqual(["start-a", "a-b"]);
    });

    test("::getStep()", () => {
        let flow = createFlowDefinition("test", "test")
            .addStep(createDataInputStep("start", "start")).done();
        expect(flow.getStep("start")).not.toBeNull();
        expect(flow.getStep("none")).toBeNull();
    });

    test("::createTransition()", () => {
        let flow = createFlowDefinition("test", "test")
            .addStep(createDataInputStep("a", "a")).done()
            .addStep(createDataInputStep("b", "b")).done()
            .createTransition("a", "b");
        expect(flow.transitions.length).toBe(1);
        expect(flow.transitions[0].id).toBe("a-b");
    });

    test("::getTransitions()", () => {
        let flow = createFlowDefinition("test", "test")
            .addStep(createDataInputStep("a", "a")).done()
            .addStep(createDataInputStep("b", "b")).done()
            .createTransition("a", "b");
        expect(flow.getTransition("a", "b")).not.toBeNull();
        expect(flow.getTransitionsFrom("a").length).toBe(1);
        expect(flow.getTransitionsTo("a").length).toBe(0);
        expect(flow.getTransitionsFrom("b").length).toBe(0);
        expect(flow.getTransitionsTo("b").length).toBe(1);
    });
});
