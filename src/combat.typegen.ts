
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "": { type: "" };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "addCombatant": "ADD_COMBATANT";
"advanceTurn": "NEXT_TURN";
"requestJoinBattleRolls": "START";
"setActed": "COMBATANT_ACT";
"setCurrentTick": "" | "COMBATANT_ACT" | "NEXT_TURN" | "START";
"setInitiative": "ROLL_RESULT";
        };
        eventsCausingDelays: {
          
        };
        eventsCausingGuards: {
          "allActed": "";
"allRollsComplete": "";
"notAllActed": "";
        };
        eventsCausingServices: {
          
        };
        matchesStates: "ended" | "new" | "new.joinBattle" | "new.setup" | "started" | "started.active" | "started.inactive" | { "new"?: "joinBattle" | "setup";
"started"?: "active" | "inactive"; };
        tags: never;
      }
  