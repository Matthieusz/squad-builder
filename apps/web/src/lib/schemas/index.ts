import { z } from "zod";

export const ProfessionCodeSchema = z.enum(["w", "t", "h", "p", "m", "k"]);

export const CharacterSchema = z.object({
  id: z.string(),
  nick: z.string(),
  lvl: z.number().int().positive(),
  prof: ProfessionCodeSchema,
  profname: z.string(),
  world: z.string(),
  clan: z.string(),
  gender: z.enum(["m", "k"]),
  accountId: z.string(),
  spriteUrl: z.string(),
});

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  profileUrl: z.string().optional(),
  characters: z.array(CharacterSchema),
});

export const SquadSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  characterIds: z.array(z.string()).max(10),
});

export const SquadGroupSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  squads: z.array(SquadSchema),
});

export const AppDataSchema = z.object({
  version: z.number(),
  accounts: z.array(AccountSchema),
  groups: z.array(SquadGroupSchema),
});

export const ImportDataSchema = AppDataSchema;
