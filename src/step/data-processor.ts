import DataInputStep from './data-input-step';

export default interface DataProcessor {
    process(definition: DataInputStep, data: any): any;
}
