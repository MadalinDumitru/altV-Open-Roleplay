import * as alt from 'alt';
import * as native from 'natives';
import { ContextMenu } from '/client/systems/context.mjs';
import { distance } from '/client/utility/vector.mjs';

alt.log('Loaded: client->contextmenus->object.mjs');

const chairs = [
    'prop_bench_01a',
    'prop_bench_01b',
    'prop_bench_01c',
    'prop_bench_02',
    'prop_bench_03',
    'prop_bench_04',
    'prop_bench_05',
    'prop_bench_06',
    'prop_bench_05',
    'prop_bench_08',
    'prop_bench_09',
    'prop_bench_10',
    'prop_bench_11',
    'prop_fib_3b_bench',
    'prop_ld_bench01',
    'prop_wait_bench_01',
    'hei_prop_heist_off_chair',
    'hei_prop_hei_skid_chair',
    'prop_chair_01a',
    'prop_chair_01b',
    'prop_chair_02',
    'prop_chair_03',
    'prop_chair_04a',
    'prop_chair_04b',
    'prop_chair_05',
    'prop_chair_06',
    'prop_chair_05',
    'prop_chair_08',
    'prop_chair_09',
    'prop_chair_10',
    'prop_chateau_chair_01',
    'prop_clown_chair',
    'prop_cs_office_chair',
    'prop_direct_chair_01',
    'prop_direct_chair_02',
    'prop_gc_chair02',
    'prop_off_chair_01',
    'prop_off_chair_03',
    'prop_off_chair_04',
    'prop_off_chair_04b',
    'prop_off_chair_04_s',
    'prop_off_chair_05',
    'prop_old_deck_chair',
    'prop_old_wood_chair',
    'prop_rock_chair_01',
    'prop_skid_chair_01',
    'prop_skid_chair_02',
    'prop_skid_chair_03',
    'prop_sol_chair',
    'prop_wheelchair_01',
    'prop_wheelchair_01_s',
    'p_armchair_01_s',
    'p_clb_officechair_s',
    'p_dinechair_01_s',
    'p_ilev_p_easychair_s',
    'p_soloffchair_s',
    'p_yacht_chair_01_s',
    'v_club_officechair',
    'v_corp_bk_chair3',
    'v_corp_cd_chair',
    'v_corp_offchair',
    'v_ilev_chair02_ped',
    'v_ilev_hd_chair',
    'v_ilev_p_easychair',
    'v_ret_gc_chair03',
    'prop_ld_farm_chair01',
    'prop_table_04_chr',
    'prop_table_05_chr',
    'prop_table_06_chr',
    'v_ilev_leath_chr',
    'prop_table_01_chr_a',
    'prop_table_01_chr_b',
    'prop_table_02_chr',
    'prop_table_03b_chr',
    'prop_table_03_chr',
    'prop_torture_ch_01',
    'v_ilev_fh_dineeamesa',
    'v_ilev_fh_kitchenstool',
    'v_ilev_tort_stool',
    'v_ilev_fh_kitchenstool',
    'v_ilev_fh_kitchenstool',
    'v_ilev_fh_kitchenstool',
    'v_ilev_fh_kitchenstool',
    'hei_prop_yah_seat_01',
    'hei_prop_yah_seat_02',
    'hei_prop_yah_seat_03',
    'prop_waiting_seat_01',
    'prop_yacht_seat_01',
    'prop_yacht_seat_02',
    'prop_yacht_seat_03',
    'prop_hobo_seat_01',
    'prop_rub_couch01',
    'miss_rub_couch_01',
    'prop_ld_farm_couch01',
    'prop_ld_farm_couch02',
    'prop_rub_couch02',
    'prop_rub_couch03',
    'prop_rub_couch04',
    'p_lev_sofa_s',
    'p_res_sofa_l_s',
    'p_v_med_p_sofa_s',
    'p_yacht_sofa_01_s',
    'v_ilev_m_sofa',
    'v_res_tre_sofa_s',
    'v_tre_sofa_mess_a_s',
    'v_tre_sofa_mess_b_s',
    'v_tre_sofa_mess_c_s',
    'prop_roller_car_01',
    'prop_roller_car_02'
];

let objectInteractions = {
    992069095: {
        func: sodaMachine
    },
    1114264700: {
        func: sodaMachine
    },
    4216340823: {
        func: payPhone
    },
    2191168601: {
        func: payPhone
    },
    2594689830: {
        func: metroTicketMachine
    },
    1363150739: {
        func: postalBox
    },
    218085040: {
        func: dumpster
    },
    666561306: {
        func: dumpster
    },
    3059710928: {
        func: chair
    },
    4223549947: {
        func: chair
    },
    4123023395: {
        func: chair
    },
    2930269768: {
        func: atm
    },
    3168729781: {
        func: atm
    },
    3424098598: {
        func: atm
    },
    506770882: {
        func: atm
    },
    // Mineshaft Door
    3053754761: {
        func: mineshaft
    },
    3213942386: {
        func: humanelabs
    },
    631614199: {
        func: doorControl
    },
    690372739: {
        func: coffeeMachine
    },
    1339433404: {
        func: gasPump
    },
    3832150195: {
        func: gasPump
    },
    3825272565: {
        func: gasPump
    }
};

chairs.forEach(item => {
    objectInteractions[native.getHashKey(item)] = {
        func: chair
    };
});

alt.on('menu:Object', ent => {
    if (alt.Player.local.getMeta('arrest')) return;

    let model = native.getEntityModel(ent);

    // find interaction; and call it if necessary.
    let interaction = objectInteractions[model];
    if (interaction === undefined || interaction.func === undefined) {
        unknown(ent);
        return;
    }

    interaction.func(ent);
});

function unknown(ent) {
    new ContextMenu(ent, [
        {
            label: 'Unknown'
        }
    ]);
}

function sodaMachine(ent) {
    new ContextMenu(ent, [
        {
            label: 'Soda Machine'
        },
        {
            label: 'Buy Soda',
            isServer: true,
            event: 'use:SodaMachine'
        }
    ]);
}

function coffeeMachine(ent) {
    new ContextMenu(ent, [
        {
            label: 'Coffee Machine'
        },
        {
            label: 'Buy Coffee',
            isServer: true,
            event: 'use:CoffeeMachine'
        }
    ]);
}

function payPhone(ent) {
    new ContextMenu(ent, [
        {
            label: 'Payphone'
        },
        {
            label: 'Use Phone',
            isServer: true,
            event: 'use:PayPhone'
        }
    ]);
}

function metroTicketMachine(ent) {
    new ContextMenu(ent, [
        {
            label: 'Metro Ticket Machine'
        },
        {
            label: 'Buy Ticket',
            isServer: true,
            event: 'use:MetroTicketMachine'
        }
    ]);
}

function postalBox(ent) {
    new ContextMenu(ent, [
        {
            label: 'Postal Box'
        },
        {
            label: 'Use',
            isServer: true,
            event: 'use:PostalBox'
        }
    ]);
}

function dumpster(ent) {
    new ContextMenu(ent, [
        {
            label: 'Dumpster'
        },
        {
            label: 'Hide',
            isServer: true,
            event: 'use:HideDumpster'
        },
        {
            label: 'Search',
            isServer: true,
            event: 'use:SearchDumpster'
        },
        {
            label: 'Leave',
            isServer: true,
            event: 'use:LeaveDumpster'
        }
    ]);
}

function atm(ent) {
    new ContextMenu(ent, [
        {
            label: 'ATM'
        },
        {
            label: 'Use',
            isServer: true,
            event: 'use:Atm'
        }
    ]);
}

function mineshaft(ent) {
    // Inside Model -> 3053754761
    // Inside Entity -> 111131
    // Outside Entity -> 145179
    // Outside Model -> 3053754761
    native.deleteEntity(ent);
    native.setEntityCollision(ent, false, false);
    native.setEntityAlpha(ent, 0, false);
}

function humanelabs(ent) {
    const dist = distance(
        { x: 3626.514404296875, y: 3752.325439453125, z: 28.515737533569336 },
        alt.Player.local.pos
    );

    if (dist > 15) return;
    alt.emitServer('use:ExitLabs');
}

function doorControl(ent) {
    const pos = native.getEntityCoords(ent, false);
    const type = native.getEntityModel(ent);
    const [_, locked, _2] = native.getStateOfClosestDoorOfType(
        type,
        pos.x,
        pos.y,
        pos.z,
        undefined,
        undefined
    );

    new ContextMenu(ent, [
        {
            label: `Locked: ${locked}`
        },
        {
            label: 'Toggle',
            isServer: true,
            event: 'use:ToggleDoor',
            data: {
                type,
                pos,
                heading: 0,
                locked
            }
        }
    ]);
}

function chair(ent) {
    native.freezeEntityPosition(ent, true);
    let pos = native.getEntityCoords(ent, false);
    let heading = native.getEntityHeading(ent) + 180.0;

    if (alt.Player.local.sitting) {
        alt.Player.local.sitting = false;
        native.clearPedTasksImmediately(alt.Player.local.scriptID);
        native.clearPedSecondaryTask(alt.Player.local.scriptID);
        return;
    }

    if (native.hasObjectBeenBroken(ent)) return;
    native.taskStartScenarioAtPosition(
        alt.Player.local.scriptID,
        'PROP_HUMAN_SEAT_BENCH',
        pos.x,
        pos.y,
        pos.z + 0.5,
        heading,
        -1,
        true,
        true
    );

    native.setFollowPedCamViewMode(2);
    alt.Player.local.sitting = true;
    alt.on('keyup', clearSit);
}

function clearSit(key) {
    if (key === 'W'.charCodeAt(0)) {
        alt.off('keyup', clearSit);
        native.clearPedTasksImmediately(alt.Player.local.scriptID);
        native.clearPedSecondaryTask(alt.Player.local.scriptID);
        alt.Player.local.sitting = false;
    }
}

function gasPump(ent) {
    new ContextMenu(ent, [
        {
            label: `Gas Pump`
        },
        {
            label: 'Fuel Vehicle',
            isServer: false,
            event: 'vehicle:Fuel',
            data: {}
        }
    ]);
}
