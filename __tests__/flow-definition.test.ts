import FlowDefinition from '../src/flow/flow-definition';
import DataInputStep from '../src/step/data-input-step';
import JsonDataStep from '../src/step/json-processor';
import { createTransition } from '../src/transition/transition';

const createDataInputStep = (id: any, name: string): DataInputStep => {
    return new DataInputStep(id, name, JsonDataStep);
};

describe("FlowDefinition", () => {
    test("::new FlowDefinition()", () => {
        expect(
            new FlowDefinition('test', "Test")
        ).toMatchObject({
            id: 'test',
            description: 'Test',
            transitions: {},
            startStep: null
        });
    });

    test("::setStartStep()", () => {
        let start = createDataInputStep('step', 'Step');
        let flow = new FlowDefinition("test", "Test").
            setStartStep(start);
        expect(flow.startStep).toBe(start);
        expect(Object.keys(flow.steps).length).toBe(1);
    });

    test("::addStep()", () => {
        let flow = new FlowDefinition("test", "test")
            .setStartStep(createDataInputStep("start", "start"))
            .addStep(createDataInputStep("a", "a"))
            .addTransition(createTransition("start", "a"));
        expect(flow.steps.length).toBe(2);
        expect(flow.transitions.length).toBe(1);
        expect(flow.transitions[0].id).toBe("start-a");
    });

    /* test("::addStep().before()", () => {
        let flow = new FlowDefinition("test", "test")
            .setStartStep(createDataInputStep("start", "start"))
            .addStep(createDataInputStep("a", "a")).afterStep("start")
            .addStep(createDataInputStep("b", "b")).beforeStep("a");
        expect(flow.transitions.length).toBe(2);
        expect(flow.transitions.map((t: any) => t.id)).toEqual(["start-a", "b-a"]);
    });

    test("::addStep().between()", () => {
        let flow = new FlowDefinition("test", "test")
            .setStartStep(createDataInputStep("start", "start"))
            .addStep(createDataInputStep("b", "b")).afterStep("start")
            .addStep(createDataInputStep("a", "a")).betweenSteps("start", "b");
        expect(flow.transitions.length).toBe(2);
        expect(flow.transitions.map((t: any) => t.id)).toEqual(["start-a", "a-b"]);
    }); */

    test("::getStep()", () => {
        let flow = new FlowDefinition("test", "test")
            .addStep(createDataInputStep("start", "start"));
        expect(flow.getStep("start")!).not.toBeNull();
        expect(flow.getStep("none")).toBeNull();
    });

    test("::addTransition()", () => {
        let flow = new FlowDefinition("test", "test")
            .addStep(createDataInputStep("a", "a"))
            .addStep(createDataInputStep("b", "b"))
            .addTransition(createTransition("a", "b"));
        expect(flow.transitions.length).toBe(1);
        expect(flow.transitions[0].id).toBe("a-b");
    });

    test("::getTransitions()", () => {
        let flow = new FlowDefinition("test", "test")
            .addStep(createDataInputStep("a", "a"))
            .addStep(createDataInputStep("b", "b"))
            .addTransition(createTransition("a", "b"));
        expect(flow.getTransition("a", "b")).not.toBeNull();
        expect(flow.getTransitionsFrom("a").length).toBe(1);
        expect(flow.getTransitionsTo("a").length).toBe(0);
        expect(flow.getTransitionsFrom("b").length).toBe(0);
        expect(flow.getTransitionsTo("b").length).toBe(1);
    });
});
