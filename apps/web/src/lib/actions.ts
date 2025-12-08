"use server";

import {
  listOpponents as listOpponentsImpl,
  createOpponent as createOpponentImpl,
} from "./actions/opponents";
import { listTournaments as listTournamentsImpl } from "./actions/tournaments";
import {
  listMatches as listMatchesImpl,
  getMatchWithRallies as getMatchWithRalliesImpl,
  createMatch as createMatchImpl,
  deleteMatch as deleteMatchImpl,
  updateMatch as updateMatchImpl,
} from "./actions/matches";
import {
  createRally as createRallyImpl,
  updateRally as updateRallyImpl,
  deleteRally as deleteRallyImpl,
} from "./actions/rallies";

export async function listOpponents() {
  return listOpponentsImpl();
}

export async function createOpponent(formData: FormData): Promise<void> {
  return createOpponentImpl(formData);
}

export async function listTournaments() {
  return listTournamentsImpl();
}

export async function listMatches() {
  return listMatchesImpl();
}

export async function getMatchWithRallies(matchId: string) {
  return getMatchWithRalliesImpl(matchId);
}

export async function createMatch(formData: FormData): Promise<void> {
  return createMatchImpl(formData);
}

export async function deleteMatch(matchId: string): Promise<void> {
  return deleteMatchImpl(matchId);
}

export async function updateMatch(
  matchId: string,
  formData: FormData
): Promise<void> {
  return updateMatchImpl(matchId, formData);
}

export async function createRally(formData: FormData): Promise<void> {
  return createRallyImpl(formData);
}

export async function updateRally(formData: FormData): Promise<void> {
  return updateRallyImpl(formData);
}

export async function deleteRally(formData: FormData): Promise<void> {
  return deleteRallyImpl(formData);
}
