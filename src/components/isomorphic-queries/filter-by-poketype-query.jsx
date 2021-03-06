export default class FilterByPokeTypeQuery {
    execute(data, pokeType) {
        let output = [];

        if (pokeType && pokeType.ename !== 'All') {
            let test = JSON.stringify(pokeType);

            for (let i = 0, len = data.length; i < len; i++) {
                let item = data[i];

                for (let t = 0, tlen = item.type.length; t < tlen; t++) {
                    let itemType = item.type[t];

                    if (test.indexOf(itemType) > -1) {
                        output.push(item);
                        break;
                    }
                }
            }
        } else {
            output = data;
        }

        return output;
    }
};
