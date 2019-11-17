export default interface FlowCondition {
    field: string;
    value: any;
    operator: string;
}

export function createFlowCondition(field: string, value: any, operator: string):
    FlowCondition {
    return {
        field,
        value,
        operator
    };
}
