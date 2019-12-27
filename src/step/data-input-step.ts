import StepDefinition from './step-definition';
import { FieldDefinition } from './field-definition';
import DataProcessor from './data-processor';
import JsonProcessor from './json-processor';

export default class DataInputStep extends StepDefinition {
    private _fields: FieldDefinition[];
    public processor: DataProcessor;

    constructor(id: any, name: string, fields: Array<FieldDefinition> = [], processor: DataProcessor = JsonProcessor) {
        super(id, name);
        this._fields = fields;
        this.processor = processor;
    }

    get fields(): Array<FieldDefinition> {
        return this._fields;
    }

    addField(field: FieldDefinition): DataInputStep {
        this._fields.push(field);
        return this;
    }

    removeFieldWithId(id: any): DataInputStep {
        this._fields = this._fields.filter((f: FieldDefinition) => f.id !== id);
        return this;
    }

    replaceField(field: FieldDefinition): DataInputStep {
        this.removeFieldWithId(field.id);
        this.addField(field);
        return this;
    }

    getField(id: any): FieldDefinition | null {
        return this._fields.find((f: FieldDefinition) => f.id === id) || null;
    }

    process(data: any): any {
        return this.processor.process(this, data);
    }
}

export function createDataInputStep(id: any, name: string, fields?: Array<FieldDefinition>) {
    return new DataInputStep(id, name, fields);
}
