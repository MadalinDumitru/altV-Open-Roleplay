import * as alt from 'alt';
import * as native from 'natives';

alt.log('Loaded: client->systems->vehicles.mjs');

alt.on('meta:Changed', startInterval);

alt.on('gameEntityCreate', entity => {
    if (entity.constructor.name === 'Vehicle') {
        const primaryPaint = entity.getSyncedMeta('primaryPaint');
        const secondaryPaint = entity.getSyncedMeta('secondaryPaint');
        const primaryColor = entity.getSyncedMeta('primaryColor');
        const secondaryColor = entity.getSyncedMeta('secondaryColor');

        alt.setTimeout(() => {
            if (primaryPaint) {
                native.setVehicleModColor1(entity.scriptID, primaryPaint, 0, 0);
            }

            if (secondaryPaint) {
                native.setVehicleModColor2(entity.scriptID, secondaryPaint, 0, 0);
            }

            if (primaryColor) {
                native.setVehicleCustomPrimaryColour(
                    entity.scriptID,
                    primaryColor[0],
                    primaryColor[1],
                    primaryColor[2]
                );
            }

            if (secondaryColor) {
                native.setVehicleCustomSecondaryColour(
                    entity.scriptID,
                    secondaryColor[0],
                    secondaryColor[1],
                    secondaryColor[2]
                );
            }
        }, 1000);
    }
});

alt.on('syncedMetaChange', (entity, key, value) => {
    if (entity.constructor.name !== 'Vehicle') return;

    alt.setTimeout(() => {
        if (key === 'primaryPaint') {
            native.setVehicleModColor1(entity.scriptID, value, 0, 0);
        }

        if (key === 'secondaryPaint') {
            native.setVehicleModColor2(entity.scriptID, value, 0, 0);
        }

        if (key === 'primaryColor') {
            native.setVehicleCustomPrimaryColour(
                entity.scriptID,
                value[0],
                value[1],
                value[2]
            );
        }

        if (key === 'secondaryColor') {
            native.setVehicleCustomSecondaryColour(
                entity.scriptID,
                value[0],
                value[1],
                value[2]
            );
        }
    }, 1000);
});

alt.on('vehicle:Fuel', () => {
    alt.Player.local.isFueling = true;
    alt.emit(
        'chat:Send',
        `{00FF00} Select the vehicle you want to fuel with your cursor.`
    );
    alt.Player.local.fuelLocation = alt.Player.local.pos;
});

function startInterval(key, value) {
    if (key !== 'pedflags') return;
    alt.off('meta:Changed', startInterval);
    // Disable Vehicle Engine Startup
    // Disable Shuffling to Driver Seat - Doesn't work?
    // Disable Motorcylce Helmet
    native.setPedConfigFlag(alt.Player.local.scriptID, 429, 1);
    native.setPedConfigFlag(alt.Player.local.scriptID, 184, 1);
    native.setPedConfigFlag(alt.Player.local.scriptID, 35, 0);
    // Interval Removed
}

export function toggleDoor(vehicle, id, state) {
    if (state) {
        native.setVehicleDoorOpen(vehicle.scriptID, id, false, false);
    } else {
        native.setVehicleDoorShut(vehicle.scriptID, id, false);
    }
}

export function eject(slowly) {
    if (!slowly) {
        native.taskLeaveVehicle(
            alt.Player.local.scriptID,
            alt.Player.local.vehicle.scriptID,
            16
        );
    } else {
        native.taskLeaveVehicle(
            alt.Player.local.scriptID,
            alt.Player.local.vehicle.scriptID,
            1
        );
    }
}

export function repair(vehicle) {
    native.setVehicleFixed(vehicle.scriptID);
}

export function startEngine(value) {
    if (!alt.Player.local.vehicle) return;

    alt.log('Starting engine...');
    alt.log(value);
    native.setVehicleEngineOn(alt.Player.local.vehicle.scriptID, value, false, true);
}

// Called from a keybind.
export function toggleEngine() {
    if (!alt.Player.local.vehicle) return;

    const pedInSeat = native.getPedInVehicleSeat(alt.Player.local.vehicle.scriptID, -1);
    if (pedInSeat !== alt.Player.local.scriptID) return;

    alt.emitServer('vehicle:ToggleEngine', alt.Player.local.vehicle);
}

// Called from a keybind.
export function toggleLock() {
    const vehicle = native.getVehiclePedIsIn(alt.Player.local.scriptID, 1);
    if (!native.doesEntityExist(vehicle)) return;

    let veh = alt.Vehicle.all.find(x => x.scriptID === vehicle);
    if (!veh) return;

    if (alt.Player.local.vehicle) return;

    alt.emitServer('vehicle:ToggleLock', veh);
}

// Called from a keybind.
export function keepEngineRunning() {
    if (!alt.Player.local.vehicle) return;
    if (!native.getIsVehicleEngineRunning(alt.Player.local.vehicle.scriptID)) return;
    const pedInSeat = native.getPedInVehicleSeat(alt.Player.local.vehicle.scriptID, -1);
    if (pedInSeat !== alt.Player.local.scriptID) return;
    alt.setTimeout(() => {
        native.setVehicleEngineOn(
            // Retrieves last vehicle ped was in.
            native.getVehiclePedIsIn(alt.Player.local.scriptID, 1),
            true,
            true,
            true
        );
    }, 100);
}

// Called when the user locks their vehicle.
export function soundHorn(vehicle, state) {
    let id = vehicle.scriptID;

    let count = 0;
    if (state) {
        let interval = alt.setInterval(() => {
            native.setVehicleLights(id, 0);
            native.startVehicleHorn(id, 50, native.getHashKey('HELDDOWN'), false);
            native.setVehicleLights(id, 2);
            if (count == 1) {
                alt.clearInterval(interval);
            }
            native.setVehicleLights(id, 0);
            count += 1;
        }, 100);
    } else {
        native.setVehicleLights(id, 2);
        native.startVehicleHorn(id, 50, native.getHashKey('HELDDOWN'), false);

        alt.setTimeout(() => {
            native.setVehicleLights(id, 0);
        }, 50);
    }
}

export function setIntoVehicle(vehicle) {
    alt.setTimeout(() => {
        native.setPedIntoVehicle(alt.Player.local.scriptID, vehicle.scriptID, -1);
    }, 200);
}
