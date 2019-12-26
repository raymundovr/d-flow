export default abstract class StepDefinition {
    protected _id: any;
    protected _output: any;
    public name: string;

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

    abstract process(data: any) : any;
}
