# D-Flow
A storage agnostic data workfow engine.

## Start by defining a workflow

### A simple case

```javascript
const { createDataInputStep, createFlowDefinition, Engine, FlowStatus } = require('d-flow');
const simpleFlow = createFlowDefinition("simple", "simple")
    .setStartStep(createDataInputStep("start", "Start Step"))
    .addStep(createDataInputStep("a", "Step A")).afterStepWithId("start")
    .addStep(createDataInputStep("b", "Step B", FlowStatus.Completed)).afterStepWithId("a");
```

### Conditional Flows

### Parallel Flows

### Cycles

## Submit your data.
