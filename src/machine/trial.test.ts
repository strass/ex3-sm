import trialMachine from "./trial";

describe("trial machine", () => {
  const machine = trialMachine;
  let nextState = machine.initialState;

  it("starts in setup mode", () => {
    expect(machine.initialState.matches("setup")).toBeTruthy();
  });
  it("can edit the roll", () => {
    nextState = machine.transition(nextState, {
      type: "EDIT_ROLL",
      roll: {
        numDice: 3,
        targetNumber: 7,
        reroll: [],
        double: [10],
        autosuccesses: 0,
      },
    });
    expect(nextState.context.source).toEqual({
      numDice: 3,
      targetNumber: 7,
      reroll: [],
      double: [10],
      autosuccesses: 0,
    });
    nextState = machine.transition(nextState, {
      type: "EDIT_ROLL",
      roll: {
        numDice: 8,
        reroll: [5, 6],
      },
    });
    expect(nextState.context.source).toEqual({
      numDice: 8,
      targetNumber: 7,
      reroll: [5, 6],
      double: [10],
      autosuccesses: 0,
    });
  });
  it("can roll", () => {
    nextState = machine.transition(nextState, { type: "ROLL" });
    expect(nextState.matches("rolled")).toBeTruthy();
    expect(nextState.done).toBeTruthy();
    expect(nextState.toJSON().actions[2]).toMatchInlineSnapshot(`
{
  "_event": {
    "$$type": "scxml",
    "data": {
      "type": "xstate.update",
    },
    "name": "xstate.update",
    "type": "external",
  },
  "delay": undefined,
  "event": {
    "type": "xstate.update",
  },
  "id": "xstate.update",
  "to": "#_parent",
  "type": "xstate.send",
}
`);
  });
});
