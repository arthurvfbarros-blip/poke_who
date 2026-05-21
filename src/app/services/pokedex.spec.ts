import { TestBed } from '@angular/core/testing';

import { Pokedex } from './pokedex';

describe('Pokedex', () => {
  let service: Pokedex;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pokedex);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
