import * as Engine from './flow-engine';
import EventEmitter = require('events');
import Flow from '../flow/flow';

class FlowEngineEventEmitter extends EventEmitter {
    public create(definition: any): void {
        try {
            const flow = Engine.create(definition);
            this.emit('flow-created', flow);
        } catch (ex) {
            this.emit('flow-exception', {
                action: 'create',
                exception: ex,
                subject: definition,
            });
        }
    }

    public start(flow: Flow, data: any): void {
        try {
            this.emit('flow-started', Engine.start(flow, data));
        } catch (ex) {
            this.emit('flow-exception', {
                action: 'start',
                exception: ex,
                subject: flow,
            });
        }
    }

    public submit(flow: Flow, data: any, stepDefinitionId: string): void {
        try {
            this.emit('flow-step-submitted', Engine.submit(flow, data, stepDefinitionId));
        } catch (ex) {
            this.emit('flow-exception', {
                action: 'submit',
                exception: ex,
                subject: flow,
            });
        }
    }
}

export default new FlowEngineEventEmitter();
