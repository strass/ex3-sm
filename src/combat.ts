import {
  ActorRefFrom,
  assign,
  createMachine,
  EventFrom,
  EventObject,
  ExtractEvent,
  send,
  spawn,
} from "xstate";
import rollMachine from "./roll";
import { choose } from "xstate/lib/actions";

type CombatEvent = EventObject &
  (
    | {
        type: "ADD_COMBATANT";
        combatants: Omit<Combatant, "acted" | "initiative">[];
      }
    | { type: "START" }
    | { type: "END_COMBAT" }
    | { type: "NEXT_TURN" }
    | { type: "COMBATANT_ACT"; combatantId: string }
    | ExtractEvent<EventFrom<typeof rollMachine>, "ROLL_RESULT">
  );

const combatMachine = createMachine(
  {
    id: "combat",
    tsTypes: {} as import("./combat.typegen").Typegen0,
    predictableActionArguments: true,
    schema: {
      context: {} as {
        combatants: Record<string, Combatant>;
        currentTurn: number;
        currentTick: number;

        requestedRolls: ActorRefFrom<typeof rollMachine>[];
      },
      events: {} as CombatEvent,
    },
    context: {
      combatants: {},
      currentTurn: 0,
      currentTick: 0,

      requestedRolls: [],
    },

    initial: "new",
    states: {
      new: {
        initial: "setup",
        states: {
          setup: {
            on: {
              START: {
                actions: "requestJoinBattleRolls",
                target: "joinBattle",
              },
              ADD_COMBATANT: { actions: "addCombatant" },
            },
          },
          joinBattle: {
            always: {
              cond: "allRollsComplete",
              // I wanted to do target: '..started' but
              // it seems like cond only affects actions,
              // not transitions
              target: "#combat.started",
            },
            on: {
              ROLL_RESULT: {
                actions: "setInitiative",
                target: ".",
              },
              // '..started' doesn't work here, not sure why
              START: "#combat.started",
            },
          },
        },
      },

      started: {
        initial: "active",
        states: {
          active: {
            always: {
              cond: "allActed",
              target: "inactive",
            },
            entry: ["setCurrentTick"],
            on: {
              COMBATANT_ACT: {
                actions: ["setActed"],
                target: "active",
                internal: false,
              },
            },
          },
          inactive: {
            always: {
              cond: "notAllActed",
              target: "active",
            },
            on: {
              NEXT_TURN: {
                target: "active",
                actions: ["advanceTurn"],
              },
            },
          },
        },

        on: {
          END_COMBAT: {
            target: "#combat.ended",
          },
        },

        // find highest init
        // set as current turn
        // prompt actions
        // resolve action
        // set acted to true
        // repeat until all acted
        // advance turn and set acted to false
      },
      ended: { type: "final" },
    },
  },
  {
    actions: {
      addCombatant: assign((context, event) => ({
        combatants: {
          ...context.combatants,
          ...Object.fromEntries(
            event.combatants.map((c) => [
              c.name,
              { ...c, initiative: null, acted: false },
            ])
          ),
        },
      })),
      requestJoinBattleRolls: assign({
        requestedRolls: (context) => [
          ...context.requestedRolls,
          ...Object.entries(context.combatants).map(([combatantId, c]) => {
            const rollId = `joinBattle-${c.name}`;

            return spawn(
              rollMachine.withContext({
                ...rollMachine.context,
                combatantId,
              }),
              {
                name: rollId,
              }
            );
          }),
        ],
      }),
      setInitiative: assign({
        combatants: (context, { combatantId, result }) => ({
          ...context.combatants,
          [combatantId]: {
            ...context.combatants[combatantId],
            initiative: result.successes,
          },
        }),
      }),
      advanceTurn: assign({
        currentTurn: (context) => context.currentTurn + 1,
        combatants: (context) =>
          Object.fromEntries(
            Object.entries(context.combatants).map(([key, c]) => [
              key,
              { ...c, acted: false },
            ])
          ),
      }),
      setCurrentTick: assign({
        currentTick: (context) => {
          const highest = Object.values(context.combatants)
            .filter((c) => c.acted === false)
            .sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0));
          if (highest.length === 0) {
            return 0;
          }
          return highest[0].initiative ?? 0;
        },
      }),
      setActed: assign({
        combatants: (context, event) => ({
          ...context.combatants,
          [event.combatantId]: {
            ...context.combatants[event.combatantId],
            acted: true,
          },
        }),
      }),
    },
    guards: {
      allRollsComplete: (context) =>
        context.requestedRolls.some((roll) => roll.getSnapshot()?.done),
      notAllActed: (context) =>
        Object.values(context.combatants).some((c) => c.acted === false),
      allActed: (context) =>
        Object.values(context.combatants).every((c) => c.acted),
    },
  }
);

export default combatMachine;
