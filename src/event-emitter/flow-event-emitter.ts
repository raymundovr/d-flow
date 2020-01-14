import * as Engine from '../flow/flow-engine';
import EventEmitter = require('events');
import Flow from '../flow/flow';

class FlowEventEmitter extends EventEmitter {
    create(definition: any): void {
        try {
            const flow = Engine.create(definition);
            this.emit('flow-created', flow);
        } catch (ex) {
            this.emit('flow-exception', {
                action: 'create',
                exception: ex,
                subject: definition
            });
        }
    }

    start(flow: Flow, data: any): void {
        try {
            this.emit('flow-started', Engine.start(flow, data));
        } catch (ex) {
            this.emit('flow-exception', {
                action: 'start',
                exception: ex,
                subject: flow
            });
        }
    }

    submit(flow: Flow, data: any, stepDefinitionId: string): void {
        try {
            this.emit('flow-step-submitted', Engine.submit(flow, data, stepDefinitionId));
        } catch (ex) {
            this.emit('flow-exception', {
                action: 'submit',
                exception: ex,
                subject: flow
            });
        }
    }
}

export default new FlowEventEmitter();
