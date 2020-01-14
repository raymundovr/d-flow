import FlowEventEmitter from "../src/event-emitter/flow-event-emitter";
import { FlowDefinition, DataInputStep, createTransition, FlowStatus } from "../src/index";
describe("Flow Events", () => {
    const simpleFlow = new FlowDefinition("simple", "simple")
        .setStartStep(new DataInputStep("start", "Start Step"))
        .addStep(new DataInputStep("a", "Step A"))
        .addStep(new DataInputStep("b", "Step B"))
        .addTransition(createTransition("start", "a"))
        .addTransition(createTransition("a", "b"))
        .setStatusOnCompletedStep("b", FlowStatus.Completed)
        ;

    FlowEventEmitter.on('flow-exception', ex => {
        console.log("Exception!!", ex);
    });

    it('Should fire flow-create', () => {
        FlowEventEmitter.create(simpleFlow);
        FlowEventEmitter.on('flow-created', flow => {
            console.log("Created!", flow.toObject());
        });
    });
});
