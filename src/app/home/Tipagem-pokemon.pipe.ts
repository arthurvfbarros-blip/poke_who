import {Pipe, PipeTransform} from '@angular/core'

@Pipe({
    name: 'pokemonType',
    standalone: true
})

export class PokemonTypePipe implements PipeTransform {
  transform(types: string[]): string {
    if (!types || !Array.isArray(types)) return '';

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

    return types.map(t => typeDictionary[t.toLowerCase()] || t).join(' / ');
  }
}