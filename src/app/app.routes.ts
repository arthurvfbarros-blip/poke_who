import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'rules',
    loadComponent: () => import('./rules/rules.page').then((m) => m.RulesPage),
  },
  {
    path: 'pokedex',
    loadComponent: () => import('./pokedex/pokedex.page').then((m) => m.PokedexPage),
  },
  {
    path: 'pokedex/:pokemonId',
    loadComponent: () => import('./pokedex/pokedex.page').then((m) => m.PokedexPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
