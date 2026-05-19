import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'pokemonType',
    standalone: true
})

export class PokemonTypePipe implements PipeTransform {
  transform(type: string): string {
    if (!type) return '';
    const typeDictionary: { [key: string]: string } = {
      normal: '⚪ Normal',
      fire: '🔥 Fogo',
      water: '💧 Água',
      grass: '🌿 Planta',
      electric: '⚡ Elétrico',
      ice: '❄️ Gelo',
      fighting: '🥊 Lutador',
      poison: '☠️ Venenoso',
      ground: '🪨 Terrestre',
      flying: '🦅 Voador',
      psychic: '🔮 Psíquico',
      bug: '🐛 Inseto',
      rock: '🪨 Pedra',
      ghost: '👻 Fantasma',
      dragon: '🐉 Dragão',
      dark: '🌙 Sombrio',
      steel: '⚙️ Aço',
      fairy: '✨ Fada'
    };

    return typeDictionary[type.toLowerCase()] || type;
  }
}