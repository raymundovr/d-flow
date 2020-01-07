# D-Flow
A storage agnostic data workflow engine. It takes care of maintaining a valid state for your multi-step processes.

Install it via NPM
```bash
npm i @d-flow/engine
```

In order to run the engine its first necessary to define the set of steps and transitions that your data will go through on each submission, this set is maintained within a FlowDefinition.

### Data Step Definition
A Data Step Definition is the entity that will encapsulate your data during a specific state. 
It can include a set of Fields to give it appropiated format. This fields have a specific data type and can be marked as required in order for the submission to be valid. The validation is performed by a Processor that can be specified per step.
If you do not define any fields for your step then the same data that comes in during the submission will be forwarded as output.

At the moment the only supported data type is JSON or Javascript Object. The validation for this data type is provided by the JSON Data Processor.

### Transition

A transition is a connection between your step definitions. It can have conditions and/or require that other steps are completed before being able to complete itself.

## Examples

### A simple case

![A simple flow](https://vasquezruiz.com/pub/img/dflow/simple.png "Simple flow")

```javascript
const { createDataInputStep, createFlowDefinition, createTransition, createFieldDefinition, FlowStatus } = require('@d-flow/engine');
const simpleFlow = createFlowDefinition("simple", "simple")
    .setStartStep(createDataInputStep("start", "Start Step").addField(createFieldDefinition("sa", "string", "Start A")))
    .addStep(createDataInputStep("a", "Step A").addField(createFieldDefinition("fa", "number", "Field A")))
    .addStep(createDataInputStep("b", "Step B").addField(createFieldDefinition("fb", "string", "Field B")))
    .addTransition(createTransition("start", "a"))
    .addTransition(createTransition("a", "b"))
    .setStatusOnCompletedStep("b", FlowStatus.Completed);
```

### Submissions to the Engine

Once your workflow is defined you can start to submit data.

Each submission will be validated by the engine, specifically it will verify:
- That the step that you want to reach is defined for the flow.
- That the step that you want to reach is within the range.
- If there are conditions for the transition they must be satisfied.
- If there are other steps marked as requirements that they are completed as well (specificaly useful on parallel branches).
- That the required fields defined for your step (if any) are completed.

```javascript
const { Engine } = require('@d-flow/engine');
let flow = Engine.create(simpleFlow);
flow = Engine.submit(flow, {sa: "Hello"}, "start");
flow = Engine.submit(flow, {fa: "There"}, "a");
flow = Engine.submit(flow, {fb: "Flow"}, "b");
```

The submit function returns the modified flow instance for reuse.

### The Flow Object

The Flow object holds different information relevant to the process such as:
- ```createdAt```: creation Date for the flow.
- ```lastUpdatedAt```: last update Date for the flow.
- ```currentStep```: hols a reference to the last accepted step.
- ```steps```: an array containing all the visited steps.
- ```cycleCount```: a counter that increases when a cycle is detected.
- ```status```: a value that indicates the current flow status (see below).

### The Flow Status

A flow can hold different single statuses during its execution such as:
- Created: the initial status, obtained when calling Engine.create().
- Active: indicates that a flow can still receive step submissions.
- Completed: indicates that a flow has arrived to a final controlled status and it's no longer able to receive step submissions.
- Cancelled: indicates that a flow has arrived to a final non successful status.
- Error: indicates an exceptional status.

#### Changing a status

_Created_ and _Active_ are currently the only statuses managed by the Engine. In order to apply a different status to your Flow it is necessary to indicate it as part of the flow definition using the function setStatusOnCompletedStep() as indicated above
```javascript
const simpleFlow = createFlowDefinition("simple", "simple")
	[...]
    .setStatusOnCompletedStep("b", FlowStatus.Completed);
```
This indicates that when the step _"b"_ defined for the flow is submited and accepted the flow status will change to _Completed_.

## More FlowDefinition Examples

### Conditional Flows

A transition can also have a condition, which is a data value to be matched against.

![A conditional flow](https://vasquezruiz.com/pub/img/dflow/condition.png "Conditional flow")
```javascript
const { createDataInputStep, createFlowDefinition, createTransition, createFieldDefinition, ObjectConditions} = require('@d-flow/engine');
const decisionFlow = createFlowDefinition("decision", "decision")
    .setStartStep(createDataInputStep("start", "Start Decision"))
    .addStep(createDataInputStep("a", "Step A").addField(createFieldDefinition("fa", "number", "Field A")))
    .addStep(createDataInputStep("b1", "Step B1"))
    .addStep(createDataInputStep("b2", "Step B2"))
    .addTransition(createTransition("start", "a"))
    .addTransition(createTransition("a", "b1").setCondition(ObjectConditions.equals("fa", 10)))
    .addTransition(createTransition("a", "b2").setCondition(ObjectConditions.equals("fa", 20)))
    ;
```
If you want to define your own condition evaluators you can just implement the interface
```javascript
function satisfies(data: any): boolean;
```
And pass this function into .setCondition()

### Parallel Flows

A transition can also require other steps to be completed in order to advance.

![A parallel flow](https://vasquezruiz.com/pub/img/dflow/parallel.png "Parallel flow")
```javascript
const { createDataInputStep, createFlowDefinition, createTransition, Requirements} = require('@d-flow/engine');

const parallelFlow = createFlowDefinition("parallel", "parallel")
    .setStartStep(createDataInputStep("start", "Start Parallel"))
    .addStep(createDataInputStep("a1", "A1"))
    .addStep(createDataInputStep("a2", "A2"))
    .addStep(createDataInputStep("a3", "A3"))
    .addStep(createDataInputStep("b", "B"))
    .addTransition(createTransition("start", "a1"))
    .addTransition(createTransition("start", "a2"))
    .addTransition(createTransition("start", "a3"))
    .addTransition(createTransition("a1", "b").setRequirements([Requirements.requiresAll(["a2", "a3"])]))
    .addTransition(createTransition("a2", "b").setRequirements([Requirements.requiresAll(["a1", "a3"])]))
    .addTransition(createTransition("a3", "b").setRequirements([Requirements.requiresAll(["a2", "a1"])]))
    ;
```

### Parallel with condition flow

A combination of a parallel flow that includes conditionals.

![A conditional flow](https://vasquezruiz.com/pub/img/dflow/parallel-condition.png "Parallel Conditional flow")

```javascript
const { createDataInputStep, createFlowDefinition, createTransition, createFieldDefinition, ObjectConditions, Requirements} = require('@d-flow/engine');

const parallelFlowWithDecision = createFlowDefinition("parallel", "parallel")
    .setStartStep(createDataInputStep("start", "Start Parallel"))
    .addStep(createDataInputStep("a", "A").addField(createFieldDefinition("fa", "number", "Field A")))
    .addStep(createDataInputStep("a1", "A1"))
    .addStep(createDataInputStep("a2", "A2"))
    .addStep(createDataInputStep("b", "B"))
    .addStep(createDataInputStep("c", "C"))
    .addStep(createDataInputStep("d", "D"))
    .addTransition(createTransition("start", "a"))
    .addTransition(createTransition("a", "a1").setCondition(ObjectConditions.equals("fa", 10)))
    .addTransition(createTransition("a", "a2").setCondition(ObjectConditions.equals("fa", 20)))
    .addTransition(createTransition("start", "b"))
    .addTransition(createTransition("start", "c"))
    .addTransition(createTransition("a1", "d").setRequirements([Requirements.requiresAll(["b", "c"])]))
    .addTransition(createTransition("a2", "d").setRequirements([Requirements.requiresAll(["b", "c"])]))
    .addTransition(createTransition("b", "d").setRequirements([Requirements.requiresAny(["a2", "a1"]), Requirements.requiresAll(["c"])]))
    .addTransition(createTransition("c", "d").setRequirements([Requirements.requiresAny(["a2", "a1"]), Requirements.requiresAll(["b"])]))
    ;
```

### Cycles

Every time you run into a cycle an internal cycle count for the flow gets increased.

![A cyclic flow](https://vasquezruiz.com/pub/img/dflow/cycle.png "Cyclic flow")

```javascript
const { createDataInputStep, createFlowDefinition, createTransition } = require('@d-flow/engine');
const cyclicFlow = createFlowDefinition("cyclic", "cyclic")
    .setStartStep(createDataInputStep("start", "Start Cyclic"))
    .addStep(createDataInputStep("a", "A"))
    .addTransition(createTransition("start", "a"))
    .addTransition(createTransition("a", "start"));
```
