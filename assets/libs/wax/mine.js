;(function(){
        
    /* WEBPACK VAR INJECTION */(function(Buffer) {const crypto = __webpack_require__(/*! crypto */ "./node_modules/crypto-browserify/index.js");
    const fetch = __webpack_require__(/*! node-fetch */ "./node_modules/node-fetch/browser.js");
    const { Serialize } = __webpack_require__(/*! eosjs */ "./node_modules/eosjs/dist/index.js");
    const {TextDecoder, TextEncoder} = __webpack_require__(/*! text-encoding */ "./node_modules/text-encoding/index.js");
    const Int64LE = __webpack_require__(/*! int64-buffer */ "./node_modules/int64-buffer/int64-buffer.js").Int64LE;
    const { getAssetById } = __webpack_require__(/*! ./federation */ "./src/federation.js");

    /* Utility functions */
    const getRand = () => {
        const arr = new Uint8Array(8);
        for (let i=0; i < 8; i++){
            const rand = parseInt(Math.floor(Math.random() * 255));
            arr[i] = rand;
        }
        return arr;
    };

    const pushRand = (sb) => {
        const arr = getRand();
        sb.pushArray(arr);
        return arr;
    };


    /* uint8array to / from hex strings */
    const fromHexString = hexString =>
        new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    const toHexString = bytes =>
        bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    const nameToInt = (name) => {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder
        });

        sb.pushName(name);

        const name_64 = new Int64LE(sb.array);

        return name_64 + '';
    }

    const nameToArray = (name) => {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder
        });

        sb.pushName(name);

        return sb.array;
    }

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


    const setPlayerData = async (federation_account, account, eos_api, tag='', avatar_id=0, permission = 'active') => {
        const actions = [];
        actions.push({
            account: federation_account,
            name: 'setavatar',
            authorization: [{
                actor: account,
                permission: permission
            }],
            data: {
                account,
                avatar_id
            }
        });
        actions.push({
            account: federation_account,
            name: 'settag',
            authorization: [{
                actor: account,
                permission: permission
            }],
            data: {
                account,
                tag
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

    const setTagData = async (federation_account, account, eos_api, tag, permission = 'active') => {
        const actions = [];
        actions.push({
            account: federation_account,
            name: 'settag',
            authorization: [{
                actor: account,
                permission: permission
            }],
            data: {
                account,
                tag
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

    const getPlayerData = async (federation_account, account, eos_rpc, api_endpoints) => {

        const player_res = await eos_rpc.get_table_rows({
            code: federation_account,
            scope: federation_account,
            table: 'players',
            lower_bound: account,
            upper_bound: account
        });

        const player_data = {
            tag: '',
            avatar: ''
        };

        if (player_res.rows.length){
            player_data.tag = player_res.rows[0].tag;
            if (player_res.rows[0].avatar > 0){
                const asset = await getAssetById(player_res.rows[0].avatar, api_endpoints, eos_rpc);
                if (asset && asset.length){
                    player_data.avatar = asset[0];
                }
            }
        }

        return player_data;

    };


    const getPlanets = async (federation_account, mining_account, eos_rpc) => {
        const planets_res = await eos_rpc.get_table_rows({code: federation_account, scope: federation_account, table: 'planets', limit: 100});

        const planets = [];
        for (let p = 0; p < planets_res.rows.length; p++){
            const pr = planets_res.rows[p];
            if (pr.planet_name === 'bina.world'){continue;}

            try {
                pr.metadata = JSON.parse(pr.metadata);
            }
            catch (e){
                pr.metadata = {};
            }

            // trilium reserve
            const planet_reserve = await eos_rpc.get_currency_balance('alien.worlds', pr.planet_name, 'TLM');
            pr.reserve = planet_reserve[0];

            // mining pot
            const mining_pot_res = await eos_rpc.get_table_rows({
                code: mining_account,
                scope: pr.planet_name,
                table: 'state3'
            });
            if (mining_pot_res.rows.length){
                pr.mining_pot = {
                    fill_rate: mining_pot_res.rows[0].fill_rate,
                    bucket_total: mining_pot_res.rows[0].bucket_total,
                    mine_bucket: mining_pot_res.rows[0].mine_bucket,
                    allocated_percentage: 80
                };
            }

            const [dac_precision, dac_symbol] = pr.dac_symbol.split(',');
            pr.total_stake = (pr.total_stake / Math.pow(10, parseInt(dac_precision))).toFixed(dac_precision);
            pr.total_stake = `${pr.total_stake} ${dac_symbol}`;

            pr.active = !!pr.active;
            planets.push(pr);
        }

        return planets;
    };

    const getBag = async (mining_account, account, eos_rpc, api_endpoints) => {
        const bag_res = await eos_rpc.get_table_rows({code: mining_account, scope: mining_account, table: 'bags', lower_bound: account, upper_bound: account});
        let bag = [];
        if (bag_res.rows.length){
            bag = await getAssetById(bag_res.rows[0].items, api_endpoints, eos_rpc);
        }
        return bag;
    }

    const setBag = async (mining_account, account, items, eos_api, permission = 'active') => {
        const actions = [{
            account: mining_account,
            name: 'setbag',
            authorization: [{
                actor: account,
                permission: permission,
            }],
            data: {
                account,
                items: items.slice(0, 3)
            }
        }];
        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    }

    const getLand = async (mining_account, account, eos_rpc, api_endpoints) => {
        try {
            const miner_res = await eos_rpc.get_table_rows({
                code: mining_account,
                scope: mining_account,
                table: 'miners',
                lower_bound: account,
                upper_bound: account
            });

            let land_id;
            if (miner_res.rows.length === 0){
                return null;
            }
            else {
                land_id = miner_res.rows[0].current_land;
            }

            const assets = await getAssetById([land_id], api_endpoints, eos_rpc);
            if (assets.length){
                return assets[0];
            }
        }
        catch (e) {
            console.error(`Failed to get land - ${e.message}`);
        }

        return null;
    }

    const setLand = async (mining_account, account, land_id, eos_api, permission = 'active') => {
        const actions = [{
            account: mining_account,
            name: 'setland',
            authorization: [{
                actor: account,
                permission: permission,
            }],
            data: {
                account,
                land_id
            }
        }];
        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    }

    /*const getLandByPlanet = async (planet_name, atomic_endpoint, collection, schema = 'land.worlds') => {
        const planet_int = nameToInt(planet_name);

        // https://test.wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=test.worlds&schema_name=land.worlds&data.planet=6310955965768028672

        const url = `${atomic_endpoint}/atomicassets/v1/assets?collection_name=${collection}&schema_name=${schema}&data.planet=${planet_int}`;
        const res = await fetch(url);

        const json = await res.json();

        return json.data.map(d => {
            // console.log('ddd', d)
            let commission = d.mutable_data.commission || 0;
            // console.log(commission);
            return {
                id: d.asset_id,
                name: d.name,
                owner: d.owner,
                commission: (commission / 100).toFixed(2)
            }
        });
    }*/


    const getLandMiningParams = (land) => {
        const mining_params = {
            delay: 0,
            difficulty: 0,
            ease: 0
        };

        mining_params.delay += land.data.delay;
        mining_params.difficulty += land.data.difficulty;
        mining_params.ease += land.data.ease;

        return mining_params;
    };

    const getBagMiningParams = (bag) => {
        const mining_params = {
            delay: 0,
            difficulty: 0,
            ease: 0
        };

        let min_delay = 65535;

        for (let b=0; b < bag.length; b++){
            if (bag[b].data.delay < min_delay){
                min_delay = bag[b].data.delay;
            }
            mining_params.delay += bag[b].data.delay;
            mining_params.difficulty += bag[b].data.difficulty;
            mining_params.ease += bag[b].data.ease / 10;
        }

        if (bag.length === 2){
            mining_params.delay -= parseInt(min_delay / 2);
        }
        else if (bag.length === 3){
            mining_params.delay -= min_delay;
        }

        return mining_params;
    };

    /* Return number of ms before we can next mine */
    const getNextMineDelay = async (mining_account, account, params, eos_rpc) => {
        const state_res = await eos_rpc.get_table_rows({
            code: mining_account,
            scope: mining_account,
            table: 'miners',
            lower_bound: account,
            upper_bound: account
        });

        let ms_until_mine = -1;
        const now = new Date().getTime();
        console.log(`Delay = ${params.delay}`);

        if (state_res.rows.length && state_res.rows[0].last_mine_tx !== '0000000000000000000000000000000000000000000000000000000000000000'){
            console.log(`Last mine was at ${state_res.rows[0].last_mine}, now is ${new Date()}`);
            const last_mine_ms = Date.parse(state_res.rows[0].last_mine + '.000Z');
            ms_until_mine = last_mine_ms + (params.delay * 1000) - now;

            if (ms_until_mine < 0){
                ms_until_mine = 0;
            }
        }
        console.log(`ms until next mine ${ms_until_mine}`);

        return ms_until_mine;
    };

    const lastMineTx = async (mining_account, account, eos_rpc) => {
        const state_res = await eos_rpc.get_table_rows({
            code: mining_account,
            scope: mining_account,
            table: 'miners',
            lower_bound: account,
            upper_bound: account
        });
        let last_mine_tx = '0000000000000000000000000000000000000000000000000000000000000000';
        if (state_res.rows.length){
            last_mine_tx = state_res.rows[0].last_mine_tx;
        }

        return last_mine_tx;
    };

    const doWork = async ({mining_account, account, difficulty, last_mine_tx}) => {
        let good = false, itr = 0, rand = 0, hash, sb, hex_digest, rand_arr;

        if (!last_mine_tx){
            console.error(`Please provide last mine tx`);
            return;
        }
        last_mine_tx = last_mine_tx.substr(0, 16); // only first 8 bytes of txid
        const last_mine_buf = Buffer.from(last_mine_tx, 'hex');
        const is_wam = account.substr(-4) === '.wam';
        // const is_wam = true;

        console.log(`Performing work with difficulty ${difficulty}, last tx is ${last_mine_tx}...`);
        if (is_wam){
            console.log(`Using WAM account`);
        }

        const start = (new Date()).getTime();

        while (!good){
            sb = new Serialize.SerialBuffer({
                textEncoder: new TextEncoder,
                textDecoder: new TextDecoder
            });
            sb.pushName(account);
            sb.pushArray(Array.from(last_mine_buf));
            rand_arr = pushRand(sb);
            hash = crypto.createHash("sha256");
            hash.update(sb.array.slice(0, 24));
            hex_digest = hash.digest('hex');
            // console.log(hex_digest);
            good = hex_digest.substr(0, 4) === '0000';
            /*if (is_wam){
                // easier for .wam accounts
            }
            else {
                // console.log(`non-wam account, mining is harder`)
                good = hex_digest.substr(0, 6) === '000000';
            }*/

            if (good){
                last = parseInt(hex_digest.substr(4, 1), 16);
                /*if (is_wam){
                }
                else {
                    last = parseInt(hex_digest.substr(6, 1), 16);
                }*/
                good &= (last <= difficulty);
                // console.log(hex_digest);
            }
            itr++;

            if (itr % 50000000 === 0){
                console.log(`Still mining - tried ${itr} iterations`);
            }

            if (!good){
                // delete sb;
                // delete hash;
            }

        }
        const end = (new Date()).getTime();

        // console.log(sb.array.slice(0, 20));
        // const rand_str = Buffer.from(sb.array.slice(16, 24)).toString('hex');
        const rand_str = Array.from(rand_arr).map(i => ('0' + i.toString(16)).slice(-2)).join('');

        console.log(`Found hash in ${itr} iterations with ${account} ${rand_str}, last = ${last}, hex_digest ${hex_digest} taking ${(end-start) / 1000}s`)
        const mine_work = {account, rand_str, hex_digest};

        return mine_work;
    };


    const doWorkWorker = async (mining_params) => {
        console.log('mining_params', mining_params)

        const _doWorkWorker = async (_message) => {
            const getRand = () => {
                const arr = new Uint8Array(8);
                for (let i=0; i < 8; i++){
                    const rand = Math.floor(Math.random() * 255);
                    arr[i] = rand;
                }
                return arr;
            };

            const toHex = (buffer) => {
                return [...new Uint8Array (buffer)]
                    .map (b => b.toString (16).padStart (2, "0"))
                    .join ("");
            };

            // console.log('in worker')
            let {mining_account, account, account_str, difficulty, last_mine_tx, last_mine_arr, sb} = _message.data;
            account = account.slice(0, 8);

            const is_wam = account_str.substr(-4) === '.wam';

            let good = false, itr = 0, rand = 0, hash, hex_digest, rand_arr, last;

            console.log(`Performing work with difficulty ${difficulty}, last tx is ${last_mine_tx}...`);
            /*if (is_wam){
                console.log(`Using WAM account`);
            }*/

            const start = (new Date()).getTime();

            while (!good){
                rand_arr = getRand();

                // console.log('combining', account, last_mine_arr, rand_arr);
                const combined = new Uint8Array(account.length + last_mine_arr.length + rand_arr.length);
                combined.set(account);
                combined.set(last_mine_arr, account.length);
                combined.set(rand_arr, account.length + last_mine_arr.length);

                // hash = crypto.createHash("sha256");
                // hash.update(combined.slice(0, 24));
                // hex_digest = hash.digest('hex');
                // console.log('combined slice', combined.slice(0, 24))
                hash = await crypto.subtle.digest('SHA-256', combined.slice(0, 24));
                // console.log(hash);
                hex_digest = toHex(hash);
                good = hex_digest.substr(0, 4) === '0000';
                // console.log(hex_digest);
                /*if (is_wam){
                    // easier for .wam accounts
                }
                else {
                    // console.log(`non-wam account, mining is harder`)
                    good = hex_digest.substr(0, 6) === '000000';
                }*/

                if (good){
                    last = parseInt(hex_digest.substr(4, 1), 16);
                    /*if (is_wam){
                    }
                    else {
                        last = parseInt(hex_digest.substr(6, 1), 16);
                    }*/
                    good &= (last <= difficulty);
                    // console.log(hex_digest, good);
                }
                itr++;

                if (itr % 1000000 === 0){
                    console.log(`Still mining - tried ${itr} iterations`);
                }

                if (!good){
                    hash = null;
                }

            }
            const end = (new Date()).getTime();

            // console.log(sb.array.slice(0, 20));
            // const rand_str = Buffer.from(sb.array.slice(16, 24)).toString('hex');
            const rand_str = toHex(rand_arr);

            console.log(`Found hash in ${itr} iterations with ${account} ${rand_str}, last = ${last}, hex_digest ${hex_digest} taking ${(end-start) / 1000}s`)
            const mine_work = {account: account_str, rand_str, hex_digest};

            this.postMessage(mine_work);

            return mine_work;
        }

        // console.log(_doWorkWorker.toString());

        mining_params.last_mine_tx = mining_params.last_mine_tx.substr(0, 16); // only first 8 bytes of txid
        mining_params.last_mine_arr = fromHexString(mining_params.last_mine_tx);

        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder
        });
        mining_params.sb = sb;

        mining_params.account_str = mining_params.account;
        mining_params.account = nameToArray(mining_params.account);

        let b = new Blob(["onmessage =" + _doWorkWorker.toString()], {type: "text/javascript"});
        let worker = new Worker(URL.createObjectURL(b));
        worker.postMessage(mining_params);
        return await new Promise(resolve => worker.onmessage = e => resolve(e.data));
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const getBountyFromTx = async (transaction_id, miner, hyperion_endpoints) => {
        // temporary fix
        await sleep(4000);

        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < 30; i++){
                for (let h = 0; h < hyperion_endpoints.length; h++){
                    const hyp = hyperion_endpoints[h];
                    if (hyp != 'https://wax.eosusa.news')
                    {
                        try {
                            const url = `${hyp}/v2/history/get_transaction?id=${transaction_id}`
                            const t_res = await fetch(url);
                            const t_json = await t_res.json();
                            // console.log(t_json)
                            if (t_json.executed){
                                let amount = 0
                                const amounts = t_json.actions.filter(a => a.act.name === 'transfer').map(a => a.act).filter(a => a.data.to === miner).map(a => a.data.quantity)
                                amounts.forEach(a => amount += parseFloat(a))
                                if (amount > 0){
                                    resolve(`${amount.toFixed(4)} TLM`)
                                    return
                                }
                            }
                        }
                        catch (e){
                            console.log(e.message)
                        }
                    }

                    await sleep(1000);
                }

                await sleep(2000);
            }

            resolve('UNKNOWN');
        });
    }



    const claim = (mining_account, account, account_permission, mine_data, hyperion_endpoints, eos_api) => {
        return new Promise(async (resolve, reject) => {
            try {
                const actions = [{
                    account: mining_account,
                    name: 'mine',
                    authorization: [{
                        actor: account,
                        permission: account_permission,
                    }],
                    data: mine_data
                }];
                const res = await eos_api.transact({
                    actions
                }, {
                    blocksBehind: 3,
                    expireSeconds: 90,
                });

                console.log(res.transaction_id)

                resolve(res.transaction_id);
            }
            catch (e){
                console.log(`Failed to push mine results ${e.message}`);
                reject(e);
            }
        });
    }

    const processRandomQueue = async (mining_account, eos_api, permission = 'active') => {
        const actions = [{
            account: mining_account,
            name: 'procrand',
            authorization: [{
                actor: account,
                permission
            }],
            data: { }
        }];
        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;

    }

    const setLandCommission = async (federation_account, owner, land_id, profit_share, eos_api, permission = 'active') => {
        const actions = [{
            account: federation_account,
            name: 'setprofitshr',
            authorization: [{
                actor: owner,
                permission
            }],
            data: {
                owner,
                land_id,
                profit_share
            }
        }];

        const res = await eos_api.transact({
            actions
        }, {
            blocksBehind: 3,
            expireSeconds: 90,
        });

        return res;
    };

    module.exports = { setPlayerData, setTagData, getBag, setBag, getLand, setLand, getPlanets, getPlayerData, getLandMiningParams, getBagMiningParams, getNextMineDelay, lastMineTx, doWork, doWorkWorker, processRandomQueue, setLandCommission, claim, getBountyFromTx }

    // getPlanetData
    // land tiles

    /* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/buffer/index.js */ "./node_modules/buffer/index.js").Buffer))

    //# sourceURL=webpack:///./src/mine.js?

})