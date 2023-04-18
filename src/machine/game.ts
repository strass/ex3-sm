import { ActorRefFrom, createMachine } from "xstate";
import combatMachine from "./combat";

const gameMachine = createMachine(
  {
    id: "game",
    tsTypes: {} as import("./game.typegen").Typegen0,
    schema: {
      context: {} as {
        rolls: GameContextRolls;
        combats: Record<string, ActorRefFrom<typeof combatMachine>>;
      },
    },
  },
  {}
);

export default gameMachine;

type GameContextRolls = Record<
  string,
  {
    context: "global" | `${"combat"}-${string}`;
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
  }
>;
