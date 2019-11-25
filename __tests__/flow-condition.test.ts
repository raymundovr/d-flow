import { equals } from '../src/flow-condition';

describe("Flow conditions tests", () => {
    it("::equals", () => {
        console.log(equals('a', 10).satisfies({ a: 10 }));
    });
});
