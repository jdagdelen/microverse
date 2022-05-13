class PendulumActor {
    setup() {
        let d = 10;
        this.removeObjects();
        this.links = [...Array(d).keys()].map((i) => {
            let kinematic;
            if (i === d - 1) {
                kinematic = Worldcore.RAPIER.RigidBodyDesc.newKinematicPositionBased();
            } else {
                kinematic = Worldcore.RAPIER.RigidBodyDesc.newDynamic();
            }

            let card;
            if (i === 0) {
                card = this.createCard({
                    type: "3d",
                    dataLocation: "3_EGjDfsBvE93taoFG1Uq6hS6MtH_JMHT33IaSwpij0gR1tbX1wVAABJRkNKXAFaXAFMXUBeWkpbAUZAAFoAaEt5TVZDZlxuRH5MbXdLHGhXTllWWHpkeHZ2HQBGQAFMXUBeWkpbAUJGTF1AWUpdXEoATHBmAldHRFZ5Wn9NYnpJSktgZVpESmRBRHt2YW1fYnV4W3gZXh1iRGQeegBLTltOAF1ment6SR0dQGhFHhhZfE1KYxdeGm12d1dCVUldf3pYaEoWRFoaSVlZF2I",
                    modelType: "glb",
                    translation: [0, i * 1.5 + 5, -10],
                    name: `link${i}`,
                    behaviorModules: ["Rapier"],
                    noSave: true,
                });
            } else {
                card = this.createCard({
                    type: "object",
                    translation: [0, i * 1.5 + 5, -10],
                    name: `link${i}`,
                    behaviorModules: ["Rapier", "PendulumLink"],
                    noSave: true,
                });
            }
            card.call("Rapier$RapierActor", "createRigidBody", kinematic);

            let s = [0.1, 1];
            s = [s[1] / 2, s[0]];
            let cd = Worldcore.RAPIER.ColliderDesc.cylinder(...s);

            cd.setRestitution(0.5);
            cd.setFriction(1);
            cd.setDensity(1.5);

            card.call("Rapier$RapierActor", "createCollider", cd);
            return card;
        });

        this.joints = [...Array(d - 1).keys()].map((i) => {
            let card = this.createCard({
                type: "object",
                name: `joint${i}`,
                behaviorModules: ["Rapier", "PendulumJoint"],
                noSave: true,
            });
            card.call(
                "Rapier$RapierActor", "createImpulseJoint", "ball", this.links[i], this.links[i + 1],
                {x: 0, y: 1, z: 0}, {x: 0, y: -1, z: 0}
            );
            // card.future(3000).destroy(); 
            return card;
        });
    }

    removeObjects() {
        if (this.links) {
            this.links.forEach(l => l.destroy());
            this.links = null;
        }
        if (this.joints) {
            this.joints.forEach(j => j.destroy());
            this.joints = null;
        }
    }
}

class PendulumPawn {
    setup() {
        if (this.obj) {
            this.shape.children.forEach((o) => this.shape.remove(o));
            this.shape.children = [];
            this.obj.dispose();
            this.obj = null;
        }

        let geometry = new Worldcore.THREE.BoxGeometry(0.2, 0.2, 0.2);
        let material = new Worldcore.THREE.MeshStandardMaterial({color: this.actor._cardData.color || 0xcccccc});
        this.obj = new Worldcore.THREE.Mesh(geometry, material);
        this.obj.castShadow = this.actor._cardData.shadow;
        this.obj.receiveShadow = this.actor._cardData.shadow;

        this.shape.add(this.obj);

        this.removeEventListener("pointerDoubleDown", "onPointerDoubleDown");
        this.addEventListener("pointerDoubleDown", "nop");
    }
}

class PendulumLinkActor {
    setup() {
        this.addEventListener("pointerTap", "jolt");
    }

    jolt() {
        // Apply an upward force and random spin.
        let r = this.rigidBody;
        if (r) {
            r.applyForce({x: 40, y: 0, z: 0}, true);
            // r.applyTorque({x: Math.random() * 50, y: Math.random() * 20, z: Math.random() * 50}, true);
        }
    }
}

class PendulumLinkPawn {
    setup() {
        /*
          Creates a Three.JS mesh based on the specified rapierShape and rapierSize.

          For a demo purpose, it does not override an existing shape
          (by checking this.shape.children.length) so that the earth
          shape created by FlightTracker behavior is preserved.

          Uncomment the cyclinder case to add the cylinder shape.

        */
        this.shape.children.forEach((c) => this.shape.remove(c));
        this.shape.children = [];

        let s = [0.1, 2.1];
        let geometry = new Worldcore.THREE.CylinderGeometry(s[0], s[0], s[1], 20);
        let material = new Worldcore.THREE.MeshStandardMaterial({color: this.actor._cardData.color || 0xcccccc});
        this.obj = new Worldcore.THREE.Mesh(geometry, material);
        this.obj.castShadow = this.actor._cardData.shadow;
        this.obj.receiveShadow = this.actor._cardData.shadow;

        this.shape.add(this.obj);

        this.removeEventListener("pointerDoubleDown", "onPointerDoubleDown");
        this.addEventListener("pointerDoubleDown", "nop");
    }
}

class PendulumJointPawn {
    setup() {
        this.removeEventListener("pointerDoubleDown", "onPointerDoubleDown");
        this.addEventListener("pointerDoubleDown", "nop");
    }
}

export default {
    modules: [
        {
            name: "Pendulum",
            actorBehaviors: [PendulumActor],
            pawnBehaviors: [PendulumPawn]
        },
        {
            name: "PendulumLink",
            actorBehaviors: [PendulumLinkActor],
            pawnBehaviors: [PendulumLinkPawn]
        },
        {
            name: "PendulumJoint",
            pawnBehaviors: [PendulumJointPawn]
        }
    ]
}

/* globals Worldcore */