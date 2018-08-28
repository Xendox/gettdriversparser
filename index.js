const axios = require('axios');
const cheerio = require('cheerio');

async function parseDriversData(link) {
    return new Promise(async (resolve) => {
        const data = await axios(link);
        const $ = cheerio.load(data.data);
        let scripts = $('script:not([src])');
        for (let i = 0; i < scripts.length; ++i) {
            if (scripts[i].children[0].data.includes('window.serverParams')) {
                let serverParams = scripts[i].children[0].data;
                let driverInfosPart = serverParams.substring(serverParams.indexOf('driver_infos'));
                driverInfosPart = driverInfosPart.substring(0, driverInfosPart.indexOf('\n') - 1);
                let driversInfo = driverInfosPart.substring(driverInfosPart.indexOf('{'));
                let drivers = JSON.parse(driversInfo);
                let result = {};
                for (let driverId in drivers) {
                    result[drivers[driverId].phone] = {
                        'id': driverId,
                        'name': drivers[driverId].name
                    };
                }
                resolve(result);
            }
        }
        resolve(null);
    });
}

(async () => {
    if (process.argv.length !== 3) {
        console.log("Can not get link param from command line arguments");
        return;
    }
    const link = process.argv[2];
    const drivers = await parseDriversData(link);
    console.log(drivers);
})();

