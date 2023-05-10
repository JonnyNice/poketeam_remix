
import { useLoaderData } from "@remix-run/react";
import { json as remixJson } from '@remix-run/node';
import { useState } from "react";

export const loader = async () => {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=151";
  const response = await fetch(url);
  const json = await response.json();
  const pokemonPromises = json.results.map(async (pokemon) => {
    const spriteResponse = await fetch(pokemon.url);
    const spriteJson = await spriteResponse.json();
    const types = spriteJson.types.map((typeObj) => typeObj.type.name);
    return {
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

  const handleSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const addToTeam = (pokemon) => {
    setTeam((prevTeam) => [...prevTeam, pokemon]);
  };

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <main>
      <div className="text-center items-center" >
      <h1 className="text-3xl font-bold underline">PokéTeam Builder</h1>
      <div className="outline-2 grid grid-cols-6 gap-4 place-items-center">
        {team.map((pokemon) => (
            <div key={pokemon.name}>
              <img src={pokemon.image} alt={pokemon.name} />
              <h3>{pokemon.name}</h3>
              {pokemon.types.map((type) => (
                <span key={type.name} className="mr-2">
                  {type.name}
                </span>
              ))}
            </div>
          ))}
      </div>
      <form className="mb-6">
        <input
          type="text"
          placeholder="Search Pokemon..."
          value={searchValue}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
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