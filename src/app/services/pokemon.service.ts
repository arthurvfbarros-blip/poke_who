import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Pokemon {
  id: number;
  name: string;
  generation: number;
  types: string[];
  height: number;
  weight: number;
  image: string;
}

const GENERATIONS = [
  'generation-i',
  'generation-ii',
  'generation-iii',
  'generation-iv',
  'generation-v',
  'generation-vi',
  'generation-vii',
  'generation-viii',
  'generation-ix',
];

const TOTAL_POKEMON = 1350;

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);

  getRandomPokemon(): Observable<Pokemon> {
    const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
    return this.fetchPokemon(id).pipe(
      catchError(() => this.getRandomPokemon())
    );
  }

  fetchPokemon(idOrName: number | string): Observable<Pokemon> {
    return this.http
      .get<any>(`https://pokeapi.co/api/v2/pokemon/${idOrName}`)
      .pipe(map((data: any) => this.mapToPokemon(data)));
  }

  private mapToPokemon(data: any): Pokemon {
    const officialArtwork =
      data.sprites?.other?.['official-artwork']?.front_default as string | null;
    return {
      id: data.id as number,
      name: data.name as string,
      generation: this.detectGeneration(data.sprites),
      types: (data.types as any[]).map((t) => t.type.name as string),
      height: (data.height as number) / 10,
      weight: (data.weight as number) / 10,
      image: officialArtwork ?? (data.sprites?.front_default as string),
    };
  }

  private detectGeneration(sprites: any): number {
    const versions = sprites?.versions ?? {};
    for (let i = 0; i < GENERATIONS.length; i++) {
      const gen = versions[GENERATIONS[i]];
      if (!gen) { continue; }
      const hasImage = Object.values(gen).some(
        (game: any) => game?.front_default != null
      );
      if (hasImage) { return i + 1; }
    }
    return 0;
  }
}
