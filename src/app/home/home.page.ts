import { Component, inject, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown, checkmarkOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { PokemonService, Pokemon } from '../services/pokemon.service';

export type CompareResult = 'correct' | 'higher' | 'lower';
export type TypesResult = 'correct' | 'partial' | 'wrong';

export interface GuessComparison {
  generation: CompareResult;
  types: TypesResult;
  height: CompareResult;
  weight: CompareResult;
}

export interface GuessResult {
  pokemon: Pokemon;
  comparison: GuessComparison;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    IonIcon,
  ],
})
export class HomePage implements OnInit {
  private readonly pokemonService = inject(PokemonService);

  secretPokemon: Pokemon | null = null;
  guesses: GuessResult[] = [];
  guessInput = '';
  suggestions: { name: string; image: string }[] = [];
  won = false;
  loading = true;
  guessing = false;
  errorMsg: string | null = null;

  constructor() {
    addIcons({ arrowUp, arrowDown, checkmarkOutline });
  }

  ngOnInit(): void {
    this.pokemonService.loadAllNames().subscribe();
    this.loadNewPokemon();
  }

  loadNewPokemon(): void {
    this.loading = true;
    this.guesses = [];
    this.won = false;
    this.guessInput = '';
    this.errorMsg = null;
    this.secretPokemon = null;

    this.pokemonService.getRandomPokemon().subscribe({
      next: (pokemon) => {
        this.secretPokemon = pokemon;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Erro ao carregar o Pokémon. Tente novamente.';
      },
    });
  }

  onGuessInput(event: Event): void {
    this.guessInput = (event as CustomEvent).detail.value ?? '';
    const names = this.pokemonService.getSuggestions(this.guessInput);
    if (names.length > 0) {
      const imageObservables = names.map(name =>
        this.pokemonService.getPokemonImage(name).pipe(
          map(image => ({ name, image }))
        )
      );
      forkJoin(imageObservables).subscribe(data => {
        this.suggestions = data;
      });
    } else {
      this.suggestions = [];
    }
  }

  submitGuess(event?: Event): void {
    event?.preventDefault();
    const name = this.guessInput.trim().toLowerCase();
    if (!name || this.won || this.guessing) { return; }

    this.guessing = true;
    this.errorMsg = null;

    this.pokemonService.fetchPokemon(name).subscribe({
      next: (guessed) => {
        this.guessing = false;
        this.guessInput = '';
        this.guesses.unshift({ pokemon: guessed, comparison: this.compare(guessed) });
        if (guessed.id === this.secretPokemon!.id) {
          this.won = true;
        }
      },
      error: () => {
        this.guessing = false;
        this.errorMsg = 'Pokémon não encontrado. Verifique o nome e tente novamente.';
      },
    });
  }

  selectSuggestion(suggestion: { name: string; image: string }): void {
    this.guessInput = suggestion.name;
    this.suggestions = [];
  }

  newGame(): void {
    this.loadNewPokemon();
  }

  formatName(name: string): string {
    return name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private compare(guessed: Pokemon): GuessComparison {
    const secret = this.secretPokemon!;
    return {
      generation: this.compareNum(guessed.generation, secret.generation),
      types: this.compareTypes(guessed.types, secret.types),
      height: this.compareNum(guessed.height, secret.height),
      weight: this.compareNum(guessed.weight, secret.weight),
    };
  }

  private compareNum(guessed: number, secret: number): CompareResult {
    if (guessed === secret) { return 'correct'; }
    return guessed < secret ? 'higher' : 'lower';
  }

  private compareTypes(guessed: string[], secret: string[]): TypesResult {
    const secretSet = new Set(secret);
    const matches = guessed.filter((t) => secretSet.has(t)).length;
    if (matches === secret.length && guessed.length === secret.length) { return 'correct'; }
    if (matches > 0) { return 'partial'; }
    return 'wrong';
  }
}

