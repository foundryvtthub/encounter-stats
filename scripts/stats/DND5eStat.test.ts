import DND5eStat from "./DND5eStat";
import Logger from "../Logger";
jest.mock("../StatManager");
import { chatActor } from "../mockdata/chatActor";
import { CombatDetailType } from "../enums";

const mockLoggerLog = jest.fn();
const mockLoggerWarn = jest.fn();
Logger.log = mockLoggerLog;
Logger.warn = mockLoggerWarn;

const encounterDefaultWorkflowItemCard: EncounterWorkflow = {
  id: `C3c6l9SPMCqMiceV5H4YnyD6zf9vcJ3P`,
  actionType: "mwak",
  actor: {
    id: "5H4YnyD6zf9vcJ3P",
  },
  item: {
    id: "C3c6l9SPMCqMiceV",
    name: "Flame Tongue Greatsword",
    link: "@Compendium[dnd5e.items.WWb4vAmh18sMAxfY]{Flame Tongue Greatsword}",
    type: "sword",
    img: "itemImageUrl",
  },
  enemyHit: [
    {
      name: "Acolyte",
      tokenId: "tokenId",
    },
  ],
  type: CombatDetailType.ItemCard,
};

const encounterDefaultWorkflowAttack: EncounterWorkflow = {
  id: `C3c6l9SPMCqMiceV5H4YnyD6zf9vcJ3P`,
  actor: {
    id: "5H4YnyD6zf9vcJ3P",
  },
  attackTotal: 19,
  advantage: true,
  disadvantage: false,
  isCritical: false,
  isFumble: false,
  type: "attack",
};

const encounterDefaultWorkflowDamage: EncounterWorkflow = {
  id: `C3c6l9SPMCqMiceV5H4YnyD6zf9vcJ3P`,
  actor: {
    id: "5H4YnyD6zf9vcJ3P",
  },
  damageTotal: 41,
  damageMultipleEnemiesTotal: 41,
  type: CombatDetailType.Damage,
};

describe("DND5eStat", () => {
  let dnd5eStat: DND5eStat;
  const encounterId = "encounterId";
  beforeEach(() => {
    (global as any).canvas = {
      tokens: {
        get: jest.fn().mockReturnValue({
          img: "testImageUrl",
        }),
      },
    };
    dnd5eStat = new DND5eStat(encounterId);
  });
  describe("If you add a new Attack", () => {
    test("it returns without adding if no actorid present", () => {
      dnd5eStat.AddCombatant(chatActor, "tokenId");
      dnd5eStat.AddAttack({
        actor: {},
      });
      dnd5eStat.Save();
      expect(dnd5eStat.encounter.combatants.length).toBe(1);
      const combatantResult = dnd5eStat.GetCombatantStats("5H4YnyD6zf9vcJ3P");
      expect(combatantResult?.events.length).toBe(0);
    });

    test("it returns without adding if actorid does not match combatant", () => {
      dnd5eStat.AddCombatant(chatActor, "tokenId");
      dnd5eStat.AddAttack({
        actor: {
          id: "wrongid",
        },
      });
      dnd5eStat.Save();
      expect(dnd5eStat.encounter.combatants.length).toBe(1);
      const combatantResult = dnd5eStat.GetCombatantStats("5H4YnyD6zf9vcJ3P");
      expect(combatantResult?.events.length).toBe(0);
    });

    test("The basic Item Card is added", () => {
      dnd5eStat.AddCombatant(chatActor, "tokenId");
      dnd5eStat.AddAttack(encounterDefaultWorkflowItemCard);
      dnd5eStat.Save();
      expect(dnd5eStat.encounter.combatants.length).toBe(1);
      const combatantResult = dnd5eStat.GetCombatantStats("5H4YnyD6zf9vcJ3P");
      expect(combatantResult?.events.length).toBe(1);
      expect(combatantResult?.events[0]).toStrictEqual({
        id: "C3c6l9SPMCqMiceV5H4YnyD6zf9vcJ3P",
        actorId: "5H4YnyD6zf9vcJ3P",
        item: {
          id: "C3c6l9SPMCqMiceV",
          name: "Flame Tongue Greatsword",
          link: "@Compendium[dnd5e.items.WWb4vAmh18sMAxfY]{Flame Tongue Greatsword}",
          type: "sword",
          img: "itemImageUrl",
        },
        round: 1,
        attackTotal: 0,
        damageTotal: 0,
        actionType: "mwak",
      });
    });

    test("The Attack is added to the same item card", async () => {
      dnd5eStat.AddCombatant(chatActor, "tokenId");
      dnd5eStat.AddAttack(encounterDefaultWorkflowItemCard);
      dnd5eStat.AddAttack(encounterDefaultWorkflowAttack);
      dnd5eStat.Save();
      expect(dnd5eStat.encounter.combatants.length).toBe(1);
      const combatantResult = dnd5eStat.GetCombatantStats("5H4YnyD6zf9vcJ3P");
      expect(combatantResult?.events.length).toBe(1);
      expect(combatantResult?.events[0]).toStrictEqual({
        id: "C3c6l9SPMCqMiceV5H4YnyD6zf9vcJ3P",
        actorId: "5H4YnyD6zf9vcJ3P",
        item: {
          id: "C3c6l9SPMCqMiceV",
          name: "Flame Tongue Greatsword",
          link: "@Compendium[dnd5e.items.WWb4vAmh18sMAxfY]{Flame Tongue Greatsword}",
          type: "sword",
          img: "itemImageUrl",
        },
        round: 1,
        attackTotal: 19,
        isCritical: false,
        isFumble: false,
        advantage: true,
        disadvantage: false,
        damageTotal: 0,
        actionType: "mwak",
      });
    });

    test("The Damage is added to the same item card", async () => {
      dnd5eStat.AddCombatant(chatActor, "tokenId");
      dnd5eStat.AddAttack(encounterDefaultWorkflowItemCard);
      dnd5eStat.AddAttack(encounterDefaultWorkflowAttack);
      dnd5eStat.AddAttack(encounterDefaultWorkflowDamage);
      dnd5eStat.Save();
      expect(dnd5eStat.encounter.combatants.length).toBe(1);
      const combatantResult = dnd5eStat.GetCombatantStats("5H4YnyD6zf9vcJ3P");
      expect(combatantResult?.events.length).toBe(1);
      expect(combatantResult?.events[0]).toStrictEqual({
        id: "C3c6l9SPMCqMiceV5H4YnyD6zf9vcJ3P",
        actorId: "5H4YnyD6zf9vcJ3P",
        item: {
          id: "C3c6l9SPMCqMiceV",
          name: "Flame Tongue Greatsword",
          link: "@Compendium[dnd5e.items.WWb4vAmh18sMAxfY]{Flame Tongue Greatsword}",
          type: "sword",
          img: "itemImageUrl",
        },
        round: 1,
        attackTotal: 19,
        isCritical: false,
        isFumble: false,
        advantage: true,
        disadvantage: false,
        damageMultipleEnemiesTotal: 41,
        damageTotal: 41,
        actionType: "mwak",
      });
    });
  });
});
