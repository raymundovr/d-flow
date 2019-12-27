# D-Flow
A storage agnostic data workflow engine. It takes care of maintaining a valid state for your multi-step processes.

In order to run the engine it is first necessary to define the set of steps and transitions that your data will go through on each submission, this can be performed by creating a FlowDefinition.

Each submission will be validated by the engine, specifically it will verify:
- That the step that you want to reach is defined for the flow
- That the step that you want to reach is within the range
- If there are conditions for the transition they must be satisfied
- If there are other steps marked as dependencies (step requirements) that they are completed as well, specificaly useful on parallel branches.

## Flow Steps
A Data Step Definition is the entity that will encapsulate your data during a specific state. It can include a set of Fields that will give it form. This fields have a specific data type and can be marked as required in order for the submission to be valid. The validation is performed by a Processor that can be specified per step.
At the moment the only supported data type is JSON or Javascript Object. The validation for this data type is provided by the JSON Data Processor.



## Flow Transitions


## Some examples

### A simple case
![A simple flow](https://imgur.com/5ExVN9F "Simple flow")

```javascript
const { createDataInputStep, createFlowDefinition, createTransition, FlowStatus } = require('d-flow');
const simpleFlow = createFlowDefinition("simple", "simple")
    .setStartStep(createDataInputStep("start", "Start Step"))
    .addStep(createDataInputStep("a", "Step A"))
    .addStep(createDataInputStep("b", "Step B"))
    .addTransition(createTransition("start", "a"))
    .addTransition(createTransition("a", "b"))
    .setStatusOnCompletedStep("b", FlowStatus.Completed);
```

### Conditional Flows
```javascript
const decisionFlow = createFlowDefinition("decision", "A flow with different paths")
    .setStartStep(createDataInputStep("start", "Start Decision"))
    .addStep(createDataInputStep("a", "Step A")).afterStep("start")
    .addStep(createDataInputStep("b1", "Step B1")).afterStep("a", equals('fa', 10));
```

### Parallel Flows
```javascript
const parallelFlow = createFlowDefinition("parallel", "A flow with a parallel branch")
    .setStartStep(createDataInputStep("start", "Start Parallel"))
    .addStep(createDataInputStep("a1", "A1")).afterStep("start")
    .addStep(createDataInputStep("a2", "A2")).afterStep("start")
    .addStep(createDataInputStep("a3", "A3")).afterStep("start")
    .addStep(createDataInputStep("b", "B")).done()
    .createTransition("a1", "b", null, [requiresAll(['a2', 'a3'])])
    .createTransition("a2", "b", null, [requiresAll(['a1', 'a3'])])
    .createTransition("a3", "b", null, [requiresAll(['a2', 'a1'])]);
```

### Cycles
```javascript
const cyclicFlow = createFlowDefinition("cyclic", "A flow with a cycle")
    .setStartStep(createDataInputStep("start", "Start Cyclic"))
    .addStep(createDataInputStep("a", "A")).afterStep("start")
    .createTransition("a", "start");
```

## Submit your data.