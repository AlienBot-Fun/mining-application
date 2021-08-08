;(function(){

    const fetch = __webpack_require__(/*! node-fetch */ "./node_modules/node-fetch/browser.js");
    const { deserialize, ObjectSchema } = __webpack_require__(/*! atomicassets */ "./node_modules/atomicassets/build/index.js");
    const Int64LE = __webpack_require__(/*! int64-buffer */ "./node_modules/int64-buffer/int64-buffer.js").Int64LE;
    const { Serialize } = __webpack_require__(/*! eosjs */ "./node_modules/eosjs/dist/index.js");

    const land_schema = [
    { name: 'cardid', type: 'uint16' },
    { name: 'name', type: 'string' },
    { name: 'img', type: 'image' },
    { name: 'backimg', type: 'image' },
    { name: 'commission', type: 'uint16' },
    { name: 'planet', type: 'uint64' },
    { name: 'rarity', type: 'string' },
    { name: 'delay', type: 'uint8' },
    { name: 'difficulty', type: 'uint8' },
    { name: 'ease', type: 'uint8' },
    { name: 'luck', type: 'uint8' },
    { name: 'x', type: 'uint16' },
    { name: 'y', type: 'uint16' },
    { name: 'last_mine', type: 'uint32' }
    ]

    const intToName = (int) => {
        int = new Int64LE(int);

        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder
        });

        sb.pushArray(int.toArray());

        const name = sb.getName();

        return name;
    }

    const stake = async (token_account, federation_account, account, planet_name, quantity, eos_api) => {
        const actions = [{
            account: token_account,
            name: 'transfer',
            authorization: [{
                actor: account,
                permission: 'active',
            }],
            data: {
                from: account,
                to: federation_account,
                quantity,
                memo: 'staking'
            }
        }];

        actions.push({
            account: federation_account,
            name: 'stake',
            authorization: [{
                actor: account,
                permission: 'active',
            }],
            data: {
                account,
                planet_name,
                quantity
            }
        });

        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    };


    const unstake = async (federation_account, token_account, account, planet_name, quantity, eos_api) => {
        const actions = [];

        // get planet symbol from federation account
        const planet_res = await eos_api.rpc.get_table_rows({code: federation_account, scope: federation_account, table: 'planets', limit: 1, lower_bound: planet_name, upper_bound: planet_name});

        if (!planet_res.rows.length){
            throw new Error(`Could not find planet ${planet_name}`);
        }

        const [precision, sym] = planet_res.rows[0].dac_symbol.split(',');
        // fix decimals
        quantity = parseFloat(quantity).toFixed(precision);
        quantity = `${quantity} ${sym}`;

        actions.push({
            account: token_account,
            name: 'transfer',
            authorization: [{
                actor: account,
                permission: 'active',
            }],
            data: {
                from: account,
                to: federation_account,
                quantity: quantity,
                memo: 'Unstaking'
            }
        });

        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    };


    const refund = async (federation_account, account, refund_id, eos_api) => {
        const actions = [];

        actions.push({
            account: federation_account,
            name: 'refund',
            authorization: [{
                actor: account,
                permission: 'active',
            }],
            data: {
                id: refund_id
            }
        });

        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    };

    const getMap = async (federation_account, planet_name, eos_api) => {
        const res = await eos_api.rpc.get_table_rows({code: federation_account, scope: planet_name, table: 'maps', limit: 1000});
        const map = [];
        res.rows.forEach((row) => {
            if (typeof map[row.x] === 'undefined'){
                map[row.x] = [];
            }

            map[row.x][row.y] = row.asset_id;
        });

        return map;
    }

    const getBalance = async (account, eos_rpc) => {
        const res = await eos_rpc.get_table_rows({code: 'alien.worlds', scope: account, table: 'accounts', limit: 1});

        let balance = '0.0000 TLM';
        if (res.rows.length){
            balance = res.rows[0].balance;
        }

        return balance;
    }

    const getStaked = async (federation_account, account, eos_rpc) => {
        // Get a list of the planets and then get balance for each
        const planets_res = await eos_rpc.get_table_rows({code: federation_account, scope: federation_account, table: 'planets', limit: 100});

        const bal_res = await eos_rpc.get_currency_balance('token.worlds', account);

        const planet_tokens = {};
        let total = 0;

        if (planets_res.rows.length){
            planets_res.rows.forEach((p) => {
                if (p.active){
                    const planet_sym = p.dac_symbol.split(',')[1];
                    let planet_balance = `0.0000 ${planet_sym}`;
                    bal_res.forEach((bal_str) => {
                        const [amount, sym] = bal_str.split(' ');
                        if (planet_sym === sym){
                            planet_balance = bal_str;
                        }
                    });
                    const [amount, symbol] = planet_balance.split(' ');

                    planet_tokens[p.planet_name] = {amount, symbol};

                    total += parseFloat(amount);
                }
            });
        }

        const planet_tokens_a = [];
        for (let p in planet_tokens){
            const pa = planet_tokens[p];
            pa.planet_name = p;
            planet_tokens_a.push(pa);
        }

        return {staked: planet_tokens_a, total};
    }

    const getUnstakes = async (federation_account, account, eos_rpc) => {
        const refunds_res = await eos_rpc.get_table_rows({
            code: federation_account,
            scope: federation_account,
            table: 'refunds',
            index_position: 2,
            key_type: 'i64',
            upper_bound: account,
            lower_bound: account,
            limit: 100
        });

        return refunds_res.rows;
    }

    const getAssetsOld = async (account, aa_endpoints, collection, schema = '', tries = 0) => {
        if (typeof aa_endpoints === 'string'){
            aa_endpoints = [aa_endpoints];
        }
        aa_endpoint = aa_endpoints[tries];
        console.log(`Trying endpoint ${aa_endpoint} for try ${tries}`);

        try {
            let url = `${aa_endpoint}/atomicassets/v1/assets?collection_name=${collection}&owner=${account}&limit=200`
            if (schema){
                url += `&schema_name=${schema}`
            }
            const res = await fetch(url);
            const res_json = await res.json();
            // console.log(res_json);
            if (typeof res_json !== 'object') {
                throw new Error('There was a temporary error on the server, please wait a few minutes and refresh the page to try again');
            }
            if (res_json.errors && res_json.errors.length){
                // console.log(res_json.errors[0].extensions);
                if (res_json.errors[0].extensions.code === 'rate-limit'){
                    throw new Error('The server is currently overloaded, please wait a few minutes and refresh the page to try again');
                }
                else {
                    throw new Error(res_json.errors[0].message);
                }
            }

            if (res_json.success === false){
                throw new Error(res_json.message);
            }
            const assets = res_json.data;

            const tools_map = new Map();
            for (let a=0; a<assets.length; a++){
                const asset = assets[a];
                if (schema === 'land.worlds'){
                    tools_map.set(asset.asset_id, asset);
                }
                else {
                    const identifier = `${asset.data.cardid}|${asset.data.shine}`;
                    asset.quantity = 1;
                    if (!tools_map.has(identifier)){
                        asset.asset_ids = [asset.asset_id];
                        delete asset.asset_id;
                        tools_map.set(identifier, {owner: asset.owner, data: asset.data, asset_ids: asset.asset_ids, quantity: asset.quantity});
                    }
                    else {
                        const tool = tools_map.get(identifier);
                        tool.asset_ids.push(asset.asset_id);
                        tool.quantity++;
                        tools_map.set(identifier, tool);
                    }
                }
            }

            return Array.from(tools_map.values());
        }
        catch (e){
            error_msg = e.message
    //        console.error(error_msg);

            if (tries >= aa_endpoints.length - 1){
                throw e;
            }
            else {
                return await getAssets(account, aa_endpoints, collection, schema, ++tries)
            }
        }
    }

    const addLandData = async (asset, eos_rpc) => {
    //    console.log(`Asset.assetID: ${asset.asset_id}`);
        const assets_res = await eos_rpc.get_table_rows({
            code: 'atomicassets',
            scope: asset.owner,
            table: 'assets',
            lower_bound: asset.asset_id,
            upper_bound: asset.asset_id
        });
        const schema = ObjectSchema(land_schema);
        const template_data_m = deserialize(assets_res.rows[0].mutable_serialized_data, schema);
        const template_data_i = deserialize(assets_res.rows[0].immutable_serialized_data, schema);
    //     console.log(`Template Data M: ${template_data_m}`)
    //     console.log(`Template Data I: ${template_data_i}`)
        asset.data.commission = template_data_m.commission;
        asset.data.x = template_data_i.x;
        asset.data.y = template_data_i.y;
        asset.data.planet = intToName(asset.data.planet);
    //    console.log(`Land Data Planet: ${asset.data.planet}`);

        return asset;
    }

    const getAssetById = async (asset_ids, api_endpoints, eos_rpc, tries = 0) => {
        if (typeof asset_ids === 'string'){
            asset_ids = [asset_ids];
        }
        if (typeof api_endpoints === 'string'){
            api_endpoints = [api_endpoints];
        }
        const api_endpoint = api_endpoints[tries];

        try {
            let url = `${api_endpoint}/v1/alienworlds/asset?id=${asset_ids.join(',')}`;
            const res = await fetch(url);
            const res_json = await res.json();
            // console.log(res_json);
            const assets = [];
            for await (let asset of res_json.results){
                // let asset = res_json.results[a];
                if (asset.schema_name === 'land.worlds'){
                    asset = await addLandData(asset, eos_rpc);
                }
                asset.name = asset.data.name;

                assets.push(asset);
            }

            return assets;
        }
        catch (e){
            error_msg = e.message

            if (tries >= api_endpoints.length - 1){
                throw e;
            }
            else {
                return await getAssetById(asset_ids, api_endpoints, eos_rpc, ++tries)
            }
        }
    }

    const getAssets = async (account, api_endpoints, eos_rpc, schema = '', tries = 0) => {
        if (typeof api_endpoints === 'string'){
            api_endpoints = [api_endpoints];
        }
        api_endpoint = api_endpoints[tries];
        console.log(`Trying endpoint ${api_endpoint} for try ${tries}`);

        try {
            let url = `${api_endpoint}/v1/alienworlds/asset?owner=${account}&limit=200`
            if (schema){
                url += `&schema=${schema}`
            }
    //         console.log(`Calling URL: ${url}`);

            const res = await fetch(url);
            const res_json = await res.json();
    //        console.log(`Got Response: ${res_json}`);
            if (typeof res_json !== 'object') {
                throw new Error('There was a temporary error on the server, please wait a few minutes and refresh the page to try again');
            }
            if (res_json.errors && res_json.errors.length){
    //            console.log(`Got Error: ${res_json.errors[0].extensions}`);
                if (res_json.errors[0].extensions.code === 'rate-limit'){
                    throw new Error('The server is currently overloaded, please wait a few minutes and refresh the page to try again');
                }
                else {
    //                console.log(`Got Throw Error: ${res_json.errors[0].message}`);
                    throw new Error(res_json.errors[0].message);
                }
            }

            if (res_json.success === false){
                throw new Error(res_json.message);
            }
            const assets = res_json.results;
            //console.log(res_json);

            const tools_map = new Map();
            for (let a=0; a<assets.length; a++){
                let asset = assets[a];
                asset.name = assets[a].data.name;
    //            console.log(`Got Asset: ${asset.asset_id}`);
                if (schema === 'land.worlds'){
                    // get the commission from mutable data
                    asset = await addLandData(asset, eos_rpc);
                    tools_map.set(asset.asset_id, asset);
                }
                else {
                    const identifier = `${asset.data.cardid}|${asset.data.shine}`;
                    asset.quantity = 1;
                    if (!tools_map.has(identifier)){
                        asset.asset_ids = [asset.asset_id];
                        delete asset.asset_id;
                        tools_map.set(identifier, {owner: asset.owner, data: asset.data, asset_ids: asset.asset_ids, quantity: asset.quantity});
                    }
                    else {
                        const tool = tools_map.get(identifier);
                        tool.asset_ids.push(asset.asset_id);
                        tool.quantity++;
                        tools_map.set(identifier, tool);
                    }
                }
            }

            return Array.from(tools_map.values());
        }
        catch (e){
            error_msg = e.message
            // console.error(error_msg);

            if (tries >= api_endpoints.length - 1){
                throw e;
            }
            else {
                return await getAssets(account, api_endpoints, schema, ++tries)
            }
        }
    }

    const agreeTerms = async (federation_account, account, terms_id, terms_hash, eos_api) => {
        const actions = [];

        actions.push({
            account: federation_account,
            name: 'agreeterms',
            authorization: [{
                actor: account,
                permission: 'active',
            }],
            data: {
                account,
                terms_id,
                terms_hash
            }
        });

        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    }

    const agreedTermsVersion = async (federation_account, account, eos_rpc) => {
        const terms_res = await eos_rpc.get_table_rows({
            code: federation_account,
            scope: federation_account,
            table: 'userterms',
            upper_bound: account,
            lower_bound: account,
            limit: 1
        });

        if (terms_res.rows.length){
            return terms_res.rows[0].terms_id;
        }

        return 0;
    }

    const axon = __webpack_require__(/*! axon */ "./node_modules/axon/index.js");

    const subscribe = async (account, callback, ws_host = 'api-ws.alienworlds.io', ws_port = 3000, test = false) => {
        const sock = axon.socket('sub-emitter');

        sock.connect(ws_port, ws_host);

        const sub = (test)?`test:test`:`asset:${account}`;

        sock.on(sub, function(msg){
            if (msg && msg.action === 'mint'){
                callback(msg);
            }
        });
    }

    module.exports = { stake, unstake, refund, getMap, getBalance, getStaked, getUnstakes, subscribe, getAssets, getAssetById, getAssetsOld, agreeTerms, agreedTermsVersion }



    //# sourceURL=webpack:///./src/federation.js?
})