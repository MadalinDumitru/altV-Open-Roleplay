import * as alt from 'alt';
import * as utilityEncryption from '../utility/encryption.mjs';
import SQL from '../../../postgres-wrapper/database.mjs';

console.log('Loaded: utility->player.mjs');

// Load the database handler.
const db = new SQL();

// These are player extension functions.
// They can be called from anywhere inside of
// this resource and they're very useful for
// quickly interacting with player data.
// Keep the sectioned off; it makes it easier.
export function setupPlayerFunctions(player) {
    // ====================================
    // Enable Player Saving
    player.save = () => {
        db.upsertData(player.data, 'Character', res => {
            if (player.data.name === null) {
                console.log(`${player.name} was saved.`);
            } else {
                console.log(`${player.data.name} was saved.`);
            }
        });
    };

    // Save only a specific field.
    player.saveField = (id, fieldName, fieldValue) => {
        db.updatePartialData(
            id,
            { [fieldName]: fieldValue },
            'Character',
            () => {}
        );
    };

    // ====================================
    // Save Last Location
    player.saveLocation = pos => {
        player.data.lastposition = pos;
        player.saveField(player.data.id, 'lastposition', JSON.stringify(pos));
    };

    player.saveDead = value => {
        player.data.dead = value;
        player.saveField(player.data.id, 'dead', value);
    };

    // ====================================
    // Registration Webview Related Events
    player.showRegisterDialogue = (regCamCoord, regCamPointAtCoord) => {
        alt.emitClient(
            player,
            'register:ShowDialogue',
            regCamCoord,
            regCamPointAtCoord
        );
    };

    // Show Error Message
    player.showRegisterEventError = msg => {
        alt.emitClient(player, 'register:EmitEventError', msg);
    };

    // Show Success Message
    player.showRegisterEventSuccess = msg => {
        alt.emitClient(player, 'register:EmitEventSuccess', msg);
    };

    // Show Success Message
    player.showRegisterLogin = () => {
        alt.emitClient(player, 'register:ShowLogin');
    };

    // Close Dialogue
    player.closeRegisterDialogue = () => {
        alt.emitClient(player, 'register:CloseDialogue');
    };

    // ====================================
    // Screen Effects
    player.screenFadeOutFadeIn = (fadeInOutMS, timeoutMS) => {
        alt.emitClient(player, 'screen:FadeOutFadeIn', fadeInOutMS, timeoutMS);
    };

    player.screenFadeOut = timeInMS => {
        alt.emitClient(player, 'screen:FadeOut', timeInMS);
    };

    player.screenFadeIn = timeInMS => {
        alt.emitClient(player, 'screen:FadeIn', timeInMS);
    };

    player.screenBlurOut = timeInMS => {
        alt.emitClient(player, 'screen:BlurOut', timeInMS);
    };

    player.screenBlurIn = timeInMS => {
        alt.emitClient(player, 'screen:BlurIn', timeInMS);
    };

    // ====================================
    // Face Customizer
    player.showFaceCustomizerDialogue = () => {
        alt.emitClient(player, 'face:ShowDialogue');
    };

    player.applyFace = valueJSON => {
        const data = JSON.parse(valueJSON);

        if (data['Sex'].value === 0) {
            player.model = 'mp_f_freemode_01';
        } else {
            player.model = 'mp_m_freemode_01';
        }

        alt.emitClient(player, 'face:ApplyFacialData', valueJSON);
    };

    player.saveFace = valueJSON => {
        const data = JSON.parse(valueJSON);

        if (data['Sex'].value === 0) {
            player.model = 'mp_f_freemode_01';
        } else {
            player.model = 'mp_m_freemode_01';
        }

        player.data.face = valueJSON;
        player.saveField(player.data.id, 'face', valueJSON);
        alt.emitClient(player, 'face:ApplyFacialData', valueJSON);
    };

    // ====================================
    // Roleplay Name Dialogues
    player.showRoleplayNameDialogue = () => {
        alt.emitClient(player, 'roleplayname:ShowDialogue');
    };

    player.closeRoleplayNameDialogue = () => {
        alt.emitClient(player, 'roleplayname:CloseDialogue');
    };

    player.showRoleplayNameTaken = () => {
        alt.emitClient(player, 'roleplayname:ShowNameTaken');
    };

    // ====================================
    // Money Functions
    // Remove cash from the player.
    player.subCash = value => {
        let absValue = Math.abs(parseFloat(value)) * 1;

        if (player.data.cash < absValue) return false;

        player.data.cash -= absValue;
        player.data.cash = Number.parseFloat(player.data.cash).toFixed(2) * 1;
        player.saveField(player.data.id, 'cash', player.data.cash);
        return true;
    };

    // Add cash to the player.
    player.addCash = value => {
        let absValue = Math.abs(parseFloat(value));

        if (player.data.cash + absValue > 92233720368547758.07) {
            absValue = 0;
        }

        player.data.cash += absValue;
        player.data.cash = Number.parseFloat(player.data.cash).toFixed(2) * 1;
        player.saveField(player.data.id, 'cash', player.data.cash);
        return true;
    };

    // Add cash to the bank.
    player.addBank = value => {
        let absValue = Math.abs(parseFloat(value));

        if (player.data.bank + absValue > 92233720368547758.07) {
            absValue = 0;
        }

        player.data.bank += absValue;
        player.data.bank = Number.parseFloat(player.data.bank).toFixed(2) * 1;
        player.saveField(player.data.id, 'bank', player.data.bank);
        return true;
    };

    // Subtract the cash from the bank.
    player.subBank = value => {
        let absValue = Math.abs(parseFloat(value)) * 1;

        if (player.data.bank < absValue) return false;

        player.data.bank -= absValue;
        player.data.bank = Number.parseFloat(player.data.bank).toFixed(2) * 1;
        player.saveField(player.data.id, 'bank', player.data.bank);
        return true;
    };

    // Get the player's cash balance.
    player.getCash = () => {
        return player.data.cash;
    };

    // Get the player's bank balance.
    player.getBank = () => {
        return player.data.bank;
    };

    player.taxIncome = (percentage, useHighest, reason) => {
        let cash = player.getCash(); // 0
        let bank = player.getBank(); // 1

        let taxType = 0;

        if (useHighest) {
            if (cash > bank) {
                taxType = 0;
            } else {
                taxType = 1;
            }
        } else {
            if (cash < bank) {
                taxType = 0;
            } else {
                taxType = 1;
            }
        }

        if (taxType === 0) {
            let cashTaxAmount = cash * percentage;
            cash -= cashTaxAmount;
            player.data.cash = Number.parseFloat(cash).toFixed(2) * 1;
            player.saveField(player.data.id, 'cash', player.data.cash);
            player.sendMessage(`You were taxed: $${cashTaxAmount}`);
        } else {
            let bankTaxAmount = bank * percentage;
            bank -= bankTaxAmount;
            player.data.bank = Number.parseFloat(bank).toFixed(2) * 1;
            player.saveField(player.data.id, 'bank', player.data.bank);
            player.sendMessage(`You were taxed: $${bankTaxAmount}`);
        }

        player.sendMessage(`Reason: ${reason}`);
    };

    // ====================================
    // Load Blip for client.
    player.createBlip = (pos, blipType, blipColor, labelName) => {
        alt.emitClient(
            player,
            'blip:CreateBlip',
            pos,
            blipType,
            blipColor,
            labelName
        );
    };

    // ====================================
    // Show the ATM Panel / Dialogue
    player.showAtmPanel = () => {
        alt.emitClient(player, 'atm:ShowDialogue');
    };

    // Close the ATM Panel / Dialogue
    player.closeAtmPanel = () => {
        alt.emitClient(player, 'atm:CloseDialogue');
    };

    // Update the ATM Cash balance the user sees.
    player.updateAtmCash = value => {
        alt.emitClient(player, 'atm:UpdateCash', value);
    };

    // Update the ATM Bank balance the user sees.
    player.updateAtmBank = value => {
        alt.emitClient(player, 'atm:UpdateBank', value);
    };

    // Show the ATM success message.
    player.showAtmSuccess = msg => {
        alt.emitClient(player, 'atm:ShowSuccess', msg);
    };

    // =================================
    /**
     * Show the Clothing Dialogue
     */
    player.showClothingDialogue = () => {
        alt.emitClient(player, 'clothing:ShowDialogue');
    };

    /**
     * Close the clothing Dialogue.
     */
    player.closeClothingDialogue = () => {
        alt.emitClient(player, 'clothing:CloseDialogue');
    };

    /**
     * Sync the player's clothes from a JSON.
     */
    player.syncClothing = data => {
        alt.emitClient(player, 'clothing:SyncClothing', data);
        player.setSyncedMeta('clothing', data);
    };

    /**
     * Save the player's clothing.
     */
    player.saveClothing = dataJSON => {
        player.data.clothing = dataJSON;
        player.setSyncedMeta('clothing', dataJSON);
        player.saveField(player.data.id, 'clothing', dataJSON);
    };

    // =================================
    /**
     * Set / Save the player's Roleplay name
     */
    player.saveRoleplayName = value => {
        player.data.name = value;
        player.setSyncedMeta('name', player.data.name);
        player.saveField(player.data.id, 'name', player.data.name);
    };

    // =================================
    // Add an item to a player.
    player.syncInventory = () => {
        player.inventory = JSON.parse(player.data.inventory);
        player.setSyncedMeta('inventory', player.data.inventory);
    };

    player.addItem = (itemTemplate, quantity, isUnique = false) => {
        let itemClone = {
            label: itemTemplate.label,
            quantity: 0,
            props: itemTemplate.props
        };

        // If the item is stackable; check if the player has it.
        if (itemTemplate.stackable && !isUnique) {
            // Find stackable item index.
            let index = player.inventory.findIndex(
                x => x.label === itemClone.label
            );

            // The item exists.
            if (index > -1) {
                alt.emit('inventory:AddItem', player, index, quantity);
                return;
            }
        }

        // This is for making a new item.
        // Add the amount.
        itemClone.quantity += quantity;
        const hash = utilityEncryption.generateHash(JSON.stringify(itemClone));
        itemClone.hash = hash;
        player.inventory.push(itemClone);
        player.data.inventory = JSON.stringify(player.inventory);
        player.setSyncedMeta('inventory', player.data.inventory);
        player.saveField(player.data.id, 'inventory', player.data.inventory);
    };

    // Remove an item from a player.
    player.subItem = (itemTemplate, quantity) => {
        let index = player.inventory.findIndex(
            x => x.label === itemTemplate.label
        );

        if (index <= -1) return false;

        if (player.inventory[index].quantity < quantity) return false;

        alt.emit('inventory:SubItem', player, index, quantity);
        return true;
    };

    player.subItemByHash = (itemHash, quantity) => {
        let index = player.inventory.findIndex(x => x.hash === itemHash);

        if (index <= -1) return false;

        if (player.inventory[index].quantity < quantity) return false;

        alt.emit('inventory:SubItem', player, index, quantity);
        return true;
    };

    player.addItemByHash = (itemHash, quantity) => {
        let index = player.inventory.findIndex(x => x.hash === itemHash);

        if (index <= -1) return false;

        alt.emit('inventory:AddItem', player, index, quantity);
    };

    player.destroyItem = itemHash => {
        let index = player.inventory.findIndex(x => x.hash === itemHash);

        if (index <= -1) return false;

        player.sendMessage(`${player.inventory[index].label} was destroyed.`);
        player.subItemByHash(itemHash, 1);
        return true;
    };

    // Mostly for consumption / item effects.
    player.consumeItem = itemHash => {
        let index = player.inventory.findIndex(x => x.hash === itemHash);

        if (index <= -1) return false;

        let consumedItem = {
            label: player.inventory[index].label,
            props: player.inventory[index].props
        };

        // Failed to consume.
        if (!player.subItemByHash(itemHash, 1)) return false;

        alt.emit('item:Consume', player, consumedItem);
        return true;
    };

    // Mostly for displaying items.
    player.useItem = itemHash => {
        let index = player.inventory.findIndex(x => x.hash === itemHash);

        if (index <= -1) return false;

        let consumedItem = {
            label: player.inventory[index].label,
            props: player.inventory[index].props
        };

        alt.emit('item:Use', player, consumedItem);
        player.updateInventory();
        return true;
    };

    player.updateInventory = () => {
        player.setSyncedMeta('inventory', JSON.stringify(player.inventory));
        alt.emitClient(player, 'inventory:FetchItems');
    };
}
