﻿import Request from './Request';
import riderStatus from './riderStatus'

class World {
    constructor(worldId, tokenFn) {
        this.worldId = worldId || 1;
        this.request = new Request(tokenFn);
    }

    riders() {
        return this.request.json(`/relay/worlds/${this.worldId}`);
    }

    riderStatus(playerId) {
        if (!playerId) {
            throw new Error('A player id is required - world.riderStatus(playerId)');
        }

        return this.request.protobuf(`/relay/worlds/${this.worldId}/players/${playerId}`)
            .then(buffer => {
                return new Promise((resolve, reject) => {
                    try {
                        const status = riderStatus(buffer);
                        resolve(status);
                    } catch(ex) {
                        console.log(`Error decoding protobuf riderStatus - ${ex.message}`)
                        console.log(ex)

                        reject({
                            response: {
                                status: 500,
                                statusText: ex.message
                            }
                        });
                    }
                })
            });
    }

    sendRideOn(myId, theirId, firstName, lastName, countryCode) {
        const data = {
            f2: 1,
            f3: 4,
            attributeMessage: {
                myId,
                theirId,
                firstName,
                lastName,
                countryCode
            },
            theirId,
            f13: 60
        };

        return this.request.post(
            `/relay/worlds/${this.worldId}/attributes`,
            data,
            'application/x-protobuf-lite',
            'arraybuffer');
    }
}

export default World;
