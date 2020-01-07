export default abstract class StepDefinition {
    public name: string;
    protected _id: any;
    protected _output: any;

    constructor(id: any, name: string) {
        this._id = id;
        this.name = name;
    }

    get id(): any {
        return this._id;
    }

    get output() {
        return this._output;
    }

    public abstract process(data: any): any;
}
