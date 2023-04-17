import { EventObject, createMachine, sendParent } from "xstate";

type RollMachineContext = {
  // id: string;
  combatantId: string;
  rollConfig: {
    numDice: number;
    targetNumber: number;
  };
  opposition: {
    difficulty: number;
  };
  result: null | {
    successes: number;
  };
};

type RollMachineEvents = EventObject &
  (
    | { type: "ROLL" }
    | {
        type: "ROLL_RESULT";
        combatantId: RollMachineContext["combatantId"];
        result: NonNullable<RollMachineContext["result"]>;
      }
  );

const rollMachine = createMachine(
  {
    id: "roll",
    tsTypes: {} as import("./roll.typegen").Typegen0,
    predictableActionArguments: true,
    schema: {
      context: {} as RollMachineContext,
      events: {} as RollMachineEvents,
    },
    initial: "unrolled",
    states: {
      unrolled: {
        on: {
          ROLL: {
            actions: "roll",
            target: "rolled",
          },
        },
      },
      rolled: {
        type: "final",
        entry: [
          // I think this is the preferred way to do it,
          // but it doesn't give a reference to the ID of
          // the machine so it's hard to know which
          // reference to getSnapshot from
          // sendUpdate(),

          sendParent(({ result }) => ({ type: "ROLL_RESULT", result })),
        ],
      },
    },
  },
  {
    actions: {
      roll: () => {
        console.log("rolling");
      },
    },
  }
);

export default rollMachine;
