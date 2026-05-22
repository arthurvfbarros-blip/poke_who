/// <reference types="jasmine" />
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { HomePage } from './home.page';
import { PokemonService, Pokemon } from '../services/pokemon.service';

const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  generation: 1,
  types: ['electric'],
  height: 0.4,
  weight: 6.0,
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
};

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;

  beforeEach(async () => {
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', [
      'getRandomPokemon',
      'fetchPokemon',
      'loadAllNames',
      'getSuggestions',
      'getPokemonImage',
      'saveVictory',
    ]);

    pokemonServiceSpy.getRandomPokemon.and.returnValue(of(mockPokemon));
    pokemonServiceSpy.fetchPokemon.and.returnValue(of(mockPokemon));
    pokemonServiceSpy.loadAllNames.and.returnValue(of([] as any));
    pokemonServiceSpy.getSuggestions.and.returnValue([]);
    pokemonServiceSpy.getPokemonImage.and.returnValue(of(''));

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideIonicAngular(),
        { provide: PokemonService, useValue: pokemonServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a random pokémon on init', () => {
    expect(pokemonServiceSpy.getRandomPokemon).toHaveBeenCalledTimes(1);
    expect(component.hiddenPokemon).toEqual(mockPokemon);
    expect(component.isLoading).toBeFalse();
  });

  it('should add a guess to history on submitGuess', () => {
    component.guessInput = 'pikachu';
    component.submitGuess();
    expect(pokemonServiceSpy.fetchPokemon).toHaveBeenCalledWith('pikachu');
    expect(component.guesses.length).toBe(1);
  });

  it('should set hasWon to true when correct pokémon is guessed', () => {
    component.guessInput = 'pikachu';
    component.submitGuess();
    expect(component.hasWon).toBeTrue();
  });

  it('should reset state on startNewGame', () => {
    component.hasWon = true;
    component.guesses = [{ 
      pokemon: mockPokemon, 
      comparison: { 
        generation: 'correct', 
        types: [{ name: 'electric', status: 'correct' }], 
        height: 'correct', 
        weight: 'correct' 
      } 
    }];    
    component.startNewGame();
    
    expect(pokemonServiceSpy.getRandomPokemon).toHaveBeenCalledTimes(2);
    expect(component.hasWon).toBeFalse();
    expect(component.guesses.length).toBe(0);
  });

  it('should format name with hyphens correctly', () => {
    expect(component.formatName('mr-mime')).toBe('Mr Mime');
    expect(component.formatName('pikachu')).toBe('Pikachu');
  });
});
