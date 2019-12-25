export default abstract class StepDefinition {
    protected _id: any;
    public name: string;

    constructor(id: any, name: string) {
        this._id = id;
        this.name = name;
    }

    get id(): any {
        return this._id;
    }
}
