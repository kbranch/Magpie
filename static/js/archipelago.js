"use strict"

import {
    Client,
    ITEMS_HANDLING_FLAGS,
    SERVER_PACKET_TYPE,
} from "/static/lib/archipelago.js/archipelago-1.0.js";

var itemMap = {
  10000000: "POWER_BRACELET",
  10000001: "SHIELD",
  10000002: "BOW",
  10000003: "HOOKSHOT",
  10000004: "MAGIC_ROD",
  10000005: "PEGASUS_BOOTS",
  10000006: "OCARINA",
  10000007: "FEATHER",
  10000008: "SHOVEL",
  10000009: "MAGIC_POWDER",
  10000010: "BOMB",
  10000011: "SWORD",
  10000012: "FLIPPERS",
  10000013: "MAGNIFYING_LENS",
  10000014: "BOOMERANG",
  10000015: "SLIME_KEY",
  10000016: "MEDICINE",
  10000017: "TAIL_KEY",
  10000018: "ANGLER_KEY",
  10000019: "FACE_KEY",
  10000020: "BIRD_KEY",
  10000021: "GOLD_LEAF",
  10000022: "MAP",
  10000023: "COMPASS",
  10000024: "STONE_BEAK",
  10000025: "NIGHTMARE_KEY",
  10000026: "KEY",
  10000027: "RUPEES_50",
  10000028: "RUPEES_20",
  10000029: "RUPEES_100",
  10000030: "RUPEES_200",
  10000031: "RUPEES_500",
  10000032: "SEASHELL",
  10000033: "MESSAGE",
  10000034: "GEL",
  10000035: "KEY1",
  10000036: "KEY2",
  10000037: "KEY3",
  10000038: "KEY4",
  10000039: "KEY5",
  10000040: "KEY6",
  10000041: "KEY7",
  10000042: "KEY8",
  10000043: "KEY9",
  10000044: "MAP1",
  10000045: "MAP2",
  10000046: "MAP3",
  10000047: "MAP4",
  10000048: "MAP5",
  10000049: "MAP6",
  10000050: "MAP7",
  10000051: "MAP8",
  10000052: "MAP9",
  10000053: "COMPASS1",
  10000054: "COMPASS2",
  10000055: "COMPASS3",
  10000056: "COMPASS4",
  10000057: "COMPASS5",
  10000058: "COMPASS6",
  10000059: "COMPASS7",
  10000060: "COMPASS8",
  10000061: "COMPASS9",
  10000062: "STONE_BEAK1",
  10000063: "STONE_BEAK2",
  10000064: "STONE_BEAK3",
  10000065: "STONE_BEAK4",
  10000066: "STONE_BEAK5",
  10000067: "STONE_BEAK6",
  10000068: "STONE_BEAK7",
  10000069: "STONE_BEAK8",
  10000070: "STONE_BEAK9",
  10000071: "NIGHTMARE_KEY1",
  10000072: "NIGHTMARE_KEY2",
  10000073: "NIGHTMARE_KEY3",
  10000074: "NIGHTMARE_KEY4",
  10000075: "NIGHTMARE_KEY5",
  10000076: "NIGHTMARE_KEY6",
  10000077: "NIGHTMARE_KEY7",
  10000078: "NIGHTMARE_KEY8",
  10000079: "NIGHTMARE_KEY9",
  10000080: "TOADSTOOL",
  10000128: "HEART_PIECE",
  10000129: "BOWWOW",
  10000130: "ARROWS_10",
  10000131: "SINGLE_ARROW",
  10000132: "MAX_POWDER_UPGRADE",
  10000133: "MAX_BOMBS_UPGRADE",
  10000134: "MAX_ARROWS_UPGRADE",
  10000135: "RED_TUNIC",
  10000136: "BLUE_TUNIC",
  10000137: "HEART_CONTAINER",
  10000138: "BAD_HEART_CONTAINER",
  10000139: "SONG1",
  10000140: "SONG2",
  10000141: "SONG3",
  10000142: "INSTRUMENT1",
  10000143: "INSTRUMENT2",
  10000144: "INSTRUMENT3",
  10000145: "INSTRUMENT4",
  10000146: "INSTRUMENT5",
  10000147: "INSTRUMENT6",
  10000148: "INSTRUMENT7",
  10000149: "INSTRUMENT8",
  10000150: "ROOSTER",
  10000151: "TRADING_ITEM_YOSHI_DOLL",
  10000152: "TRADING_ITEM_RIBBON",
  10000153: "TRADING_ITEM_DOG_FOOD",
  10000154: "TRADING_ITEM_BANANAS",
  10000155: "TRADING_ITEM_STICK",
  10000156: "TRADING_ITEM_HONEYCOMB",
  10000157: "TRADING_ITEM_PINEAPPLE",
  10000158: "TRADING_ITEM_HIBISCUS",
  10000159: "TRADING_ITEM_LETTER",
  10000160: "TRADING_ITEM_BROOM",
  10000161: "TRADING_ITEM_FISHING_HOOK",
  10000162: "TRADING_ITEM_NECKLACE",
  10000163: "TRADING_ITEM_SCALE",
  10000164: "TRADING_ITEM_MAGNIFYING_GLASS",
};

var checkMap = {
  10000501: "0x1F5",
  10000675: "0x2A3",
  10001769: "0x301-0",
  10002769: "0x301-1",
  10000674: "0x2A2",
  10001673: "0x2A1-0",
  10002673: "0x2A1-1",
  10003673: "0x2A1-2",
  10000275: "0x113",
  10000277: "0x115",
  10000270: "0x10E",
  10000278: "0x116",
  10000269: "0x10D",
  10000276: "0x114",
  10000268: "0x10C",
  10001259: "0x103-Owl",
  10001260: "0x104-Owl",
  10000285: "0x11D",
  10000264: "0x108",
  10000266: "0x10A",
  10001266: "0x10A-Owl",
  10000262: "0x106",
  10000258: "0x102",
  10000310: "0x136",
  10000302: "0x12E",
  10000306: "0x132",
  10000311: "0x137",
  10001307: "0x133-Owl",
  10000312: "0x138",
  10000313: "0x139",
  10000308: "0x134",
  10000294: "0x126",
  10000289: "0x121",
  10001297: "0x129-Owl",
  10001303: "0x12F-Owl",
  10000288: "0x120",
  10000290: "0x122",
  10000295: "0x127",
  10000299: "0x12B",
  10000298: "0x12A",
  10000339: "0x153",
  10000337: "0x151",
  10000335: "0x14F",
  10000334: "0x14E",
  10000340: "0x154",
  10001340: "0x154-Owl",
  10000336: "0x150",
  10000332: "0x14C",
  10000341: "0x155",
  10000344: "0x158",
  10000333: "0x14D",
  10001327: "0x147-Owl",
  10000327: "0x147",
  10000326: "0x146",
  10000322: "0x142",
  10000321: "0x141",
  10000328: "0x148",
  10000324: "0x144",
  10001320: "0x140-Owl",
  10000347: "0x15B",
  10000346: "0x15A",
  10000345: "0x159",
  10000377: "0x179",
  10000362: "0x16A",
  10000376: "0x178",
  10000379: "0x17B",
  10000369: "0x171",
  10000357: "0x165",
  10000373: "0x175",
  10001367: "0x16F-Owl",
  10000361: "0x169",
  10000366: "0x16E",
  10000365: "0x16D",
  10000360: "0x168",
  10000352: "0x160",
  10000374: "0x176",
  10000358: "0x166",
  10000354: "0x162",
  10000416: "0x1A0",
  10000414: "0x19E",
  10000385: "0x181",
  10001410: "0x19A-Owl",
  10000411: "0x19B",
  10000407: "0x197",
  10000406: "0x196",
  10001394: "0x18A-Owl",
  10000398: "0x18E",
  10000392: "0x188",
  10000399: "0x18F",
  10000384: "0x180",
  10000387: "0x183",
  10000390: "0x186",
  10000389: "0x185",
  10000386: "0x182",
  10000463: "0x1CF",
  10000457: "0x1C9",
  10001443: "0x1BB-Owl",
  10000462: "0x1CE",
  10000448: "0x1C0",
  10000441: "0x1B9",
  10000435: "0x1B3",
  10000436: "0x1B4",
  10000432: "0x1B0",
  10000108: "0x06C",
  10000446: "0x1BE",
  10000465: "0x1D1",
  10001471: "0x1D7-Owl",
  10000451: "0x1C3",
  10000433: "0x1B1",
  10001438: "0x1B6-Owl",
  10000438: "0x1B6",
  10000444: "0x1BC",
  10000437: "0x1B5",
  10000528: "0x210",
  10001534: "0x216-Owl",
  10000530: "0x212",
  10001516: "0x204-Owl",
  10000516: "0x204",
  10000521: "0x209",
  10000529: "0x211",
  10000539: "0x21B",
  10000513: "0x201",
  10001540: "0x21C-Owl",
  10000540: "0x21C",
  10000548: "0x224",
  10000538: "0x21A",
  10000544: "0x220",
  10000547: "0x223",
  10000556: "0x22C",
  10000591: "0x24F",
  10000589: "0x24D",
  10000604: "0x25C",
  10000588: "0x24C",
  10000597: "0x255",
  10000582: "0x246",
  10001595: "0x253-Owl",
  10000601: "0x259",
  10000602: "0x25A",
  10000607: "0x25F",
  10001581: "0x245-Owl",
  10000574: "0x23E",
  10000565: "0x235",
  10000567: "0x237",
  10000576: "0x240",
  10000573: "0x23D",
  10000000: "0x000",
  10000577: "0x241",
  10001577: "0x241-Owl",
  10000570: "0x23A",
  10000562: "0x232",
  10000564: "0x234",
  10000560: "0x230",
  10000788: "0x314",
  10001776: "0x308-Owl",
  10000776: "0x308",
  10001783: "0x30F-Owl",
  10000783: "0x30F",
  10000785: "0x311",
  10000770: "0x302",
  10000774: "0x306",
  10000775: "0x307",
  10001778: "0x30A-Owl",
  10000703: "0x2BF",
  10000702: "0x2BE",
  10000676: "0x2A4",
  10000689: "0x2B1",
  10000163: "0x0A3",
  10000690: "0x2B2",
  10000210: "0x0D2",
  10000229: "0x0E5",
  10000483: "0x1E3",
  10000068: "0x044",
  10000113: "0x071",
  10000481: "0x1E1",
  10000052: "0x034",
  10000065: "0x041",
  10000701: "0x2BD",
  10000683: "0x2AB",
  10000691: "0x2B3",
  10000686: "0x2AE",
  10001017: "0x011-Owl",
  10000687: "0x2AF",
  10001053: "0x035-Owl",
  10000735: "0x2DF",
  10000116: "0x074",
  10000738: "0x2E2",
  10000717: "0x2CD",
  10000756: "0x2F4",
  10000741: "0x2E5",
  10000165: "0x0A5",
  10000166: "0x0A6",
  10000139: "0x08B",
  10000164: "0x0A4",
  10000745: "0x2E9",
  10000509: "0x1FD",
  10000185: "0x0B9",
  10000233: "0x0E9",
  10000248: "0x0F8",
  10000168: "0x0A8",
  10001168: "0x0A8-Owl",
  10000480: "0x1E0",
  10001198: "0x0C6-Owl",
  10000090: "0x05A",
  10000088: "0x058",
  10000722: "0x2D2",
  10000709: "0x2C5",
  10000710: "0x2C6",
  10000218: "0x0DA",
  10001218: "0x0DA-Owl",
  10001207: "0x0CF-Owl",
  10000742: "0x2E6",
  10000488: "0x1E8",
  10000255: "0x0FF",
  10000024: "0x018",
  10000699: "0x2BB",
  10000650: "0x28A",
  10000498: "0x1F2",
  10000764: "0x2FC",
  10001143: "0x08F-Owl",
  10000092: "0x05C",
  10000093: "0x05D",
  10001093: "0x05D-Owl",
  10001030: "0x01E-Owl",
  10000012: "0x00C",
  10000754: "0x2F2",
  10000029: "0x01D",
  10000004: "0x004",
  10000482: "0x1E2",
  10000698: "0x2BA",
  10000242: "0x0F2",
  10000080: "0x050",
  10000206: "0x0CE",
  10000639: "0x27F",
  10000634: "0x27A",
  10000146: "0x092",
  10000765: "0x2FD",
  10000763: "0x2FB",
  10000484: "0x1E4",
  10000037: "0x025",
  10000074: "0x04A",
  10000199: "0x0C7",
  10000176: "0x0B0",
  10000212: "0x0D4",
  10000017: "0x011",
  10000191: "0x0BF",
  10000224: "0x0E0",
  10001672: "0x2A0-Trade",
  10001678: "0x2A6-Trade",
  10001690: "0x2B2-Trade",
  10001766: "0x2FE-Trade",
  10001123: "0x07B-Trade",
  10001135: "0x087-Trade",
  10001727: "0x2D7-Trade",
  10001025: "0x019-Trade",
  10001729: "0x2D9-Trade",
  10001680: "0x2A8-Trade",
  10001205: "0x0CD-Trade",
  10001757: "0x2F5-Trade",
  10001201: "0x0C9-Trade",
  10001663: "0x297-Trade",
  10000672: "0x2A0",
  10010786: "0x2A22",
  10000127: "0x07F",
  10000782: "0x30E",
  10005010: "0x1392",
  10004626: "0x1212",
  10000600: "0x258",
  10009186: "0x23E2",
  10009042: "0x2352",
};

const client = new Client();

function connected(packet) {
    console.log("Connected to AP server: ", packet);

    try {
        parseCheckedChecks(packet.checked_locations, false);
    }
    catch(err) {
        console.log(`Error processing AP checks: ${err}`);
    }
}

function receivedItems(packet) {
    console.log("AP Item packet: ", packet);

    try {
        let apItems = {};
        for (const item of packet.items) {
            let ladxItem = itemMap[item.item];

            if (!(ladxItem in apItems)) {
                apItems[ladxItem] = 0;
            }

            apItems[ladxItem]++;
        }

        let message = {
            type: "item",
            refresh: true,
            source: "archipelago",
            diff: packet.index > 0,
            items: [],
        };

        for (const item in apItems) {
            message.items.push({
                id: item,
                qty: apItems[item],
            });
        }

        processMessage(JSON.stringify(message));
    }
    catch(err) {
        console.log(`Error processing AP items: ${err}`);
    }
}

function roomUpdate(packet) {
    console.log("AP room update packet: ", packet);
    try {
        if (packet.checked_locations) {
            parseCheckedChecks(packet.checked_locations, true);
        }
    }
    catch(err) {
        console.log(`Error processing AP items: ${err}`);
    }
}

function parseCheckedChecks(apCheckIds, diff) {
    let checked = apCheckIds.map(x => checkMap[x]);

    let message = {
        type: "check",
        refresh: true,
        source: "archipelago",
        diff: diff,
        checks: [],
    };

    for (const check of checked) {
        message.checks.push({
            id: check,
            checked: true,
        });
    }

    processMessage(JSON.stringify(message));
}

function archipelagoConnect(hostname, port, slotName, password) {
    let connectionInfo = {
        hostname: hostname,
        port: port,
        game: "Links Awakening DX",
        name: slotName,
        password: password,
        tags: ['Tracker'],
        items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
    };

    client.disconnect();

    client.addListener(SERVER_PACKET_TYPE.CONNECTED, connected);
    client.addListener(SERVER_PACKET_TYPE.ROOM_UPDATE, roomUpdate);
    client.addListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, receivedItems);

    client.connect(connectionInfo)
        .then(() => {
            addAutotrackerMessage(`Connected to ${hostname}:${port}`);
        })
        .catch((err) => {
            console.error("Failed to connect to AP:", err);
            alertModal("Archipelago Error", `Error connecting to Archipelago: ${err}`);
        });

    window.addEventListener("beforeunload", () => {
        client.disconnect();
    });
}

function archipelagoDisconnect() {
    if (client.status == "Connected") {
        addAutotrackerMessage("Disconnecting from Archipelago");
    }

    client.disconnect();
}

window.archipelagoConnect = archipelagoConnect;
window.archipelagoDisconnect = archipelagoDisconnect;