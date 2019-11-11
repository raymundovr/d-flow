import StepDefinition from "./step-definition";
import { Access } from "./step-access";


export class CommandStep extends StepDefinition {
    public commandLine: string;

    constructor(id: any, name: string, commandLine: string, access: Array<Access> = []) {
        super(id, name, access);
        this.commandLine = commandLine;
    }
}
