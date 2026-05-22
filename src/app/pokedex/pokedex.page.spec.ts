import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { PokedexPage } from './pokedex.page';
import { PokemonService } from '../services/pokemon.service';
import { GameStat, Pokemon } from '../services/pokemon.service';

const mockPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  generation: 1,
  types: ['electric'],
  height: 0.4,
  weight: 6.0,
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
};

const mockStats: GameStat[] = [
  {
    pokemon: mockPokemon,
    attempts: 3,
  },
];

describe('PokedexPage', () => {
  let component: PokedexPage;
  let fixture: ComponentFixture<PokedexPage>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;

  beforeEach(async () => {
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', [
      'getStats',
      'clearStats',
    ]);
    pokemonServiceSpy.getStats.and.returnValue(mockStats);

    await TestBed.configureTestingModule({
      imports: [PokedexPage],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ pokemonId: String(mockPokemon.id) }),
            },
          },
        },
        { provide: PokemonService, useValue: pokemonServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load stats on init', () => {
    expect(pokemonServiceSpy.getStats).toHaveBeenCalled();
    expect(component.lastAttempt).toBe(3);
    expect(component.bestAttempt).toBe(3);
    expect(component.discoveredPokemon).toEqual([mockPokemon]);
  });

  it('should highlight the pokemon received from route param', () => {
    expect(component.highlightedPokemon).toEqual(mockPokemon);
  });

  it('should clear stats and reset local state', () => {
    component.resetStats();

    expect(pokemonServiceSpy.clearStats).toHaveBeenCalled();
    expect(component.lastAttempt).toBeNull();
    expect(component.bestAttempt).toBeNull();
    expect(component.discoveredPokemon).toEqual([]);
  });
});
