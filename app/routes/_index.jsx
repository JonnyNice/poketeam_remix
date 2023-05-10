
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
    return {
      name: pokemon.name,
      image: spriteJson.sprites.front_default,
    };
  });

  const pokemons = await Promise.all(pokemonPromises);

  return remixJson({ pokemons });
};

export default function IndexRoute() {
  const { pokemons } = useLoaderData();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <main>
      <h1 className="text-3xl font-bold underline">PokéTeam Builder</h1>
      <form className="mb-6">
        <input
          type="text"
          placeholder="Search Pokemon..."
          value={searchValue}
          onChange={handleSearch}
          className="px-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
      <div className="overflow-y-scroll max-h-96 grid grid-cols-6 gap-6">
        {filteredPokemons.map((pokemon) => (
          <div key={pokemon.name} className="border rounded-lg overflow-hidden">
            <img src={pokemon.image} alt={pokemon.name} className="" />
            <div className="">
              <h3 className="font-bold text-lg">{pokemon.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </main>
    );
}