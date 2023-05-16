import { useLoaderData } from "@remix-run/react";
import { json as remixJson } from '@remix-run/node';
import { useState } from "react";
import Team from "../components/team";

const GENERATION_RANGES = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1010],
  "Forms / Mega / Primal / GMax": [10001, 10271],
};

export const loader = async () => {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=100`;
  const response = await fetch(url);
  const json = await response.json();
  const pokemonPromises = json.results.map(async (pokemon) => {
    const spriteResponse = await fetch(pokemon.url);
    const spriteJson = await spriteResponse.json();
    const types = spriteJson.types.map((typeObj) => typeObj.type.name);
    return {
      id: spriteJson.id,
      name: pokemon.name,
      image: spriteJson.sprites.front_default,
      types: types,
    };
  });

  const pokemons = await Promise.all(pokemonPromises);

  return remixJson({ pokemons });
};

export default function IndexRoute() {
  const { pokemons } = useLoaderData();
  const [searchValue, setSearchValue] = useState("");
  const [team, setTeam] = useState([]);
  const [generation, setGeneration] = useState(1);

  const handleSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const addToTeam = (pokemon) => {
    setTeam((prevTeam) => [...prevTeam, pokemon]);
  };

  const [generationStart, generationEnd] = GENERATION_RANGES[generation];
  const filteredPokemons = pokemons
    .filter((pokemon) => pokemon.name.toLowerCase().includes(searchValue.toLowerCase()))
    .filter((pokemon) => pokemon.id >= generationStart && pokemon.id <= generationEnd);

  return (
    <main>
      <div className="text-center items-center" >
        <h1 className="text-3xl font-bold underline">PokéTeam Builder</h1>
          <Team team={team} />
      <form className="mb-6">
        <input
          type="text"
          placeholder="Search Pokemon..."
          value={searchValue}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
      <div className="flex justify-center space-x-4 mb-4">
        {Object.keys(GENERATION_RANGES).map((generationIndex) => (
            <button key={generationIndex} onClick={() => setGeneration(generationIndex)}>
              Generation {generationIndex}
            </button>
          ))}
      </div>
      </div>
      <div className="overflow-y-scroll max-h-full grid grid-cols-6 gap-6">
        {filteredPokemons.map((pokemon) => (
          <div key={pokemon.name} className="border rounded-lg overflow-hidden text-center">
            <div className="flex justify-center">
              <img src={pokemon.image} alt={pokemon.name} className="h-48" />
            </div>
            <div className="">
              <h3 className="font-bold text-lg">{pokemon.name}</h3>
              <button onClick={() => addToTeam(pokemon)} >Add to Team</button>
            </div>
            <div className={`grid ${pokemon.types.length === 2 ? 'grid-cols-2' : ''}`}>
              {pokemon.types.map((type) => <p>{type}</p>)}
            </div>
          </div>
        ))}
      </div>
    </main>
    );
}