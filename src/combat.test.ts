import combatMachine from "./combat";

describe("Combat State Machine", () => {
  const machine = combatMachine;

  it("starts in setup mode", () => {
    expect(machine.initialState.matches("new.setup")).toBeTruthy();
  });

  describe("combat start process", () => {
    let nextState = machine.initialState;
    it("can add combatants", () => {
      nextState = machine.transition(nextState, {
        type: "ADD_COMBATANT",
        combatants: [{ name: "Test" }, { name: "Test2" }],
      });
      expect(nextState.context.combatants).toEqual({
        Test: { name: "Test", initiative: null, acted: false },
        Test2: { name: "Test2", initiative: null, acted: false },
      });
    });

    it("can start combat", () => {
      nextState = machine.transition(nextState, {
        type: "START",
      });
      expect(nextState.matches("new.joinBattle")).toBeTruthy();
    });

    it.skip("has requested a join battle roll", (done) => {
      expect(nextState.context.requestedRolls.length).toBeTruthy();
      const request = nextState.context.requestedRolls[0];
      request.send("ROLL"); // This isn't advancing the state machine
      expect(request.getSnapshot()?.done).toBeTruthy();

      // Cleanup?
      expect(nextState.context.requestedRolls.length).toBe(0);
    });

    it("can move to started state after rolls complete", () => {
      nextState = machine
        .withConfig({
          guards: {
            allRollsComplete: () => false,
          },
        })
        .transition(nextState, {
          type: "ROLL_RESULT",
          combatantId: "Test",
          result: { successes: 3 },
        });
      expect(nextState.matches("new.joinBattle")).toBeTruthy();

      nextState = machine
        .withConfig({
          guards: {
            allRollsComplete: () => true,
          },
        })
        .transition(nextState, {
          type: "ROLL_RESULT",
          combatantId: "Test2",
          result: { successes: 2 },
        });
      expect(nextState.matches("started")).toBeTruthy();
      expect(nextState.context.combatants["Test"].initiative).toBe(3);
      expect(nextState.context.combatants["Test2"].initiative).toBe(2);
      expect(nextState.context.currentTick).toBe(3);
      expect(nextState.context.currentTurn).toBe(0);
    });

    it("lets players act", () => {
      expect(nextState.matches("started.active")).toBeTruthy();

      nextState = machine.transition(nextState, {
        type: "COMBATANT_ACT",
        combatantId: "Test",
      });
      expect(nextState.context.currentTurn).toBe(0);
      expect(nextState.context.currentTick).toBe(2);
      expect(nextState.context.combatants["Test"].acted).toBeTruthy();
      expect(nextState.context.combatants["Test2"].acted).toBeFalsy();

      nextState = machine.transition(nextState, {
        type: "COMBATANT_ACT",
        combatantId: "Test2",
      });
      expect(nextState.context.currentTurn).toBe(0);
      expect(nextState.context.currentTick).toBe(0);
      expect(nextState.context.combatants["Test2"].acted).toBeTruthy();
      expect(nextState.matches("started.inactive")).toBeTruthy();
    });

    it("can advance turn", () => {
      nextState = machine.transition(nextState, { type: "NEXT_TURN" });
      expect(nextState.context.currentTurn).toBe(1);
      expect(nextState.context.combatants["Test"].acted).toBe(false);
      expect(nextState.context.combatants["Test2"].acted).toBe(false);
    });
  });
});
