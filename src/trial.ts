import { assign, createMachine, EventObject, sendUpdate } from "xstate";

type Roll = {
  numDice: number;
  targetNumber: number;
  reroll: number[];
  double: number[];
  autosuccesses: number;
  /** Charms, merits, qualities, weapon bonuses/penalties */
  enhancements: unknown[];
};
type StaticDifficulty = {
  difficulty: number;
  penalty: number;
  /** Maybe enhancement isn't the best term here */
  enhancements: unknown[];
};
type OpposedRoll = Roll;
type VentureRoll = {
  rolls: StaticDifficulty[];
};

interface ActionMachineContext {
  source: Roll;
  target: StaticDifficulty | OpposedRoll | VentureRoll;
  result: {
    successes: number;
    botch: boolean;
  };
}
type ActionMachineEvents = EventObject &
  ({ type: "EDIT_ROLL"; roll: Partial<Roll> } | { type: "ROLL" });

const trialMachine = createMachine(
  {
    id: "trial",
    tsTypes: {} as import("./trial.typegen").Typegen0,
    predictableActionArguments: true,
    schema: {
      context: {} as ActionMachineContext,
      events: {} as ActionMachineEvents,
    },
    context: {
      source: {} as any,
      target: {} as any,
      result: {} as any,
    },
    initial: "setup",
    states: {
      setup: {
        on: {
          EDIT_ROLL: {
            actions: "editRoll",
          },
          // Is there a way to check roll validity?
          ROLL: {
            cond: "isRollValid",
            target: "rolled",
          },
        },
      },
      rolled: {
        entry: ["rollDice", "spendResources", sendUpdate()],
        type: "final",
      },
    },
  },
  {
    actions: {
      editRoll: assign({
        source: ({ source }, { roll }) => ({ ...source, ...roll }),
      }),
      rollDice: () => {},
      spendResources: () => {},
    },
    guards: {
      isRollValid: () => true,
    },
  }
);

export default trialMachine;
