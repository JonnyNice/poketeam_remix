import { useEffect, useState } from 'react';

function Team({ team }) {
    const [typeData, setTypeData] = useState({});
    const [teamWeaknesses, setTeamWeaknesses] = useState([]);

    useEffect(() => {
        async function fetchTypeData() {
        const typeData = {};

        for (const pokemon of team) {
            for (const type of pokemon.types) {
                const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
                const json = await response.json();
            typeData[type] = json;
            }
        }

        setTypeData(typeData);
        }

        fetchTypeData();
    }, [team]);

    useEffect(() => {
        function calculateTeamWeaknesses() {
            const weaknesses = {};
            const strengths = {};
            for (const pokemon of team) {
                for (const type of pokemon.types) {
                const typeDataForPokemon = typeData[type];
                if (typeDataForPokemon && typeDataForPokemon.damage_relations) {
                    for (const weakType of typeDataForPokemon.damage_relations.double_damage_from) {
                    if (weakType.name in weaknesses) {
                        weaknesses[weakType.name]++;
                    } else {
                        weaknesses[weakType.name] = 1;
                    }
                }

                for (const strongType of typeDataForPokemon.damage_relations.double_damage_to) {
                    if (strongType.name in strengths) {
                        strengths[strongType.name]++;
                    } else {
                        strengths[strongType.name] = 1;
                    }
                    }
                }
                }
            }

            for (const type in strengths) {
                if (type in weaknesses) {
                    const cancelCount = Math.min(strengths[type], weaknesses[type]);
                    strengths[type] -= cancelCount;
                    weaknesses[type] -= cancelCount;
                }
            }

            const teamWeaknesses = Object.entries(weaknesses)
                .filter(([type, count]) => count > 0)
                .map(([type, count]) => ({
                    type,
                    count,
                }));
            setTeamWeaknesses(teamWeaknesses);
        }

        calculateTeamWeaknesses();
    }, [team, typeData]);

    return (
        <div>
            <div className="outline-2 grid grid-cols-6 gap-4 place-items-center">
                {team.map((pokemon) => (
            <div key={pokemon.name}>
                <img src={pokemon.image} alt={pokemon.name} />
                    <h3>{pokemon.name}</h3>
                <div className={`grid ${pokemon.types.length === 2 ? 'grid-cols-2' : ''}`}>
                {pokemon.types.map((type) => (
                    <p key={type} className={`type-${type}`}>
                    {type}
                    </p>
                ))}
                </div>
            </div>
            ))}
        </div>
        {teamWeaknesses.length > 0 && (
            <div>
                <h3>Team Weaknesses:</h3>
            <ul>
                {teamWeaknesses.map(({ type, count }) => (
                <li key={type}>{`${type} (${count}x)`}</li>
                ))}
            </ul>
            </div>
        )}
        </div>
    );
}

export default Team;