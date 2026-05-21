import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trophyOutline, timerOutline } from 'ionicons/icons';

// Importe o serviço e as interfaces
import { PokemonService, Pokemon, GameStat } from '../services/pokemon.service'; 

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.page.html',
  styleUrls: ['./pokedex.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ]
})
export class PokedexPage implements OnInit {
  private readonly router = inject(Router);
  private readonly pokemonService = inject(PokemonService);

  ultimaTentativa: number | null = null;
  melhorTentativa: number | null = null;
  pokemonsDescobertos: Pokemon[] = [];

  constructor() {
    addIcons({ closeOutline, trophyOutline, timerOutline });
  }

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    const stats: GameStat[] = this.pokemonService.obterEstatisticas();
    
    if (stats.length > 0) {
      // Pega o número de tentativas do último item do array
      this.ultimaTentativa = stats[stats.length - 1].attempts;
      
      // Encontra o menor número de tentativas de todo o histórico
      this.melhorTentativa = Math.min(...stats.map(s => s.attempts));

      // Filtra os Pokémon para não mostrar repetições na galeria
      const unicos = new Map<number, Pokemon>();
      stats.forEach(s => unicos.set(s.pokemon.id, s.pokemon));
      this.pokemonsDescobertos = Array.from(unicos.values());
    }
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }
}