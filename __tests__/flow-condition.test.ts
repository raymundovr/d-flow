import { equals } from '../src/object-conditions';

describe("Flow conditions tests", () => {
    it("::equals", () => {
        console.log(equals('a', 10).satisfies({ a: 10 }));
    });
});
