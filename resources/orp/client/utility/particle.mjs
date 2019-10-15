import * as alt from 'alt';
import * as native from 'natives';

alt.onServer('tryParticle', (dict, name, duration, scale, x, y, z) => {
    playParticleFX(dict, name, duration, scale, x, y, z);
});

export function playParticleFX(dict, name, duration, scale, x = 0, y = 0, z = 0) {
    const particles = [];
    if (name.includes('scr')) return; // scr particles break things easily.
    const interval = alt.setInterval(() => {
        native.requestPtfxAsset(dict);
        native.useParticleFxAsset(dict);
        const particle = native.startParticleFxLoopedOnEntity(
            name,
            alt.Player.local.scriptID,
            x,
            y,
            z,
            0,
            0,
            0,
            scale,
            false,
            false,
            false
        );
        particles.push(particle);
    }, 0);
    alt.log(`particle.mjs ${interval}`);

    alt.setTimeout(() => {
        alt.clearInterval(interval);
        native.stopFireInRange(
            alt.Player.local.pos.x,
            alt.Player.local.pos.y,
            alt.Player.local.pos.z,
            10
        );

        alt.setTimeout(() => {
            particles.forEach(particle => {
                alt.nextTick(() => {
                    //native.removeParticleFxFromEntity(alt.Player.local.scriptID);
                    //native.removeParticleFx(particle, false);
                    native.stopParticleFxLooped(particle, false);
                });
            });
        }, duration * 2);
    }, duration);
}
