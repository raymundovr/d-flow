# D-Flow
A storage agnostic data workfow engine.

## Start by defining a workflow


### A simple case

```javascript
const { createDataInputStep, createFlowDefinition, FlowStatus } = require('d-flow');
const simpleFlow = createFlowDefinition("simple", "A simple flow")
    .setStartStep(createDataInputStep("start", "Start Step"))
    .addStep(createDataInputStep("a", "Step A")).afterStep("start")
    .addStep(createDataInputStep("b", "Step B", FlowStatus.Completed)).afterStep("a");
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