import * as alt from 'alt';
import { randPosAround, distance } from '../utility/vector.mjs';
import * as utilityVehicle from '../utility/vehicle.mjs';
import * as configurationVehicles from '../configuration/vehicles.mjs';
import { actionMessage } from '../chat/chat.mjs';

console.log('Loaded: systems->vehicles.mjs');
let VehicleMap = new Map();

/**
 * Vehicles are spawned when the player logs in.
 * Vehicles that are owned by the user have blips for 30 seconds when tracking.
 * Vehicle positions are saved after the player exits the vehicle.
 * Only the owner can save the position; after they exit.
 */
export function spawnVehicle(player, veh, newVehicle = false) {
    // Existing Vehicle; Player Rejoined
    if (!newVehicle && VehicleMap.has(veh.id)) {
        let mappedVehicle = VehicleMap.get(veh.id);

        if (!Array.isArray(player.vehicles)) {
            player.vehicles = [];
            player.vehicles.push(mappedVehicle);
            return;
        }

        if (player.vehicles.includes(mappedVehicle)) return;
        player.vehicles.push(mappedVehicle);
        return;
    }

    // Otherwise Create / Spawn the Vehicle
    let pos = undefined;
    let rot = undefined;

    try {
        pos = JSON.parse(veh.position);
    } catch (err) {
        pos = randPosAround(player.pos, 3);
    }

    try {
        rot = JSON.parse(veh.rotation);
    } catch (err) {
        rot = new alt.Vector3(0, 0, 0);
    }

    let vehicle = new alt.Vehicle(veh.model, pos.x, pos.y, pos.z, rot.x, rot.y, rot.z);

    if (vehicle.modKitsCount >= 1) {
        vehicle.modKit = 1;
    }

    // Setup extended functions for the new vehicle.
    utilityVehicle.setupVehicleFunctions(vehicle);

    // Set the data on the vehicle from the DB.
    vehicle.data = veh;
    vehicle.engineOn = false;
    vehicle.lockState = 2;
    vehicle.fuel = vehicle.data.fuel ? parseFloat(vehicle.data.fuel) : 100;
    vehicle.setSyncedMeta('fuel', vehicle.fuel);

    // Synchronize the Stats
    /*
        appearance: vehicle.getAppearanceDataBase64(),
        damageStatus: vehicle.getDamageStatusBase64(),
        health: vehicle.getHealthDataBase64(),
        lockState: vehicle.lockState,
        scriptData: vehicle.getScriptDataBase64()
    */
    if (veh.stats !== null) {
        let stats = JSON.parse(veh.stats);

        vehicle.setAppearanceDataBase64(stats.appearance);
        vehicle.setDamageStatusBase64(stats.damageStatus);
        vehicle.setHealthDataBase64(stats.health);
        vehicle.setScriptDataBase64(stats.scriptData);
        vehicle.lockState = stats.lockState;
        vehicle.syncCustom();
    }

    if (!newVehicle) {
        // Set the vehicle into the map.
        VehicleMap.set(veh.id, vehicle);
    }

    // Create the vehicles array for the player.
    if (!Array.isArray(player.vehicles)) {
        player.vehicles = [];
        player.vehicles.push(vehicle);
    } else {
        // Keep track of player vehicles.
        player.vehicles.push(vehicle);
    }

    return vehicle;
}

export function appendNewVehicle(id, vehicle) {
    vehicle.data.id = id;
    VehicleMap.set(id, vehicle);
}

// Save Vehicle Data
setInterval(() => {
    // Saves All Vehicles Every 5 Minutes
    for (let key in VehicleMap) {
        VehicleMap[key].saveVehicleData();
    }
}, configurationVehicles.Configuration.saveTimeInMS);

/*
0 = Front Left Door
1 = Front Right Door
2 = Back Left Door
3 = Back Right Door
4 = Hood
5 = Trunk
6 = Back
7 = Back2
*/

export function toggleDoor(player, vehicle, id) {
    const dist = distance(player.pos, vehicle.pos);
    if (dist > 5) return;

    if (vehicle.lockState === 2) {
        if (player.vehicles === undefined) return;

        if (!player.vehicles.includes(vehicle)) {
            player.send('{FF0000} This vehicle does not belong to you.');
            return;
        }

        player.send('{00FF00} Your vehicle was unlocked.');
        vehicle.lockState = 1;
    }

    vehicle.toggleDoor(player, id);
}

export function toggleLock(player, vehicle) {
    const dist = distance(player.pos, vehicle.pos);
    if (dist > 5) {
        player.send(`{FF0000} You're too far away to toggle the lock.`);
        return;
    }

    if (player.vehicles === undefined) return;

    if (!player.vehicles.includes(vehicle)) return;

    if (vehicle.lockState === 2) {
        vehicle.lockState = 1; // Unlocked
        player.send('Your vehicle is now unlocked.');

        if (!player.vehicle) {
            alt.emitClient(null, 'vehicle:SoundHorn', vehicle, false);
        }
    } else {
        vehicle.lockState = 2; // Locked
        player.send('Your vehicle is now locked.');

        if (!player.vehicle) {
            alt.emitClient(null, 'vehicle:SoundHorn', vehicle, true);
        }
    }
}

export function toggleEngine(player, vehicle) {
    if (!player.vehicle) return;
    if (player.vehicles === undefined) return;
    if (!player.vehicles.includes(vehicle)) return;

    vehicle.isEngineOn = !vehicle.isEngineOn ? true : !vehicle.isEngineOn;

    if (vehicle.fuel <= 0) {
        vehicle.isEngineOn = false;
        player.send(`{FFFF00} You are out of fuel.`);
    }

    alt.emitClient(player, 'vehicle:StartEngine', vehicle.isEngineOn);
}

export function toggleSafetyLock(player, vehicle) {
    if (!player.vehicle) return;

    if (player.vehicles === undefined) return;

    if (!player.vehicles.includes(vehicle)) return;

    if (vehicle.lockState === 4) {
        vehicle.lockState = 2;
        player.send('Safety Lock was turned off.');
    } else {
        vehicle.lockState = 4;
        player.send('Safety Lock was turned on.');
    }
}

export function saveChanges(player, vehicle, jsonData) {
    if (!player.vehicles || !player.vehicles.includes(vehicle)) {
        player.send('This is not your vehicle; you cannot modify it.');
        vehicle.syncCustom();
        return;
    }

    vehicle.saveCustom(jsonData);
    player.playAudio('buy');
}

export function fillFuel(player, vehicle) {
    if (!vehicle) return;

    const fuelUntilFull = 100 - vehicle.fuel;
    const perUnit = 0.5;
    const totalCost = fuelUntilFull * perUnit;

    let msg = `{FFFF00} Total Cost is: {00FF00} $${totalCost}.`;
    if (!player.subCash(totalCost)) {
        player.send(msg + `{FF0000}You do not have enough cash.`);
        return;
    }
    player.send(msg);
    actionMessage(player, 'Begins to fill the closest vehicle with fuel.');

    setTimeout(() => {
        vehicle.fillFuel();
        if (player) {
            actionMessage(
                player,
                'Tops off the tank; and secures the handle to the pump.'
            );
        }
    }, 10000);
}

export function checkFuel(player, vehicle) {
    if (!vehicle) return;
    player.send(`{FFFF00}Remaining Fuel: {FFFFFF}${vehicle.fuel}`);
}
