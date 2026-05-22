import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PokemonTypePipe } from './Tipagem-pokemon.pipe';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonIcon, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowUp, arrowDown, checkmarkOutline, bookOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { PokemonService, Pokemon } from '../services/pokemon.service';
import { HoverHighlightDirective } from '../directives/hover-highlight.directive';

export type CompareResult = 'correct' | 'higher' | 'lower';
export interface TypeComparison {
  name: string;
  status: 'correct' | 'partial' | 'wrong';
}

export interface GuessComparison {
  generation: CompareResult;
  types: TypeComparison[];
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
    IonIcon,
    DecimalPipe,
    PokemonTypePipe,
    HoverHighlightDirective,
    IonFab,
    IonFabButton,
  ],
})
export class HomePage implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private searchSubject = new Subject<string>();
  private readonly router = inject(Router);
  showSilhouette = false;

  toggleSilhouette(): void {
    this.showSilhouette = !this.showSilhouette;
  }

  preventImageDrag(event: DragEvent): void {
    event.preventDefault();
  }
  

  secretPokemon: Pokemon | null = null;
  guesses: GuessResult[] = [];
  guessInput = '';
  suggestions: { name: string; image: string }[] = [];
  won = false;
  loading = true;
  guessing = false;
  errorMsg: string | null = null;
  
  
  constructor() {
    addIcons({ arrowUp, arrowDown, checkmarkOutline, bookOutline });
  }

  ngOnInit(): void {
    this.pokemonService.loadAllNames().subscribe();
    this.loadNewPokemon();
    this.searchSubject.pipe(
      debounceTime(100),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.fetchSuggestions(searchText);
    });
  }

  loadNewPokemon(): void {
    this.loading = true;
    this.guesses = [];
    this.won = false;
    this.guessInput = '';
    this.errorMsg = null;
    this.secretPokemon = null;
    this.showSilhouette = false;

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
    this.searchSubject.next(this.guessInput);
  }

  private fetchSuggestions(searchText: string): void {
    const names = this.pokemonService.getSuggestions(searchText);
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
          this.pokemonService.salvarVitoria(this.secretPokemon!, this.guesses.length);
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
    this.submitGuess(new Event('submit'));
  }

  newGame(): void {
    this.loadNewPokemon();
  }

  abrirPokedex():void {
    this.router.navigate(['/pokedex'])
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
      types: this.compareTypesIndividually(guessed.types, secret.types),
      height: this.compareNum(guessed.height, secret.height),
      weight: this.compareNum(guessed.weight, secret.weight),
    };
  }

  private compareNum(guessed: number, secret: number): CompareResult {
    if (guessed === secret) { return 'correct'; }
    return guessed < secret ? 'higher' : 'lower';
  }

  private compareTypesIndividually(guessed: string[], secret: string[]): TypeComparison[] {
    // Se o Pokémon tem só 1 tipo, duplicamos para preencher os dois blocos
    const gTypes = guessed.length === 1 ? [guessed[0], guessed[0]] : [guessed[0], guessed[1]];
    const sTypes = secret.length === 1 ? [secret[0], secret[0]] : [secret[0], secret[1]];

    const result: TypeComparison[] = [];

    if (gTypes[0] === sTypes[0]) {
      result.push({ name: gTypes[0], status: 'correct' }); // Posição certa (Verde)
    } else if (gTypes[0] === sTypes[1]) {
      result.push({ name: gTypes[0], status: 'partial' }); // Posição errada (Amarelo)
    } else {
      result.push({ name: gTypes[0], status: 'wrong' });   // Não tem (Vermelho)
    }

    if (gTypes[1] === sTypes[1]) {
      result.push({ name: gTypes[1], status: 'correct' }); // Posição certa (Verde)
    } else if (gTypes[1] === sTypes[0]) {
      result.push({ name: gTypes[1], status: 'partial' }); // Posição errada (Amarelo)
    } else {
      result.push({ name: gTypes[1], status: 'wrong' });   // Não tem (Vermelho)
    }

    return result;
  }
  
}
