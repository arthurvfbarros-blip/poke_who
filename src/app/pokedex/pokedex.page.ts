import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trophyOutline, timerOutline, trashOutline } from 'ionicons/icons';

import { PokemonService, Pokemon, GameStat } from '../services/pokemon.service'; 
import { PokemonTypePipe } from '../home/Tipagem-pokemon.pipe';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.page.html',
  styleUrls: ['./pokedex.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    PokemonTypePipe,
  ]
})
export class PokedexPage implements OnInit {
  private readonly router = inject(Router);
  private readonly pokemonService = inject(PokemonService);

  ultimaTentativa: number | null = null;
  melhorTentativa: number | null = null;
  pokemonsDescobertos: Pokemon[] = [];

  constructor() {
    addIcons({ closeOutline, trophyOutline, timerOutline, trashOutline });
  }

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    const stats: GameStat[] = this.pokemonService.obterEstatisticas();
    
    if (stats.length > 0) {
      this.ultimaTentativa = stats[stats.length - 1].attempts;
      this.melhorTentativa = Math.min(...stats.map(s => s.attempts));

      const unicos = new Map<number, Pokemon>();
      stats.forEach(s => unicos.set(s.pokemon.id, s.pokemon));
      this.pokemonsDescobertos = Array.from(unicos.values());
    }
  }

  formatName(name: string): string {
    return name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }

  reiniciarEstatisticas(): void{
    this.pokemonService.limparEstatisticas();
    this.ultimaTentativa = null;
    this.melhorTentativa = null;
    this.pokemonsDescobertos = [];
  }

}