import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pokemonService = inject(PokemonService);

  lastAttempt: number | null = null;
  bestAttempt: number | null = null;
  discoveredPokemon: Pokemon[] = [];
  highlightedPokemon: Pokemon | null = null;

  constructor() {
    addIcons({ closeOutline, trophyOutline, timerOutline, trashOutline });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const stats: GameStat[] = this.pokemonService.getStats();
    // Pega o parâmetro da rota como string para podermos verificar se ele existe
    const paramId = this.route.snapshot.paramMap.get('pokemonId');
    
    if (stats.length > 0) {
      this.lastAttempt = stats[stats.length - 1].attempts;
      this.bestAttempt = Math.min(...stats.map(s => s.attempts));

      const uniquePokemon = new Map<number, Pokemon>();
      stats.forEach((stat) => uniquePokemon.set(stat.pokemon.id, stat.pokemon));
      this.discoveredPokemon = Array.from(uniquePokemon.values());
      
      if (paramId) {
        const highlightedPokemonId = Number(paramId);
        this.highlightedPokemon = this.discoveredPokemon.find(
          (pokemon) => pokemon.id === highlightedPokemonId
        ) ?? null;
      } else {
        this.highlightedPokemon = stats[stats.length - 1].pokemon;
      }
      return;
    }

    this.highlightedPokemon = null;
  }

  formatName(name: string): string {
    return name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  resetStats(): void {
    this.pokemonService.clearStats();
    this.lastAttempt = null;
    this.bestAttempt = null;
    this.discoveredPokemon = [];
    this.highlightedPokemon = null;
  }
}
