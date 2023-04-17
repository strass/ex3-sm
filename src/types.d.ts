interface Character {
  name: string;
}

interface Combatant extends Pick<Character, "name"> {
  initiative: number | null;
  acted: boolean;
}
