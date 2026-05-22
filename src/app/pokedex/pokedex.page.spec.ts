import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { PokedexPage } from './pokedex.page';
import { PokemonService } from '../services/pokemon.service';

describe('PokedexPage', () => {
  let component: PokedexPage;
  let fixture: ComponentFixture<PokedexPage>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;

  beforeEach(async () => {
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', [
      'obterEstatisticas',
      'limparEstatisticas',
    ]);
    pokemonServiceSpy.obterEstatisticas.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [PokedexPage],
      providers: [
        provideIonicAngular(),
        provideRouter([]),
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
});
