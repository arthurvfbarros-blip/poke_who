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
  private allNames: string[] = [];

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

  loadAllNames(): Observable<void> {
    return this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=1350').pipe(
      map(data => {
        this.allNames = data.results.map((p: any) => p.name);
      })
    );
  }

  getSuggestions(prefix: string): string[] {
    if (!prefix.trim()) return [];
    return this.allNames.filter(name => name.toLowerCase().startsWith(prefix.toLowerCase())).slice(0, 6);
  }

  getPokemonImage(name: string): Observable<string> {
    return this.fetchPokemon(name).pipe(map(p => p.image));
  }

  private mapToPokemon(data: any): Pokemon {
    const officialArtwork =
      data.sprites?.other?.['official-artwork']?.front_default as string | null;
    return {
      id: data.id as number,
      name: data.name as string,
      generation: this.detectGeneration(data.id), // 👈 Mude de data.sprites para data.id
      types: (data.types as any[]).map((t) => t.type.name as string),
      height: (data.height as number) / 10,
      weight: (data.weight as number) / 10,
      image: officialArtwork ?? (data.sprites?.front_default as string),
    };
  }

  // Substitua a função inteira por esta:
  private detectGeneration(id: number): number {
    if (id <= 151) return 1; // Kanto
    if (id <= 251) return 2; // Johto
    if (id <= 386) return 3; // Hoenn
    if (id <= 493) return 4; // Sinnoh
    if (id <= 649) return 5; // Unova
    if (id <= 721) return 6; // Kalos
    if (id <= 809) return 7; // Alola
    if (id <= 905) return 8; // Galar / Hisui
    return 9;                // Paldea
  }

  salvarVitoria(pokemon: Pokemon,attempts:number): void{
    const stats = this.obterEstatisticas();
    stats.push({pokemon,attempts});
    localStorage.setItem('pokedle_stats', JSON.stringify(stats));
  }
  
  obterEstatisticas(): GameStat[]{
    const data = localStorage.getItem('pokedle_stats');
    return data ? JSON.parse(data):[];
  }

  limparEstatisticas(): void {
    localStorage.removeItem('pokedle_stats');
  }

}

export interface GameStat {
  pokemon: Pokemon;
  attempts: number;
}