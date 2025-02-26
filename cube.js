//Cube Tween Draggable Control

// timer problem at start or after solved


const animationEngine = (() => {
    let uniqueID = 0;

    class AnimationEngine {

        constructor() {
            this.animations = new Map();
            this.update = this.update.bind(this);
            this.raf = 0;
            this.time = performance.now();;
        }

        update() {
            const now = performance.now();
            const delta = now - this.time;
            this.time = now;
            this.animations.forEach(anim => anim.update(delta));
            if (this.animations.size) this.raf = requestAnimationFrame(this.update);
            else this.raf = 0;
        }

        add(animation) {
            animation.id = uniqueID++;
            this.animations.set(animation.id, animation);
            if (!this.raf) this.raf = requestAnimationFrame(this.update);
        }

        remove(animation) {
            this.animations.delete(animation.id);

        }
    }
    return new AnimationEngine();
})();

class Animation {

    constructor(start = false) {
        if (start) this.start();
    }

    start() {
        animationEngine.add(this);
    }

    stop() {
        animationEngine.remove(this);
    }

    update(delta) {}
}

class World extends Animation {

    constructor(game) {
        super(true);
        this.game = game;
        this.container = this.game.dom.game;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(2, 1, 0.1, 10000);
        this.stage = { width: 2, height: 3 };
        this.fov = 10;
        this.createLights();
        this.resize();
        window.addEventListener('resize', () => this.resize(), false);
    }

    update() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const { offsetWidth: width, offsetHeight: height } = this.container;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.fov = this.fov;
        const aspect = this.stage.width / this.stage.height;
        const fovRad = this.fov * THREE.Math.DEG2RAD;

        let distance = (aspect < this.camera.aspect)?
            (this.stage.height / 2) / Math.tan(fovRad / 2) :
            (this.stage.width / this.camera.aspect) / (2 * Math.tan(fovRad / 2))
        ;
        distance *= 0.5;
        this.camera.position.set(distance, distance, distance);
        this.camera.lookAt(this.scene.position);
        this.camera.updateProjectionMatrix();
    }

    createLights() {
        this.lights = {
            ambient: new THREE.AmbientLight(0xffffff, 0.69),
            front: new THREE.DirectionalLight(0xffffff, 0.36),
            back: new THREE.DirectionalLight(0xffffff, 0.19),
        };
        this.lights.front.position.set(1.5, 5, 3);
        this.lights.back.position.set(-1.5, -5, -3);
        this.light_holder = new THREE.Object3D;
        this.light_holder.add(this.lights.ambient);
        this.light_holder.add(this.lights.front);
        this.light_holder.add(this.lights.back);
        this.scene.add(this.light_holder);
    }

}

function RoundedBoxGeometry(size, radius, radiusSegments) {

    THREE.BufferGeometry.call(this);

    this.type = 'RoundedBoxGeometry';

    radiusSegments = !isNaN(radiusSegments) ? Math.max(1, Math.floor(radiusSegments)) : 1;

    var width, height, depth;

    width = height = depth = size;
    radius = size * radius;

    radius = Math.min(radius, Math.min(width, Math.min(height, Math.min(depth))) / 2);

    var edgeHalfWidth = width / 2 - radius;
    var edgeHalfHeight = height / 2 - radius;
    var edgeHalfDepth = depth / 2 - radius;

    this.parameters = {
        width: width,
        height: height,
        depth: depth,
        radius: radius,
        radiusSegments: radiusSegments
    };

    var rs1 = radiusSegments + 1;
    var totalVertexCount = (rs1 * radiusSegments + 1) << 3;

    var positions = new THREE.BufferAttribute(new Float32Array(totalVertexCount * 3), 3);
    var normals = new THREE.BufferAttribute(new Float32Array(totalVertexCount * 3), 3);

    var
        cornerVerts = [],
        cornerNormals = [],
        normal = new THREE.Vector3(),
        vertex = new THREE.Vector3(),
        vertexPool = [],
        normalPool = [],
        indices = []
        ;

    var
        lastVertex = rs1 * radiusSegments,
        cornerVertNumber = rs1 * radiusSegments + 1
        ;

    doVertices();
    doFaces();
    doCorners();
    doHeightEdges();
    doWidthEdges();
    doDepthEdges();

    function doVertices() {

        var cornerLayout = [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, - 1),
            new THREE.Vector3(- 1, 1, - 1),
            new THREE.Vector3(- 1, 1, 1),
            new THREE.Vector3(1, - 1, 1),
            new THREE.Vector3(1, - 1, - 1),
            new THREE.Vector3(- 1, - 1, - 1),
            new THREE.Vector3(- 1, - 1, 1)
        ];

        for (var j = 0; j < 8; j++) {

            cornerVerts.push([]);
            cornerNormals.push([]);

        }

        var PIhalf = Math.PI / 2;
        var cornerOffset = new THREE.Vector3(edgeHalfWidth, edgeHalfHeight, edgeHalfDepth);

        for (var y = 0; y <= radiusSegments; y++) {

            var v = y / radiusSegments;
            var va = v * PIhalf;
            var cosVa = Math.cos(va);
            var sinVa = Math.sin(va);

            if (y == radiusSegments) {

                vertex.set(0, 1, 0);
                var vert = vertex.clone().multiplyScalar(radius).add(cornerOffset);
                cornerVerts[0].push(vert);
                vertexPool.push(vert);
                var norm = vertex.clone();
                cornerNormals[0].push(norm);
                normalPool.push(norm);
                continue;

            }

            for (var x = 0; x <= radiusSegments; x++) {

                var u = x / radiusSegments;
                var ha = u * PIhalf;
                vertex.x = cosVa * Math.cos(ha);
                vertex.y = sinVa;
                vertex.z = cosVa * Math.sin(ha);

                var vert = vertex.clone().multiplyScalar(radius).add(cornerOffset);
                cornerVerts[0].push(vert);
                vertexPool.push(vert);

                var norm = vertex.clone().normalize();
                cornerNormals[0].push(norm);
                normalPool.push(norm);

            }

        }

        for (var i = 1; i < 8; i++) {

            for (var j = 0; j < cornerVerts[0].length; j++) {

                var vert = cornerVerts[0][j].clone().multiply(cornerLayout[i]);
                cornerVerts[i].push(vert);
                vertexPool.push(vert);

                var norm = cornerNormals[0][j].clone().multiply(cornerLayout[i]);
                cornerNormals[i].push(norm);
                normalPool.push(norm);

            }

        }

    }

    function doCorners() {

        var flips = [
            true,
            false,
            true,
            false,
            false,
            true,
            false,
            true
        ];

        var lastRowOffset = rs1 * (radiusSegments - 1);

        for (var i = 0; i < 8; i++) {

            var cornerOffset = cornerVertNumber * i;

            for (var v = 0; v < radiusSegments - 1; v++) {

                var r1 = v * rs1;
                var r2 = (v + 1) * rs1;

                for (var u = 0; u < radiusSegments; u++) {

                    var u1 = u + 1;
                    var a = cornerOffset + r1 + u;
                    var b = cornerOffset + r1 + u1;
                    var c = cornerOffset + r2 + u;
                    var d = cornerOffset + r2 + u1;

                    if (!flips[i]) {

                        indices.push(a);
                        indices.push(b);
                        indices.push(c);

                        indices.push(b);
                        indices.push(d);
                        indices.push(c);

                    } else {

                        indices.push(a);
                        indices.push(c);
                        indices.push(b);

                        indices.push(b);
                        indices.push(c);
                        indices.push(d);

                    }

                }

            }

            for (var u = 0; u < radiusSegments; u++) {

                var a = cornerOffset + lastRowOffset + u;
                var b = cornerOffset + lastRowOffset + u + 1;
                var c = cornerOffset + lastVertex;

                if (!flips[i]) {

                    indices.push(a);
                    indices.push(b);
                    indices.push(c);

                } else {

                    indices.push(a);
                    indices.push(c);
                    indices.push(b);

                }

            }

        }

    }

    function doFaces() {

        var a = lastVertex;
        var b = lastVertex + cornerVertNumber;
        var c = lastVertex + cornerVertNumber * 2;
        var d = lastVertex + cornerVertNumber * 3;

        indices.push(a);
        indices.push(b);
        indices.push(c);
        indices.push(a);
        indices.push(c);
        indices.push(d);

        a = lastVertex + cornerVertNumber * 4;
        b = lastVertex + cornerVertNumber * 5;
        c = lastVertex + cornerVertNumber * 6;
        d = lastVertex + cornerVertNumber * 7;

        indices.push(a);
        indices.push(c);
        indices.push(b);
        indices.push(a);
        indices.push(d);
        indices.push(c);

        a = 0;
        b = cornerVertNumber;
        c = cornerVertNumber * 4;
        d = cornerVertNumber * 5;

        indices.push(a);
        indices.push(c);
        indices.push(b);
        indices.push(b);
        indices.push(c);
        indices.push(d);

        a = cornerVertNumber * 2;
        b = cornerVertNumber * 3;
        c = cornerVertNumber * 6;
        d = cornerVertNumber * 7;

        indices.push(a);
        indices.push(c);
        indices.push(b);
        indices.push(b);
        indices.push(c);
        indices.push(d);

        a = radiusSegments;
        b = radiusSegments + cornerVertNumber * 3;
        c = radiusSegments + cornerVertNumber * 4;
        d = radiusSegments + cornerVertNumber * 7;

        indices.push(a);
        indices.push(b);
        indices.push(c);
        indices.push(b);
        indices.push(d);
        indices.push(c);

        a = radiusSegments + cornerVertNumber;
        b = radiusSegments + cornerVertNumber * 2;
        c = radiusSegments + cornerVertNumber * 5;
        d = radiusSegments + cornerVertNumber * 6;

        indices.push(a);
        indices.push(c);
        indices.push(b);
        indices.push(b);
        indices.push(c);
        indices.push(d);

    }

    function doHeightEdges() {

        for (var i = 0; i < 4; i++) {

            var cOffset = i * cornerVertNumber;
            var cRowOffset = 4 * cornerVertNumber + cOffset;
            var needsFlip = i & 1 === 1;

            for (var u = 0; u < radiusSegments; u++) {

                var u1 = u + 1;
                var a = cOffset + u;
                var b = cOffset + u1;
                var c = cRowOffset + u;
                var d = cRowOffset + u1;

                if (!needsFlip) {

                    indices.push(a);
                    indices.push(b);
                    indices.push(c);
                    indices.push(b);
                    indices.push(d);
                    indices.push(c);

                } else {

                    indices.push(a);
                    indices.push(c);
                    indices.push(b);
                    indices.push(b);
                    indices.push(c);
                    indices.push(d);

                }

            }

        }

    }

    function doDepthEdges() {

        var cStarts = [0, 2, 4, 6];
        var cEnds = [1, 3, 5, 7];

        for (var i = 0; i < 4; i++) {

            var cStart = cornerVertNumber * cStarts[i];
            var cEnd = cornerVertNumber * cEnds[i];

            var needsFlip = 1 >= i;

            for (var u = 0; u < radiusSegments; u++) {

                var urs1 = u * rs1;
                var u1rs1 = (u + 1) * rs1;

                var a = cStart + urs1;
                var b = cStart + u1rs1;
                var c = cEnd + urs1;
                var d = cEnd + u1rs1;

                if (needsFlip) {

                    indices.push(a);
                    indices.push(c);
                    indices.push(b);
                    indices.push(b);
                    indices.push(c);
                    indices.push(d);

                } else {

                    indices.push(a);
                    indices.push(b);
                    indices.push(c);
                    indices.push(b);
                    indices.push(d);
                    indices.push(c);

                }

            }

        }

    }

    function doWidthEdges() {

        var end = radiusSegments - 1;

        var cStarts = [0, 1, 4, 5];
        var cEnds = [3, 2, 7, 6];
        var needsFlip = [0, 1, 1, 0];

        for (var i = 0; i < 4; i++) {

            var cStart = cStarts[i] * cornerVertNumber;
            var cEnd = cEnds[i] * cornerVertNumber;

            for (var u = 0; u <= end; u++) {

                var a = cStart + radiusSegments + u * rs1;
                var b = cStart + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);

                var c = cEnd + radiusSegments + u * rs1;
                var d = cEnd + (u != end ? radiusSegments + (u + 1) * rs1 : cornerVertNumber - 1);

                if (!needsFlip[i]) {

                    indices.push(a);
                    indices.push(b);
                    indices.push(c);
                    indices.push(b);
                    indices.push(d);
                    indices.push(c);

                } else {

                    indices.push(a);
                    indices.push(c);
                    indices.push(b);
                    indices.push(b);
                    indices.push(c);
                    indices.push(d);

                }

            }

        }

    }

    var index = 0;

    for (var i = 0; i < vertexPool.length; i++) {

        positions.setXYZ(
            index,
            vertexPool[i].x,
            vertexPool[i].y,
            vertexPool[i].z
        );

        normals.setXYZ(
            index,
            normalPool[i].x,
            normalPool[i].y,
            normalPool[i].z
        );

        index++;

    }

    this.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    this.addAttribute('position', positions);
    this.addAttribute('normal', normals);

}

RoundedBoxGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
RoundedBoxGeometry.constructor = RoundedBoxGeometry;

function RoundedPlaneGeometry(size, radius, depth) {

    var x, y, width, height;

    x = y = - size / 2;
    width = height = size;
    radius = size * radius;

    const shape = new THREE.Shape();

    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    const geometry = new THREE.ExtrudeBufferGeometry(
        shape,
        { depth: depth, bevelEnabled: false, curveSegments: 3 }
    );

    return geometry;

}

class Cube {

    constructor(game) {
        this.game = game;
        this.size = 3;
        this.geometry = {
            pieceCornerRadius: 0.12,
            edgeCornerRoundness: 0.15,
            edgeScale: 0.82,
            edgeDepth: 0.01,
        };
        this.holder = new THREE.Object3D();
        this.object = new THREE.Object3D();
        this.animator = new THREE.Object3D();
        this.holder.add(this.animator);
        this.animator.add(this.object);
        this.game.world.scene.add(this.holder);
    }

    init() {
        this.cubes = [];
        this.object.children = [];
        this.object.add(this.game.controls.group);

        this.scale = 3 / this.size;

        this.object.scale.set(this.scale, this.scale, this.scale);

        const controlsScale = this.size === 2 ? 0.825 : 1;
        this.game.controls.edges.scale.set(controlsScale, controlsScale, controlsScale);

        this.generatePositions();
        this.generateModel();

        this.pieces.forEach(piece => {

            this.cubes.push(piece.userData.cube);
            this.object.add(piece);

        });

        this.holder.traverse(node => {

            if (node.frustumCulled) node.frustumCulled = false;

        });

        this.updateColors(this.game.themes.getColors());
    }



    generatePositions() {

        const m = this.size - 1;
        const first = this.size % 2 !== 0
            ? 0 - Math.floor(this.size / 2)
            : 0.5 - this.size / 2;

        let x, y, z;

        this.positions = [];

        for (x = 0; x < this.size; x++) {
            for (y = 0; y < this.size; y++) {
                for (z = 0; z < this.size; z++) {

                    let position = new THREE.Vector3(first + x, first + y, first + z);
                    let edges = [];

                    if (x == 0) edges.push(0);
                    if (x == m) edges.push(1);
                    if (y == 0) edges.push(2);
                    if (y == m) edges.push(3);
                    if (z == 0) edges.push(4);
                    if (z == m) edges.push(5);

                    position.edges = edges;
                    this.positions.push(position);

                }
            }
        }

    }

    generateModel() {

        this.pieces = [];
        this.edges = [];

        const pieceSize = 1 / 3;

        const mainMaterial = new THREE.MeshLambertMaterial();

        const pieceMesh = new THREE.Mesh(
            new RoundedBoxGeometry(pieceSize, this.geometry.pieceCornerRadius, 3),
            mainMaterial.clone()
        );

        const edgeGeometry = RoundedPlaneGeometry(
            pieceSize,
            this.geometry.edgeCornerRoundness,
            this.geometry.edgeDepth
        );

        this.positions.forEach((position, index) => {

            const piece = new THREE.Object3D();
            const pieceCube = pieceMesh.clone();
            const pieceEdges = [];

            piece.position.copy(position.clone().divideScalar(3));
            piece.add(pieceCube);
            piece.name = index;
            piece.edgesName = '';

            position.edges.forEach(position => {

                const edge = new THREE.Mesh(edgeGeometry, mainMaterial.clone());
                const name = ['L', 'R', 'D', 'U', 'B', 'F'][position];
                const distance = pieceSize / 2;

                edge.position.set(
                    distance * [- 1, 1, 0, 0, 0, 0][position],
                    distance * [0, 0, - 1, 1, 0, 0][position],
                    distance * [0, 0, 0, 0, - 1, 1][position]
                );

                edge.rotation.set(
                    Math.PI / 2 * [0, 0, 1, - 1, 0, 0][position],
                    Math.PI / 2 * [- 1, 1, 0, 0, 2, 0][position],
                    0
                );

                edge.scale.set(
                    this.geometry.edgeScale,
                    this.geometry.edgeScale,
                    this.geometry.edgeScale
                );

                edge.name = name;

                piece.add(edge);
                pieceEdges.push(name);
                this.edges.push(edge);

            });

            piece.userData.edges = pieceEdges;
            piece.userData.cube = pieceCube;

            piece.userData.start = {
                position: piece.position.clone(),
                rotation: piece.rotation.clone(),
            };

            this.pieces.push(piece);

        });

    }

    updateColors(colors) {

        if (typeof this.pieces !== 'object' && typeof this.edges !== 'object') return;

        this.pieces.forEach(piece => piece.userData.cube.material.color.setHex(colors.P));
        this.edges.forEach(edge => edge.material.color.setHex(colors[edge.name]));

    }
}

const Easing = {

    Power: {
        In: power => {

            power = Math.round(power || 1);

            return t => Math.pow(t, power);

        },

        Out: power => {

            power = Math.round(power || 1);

            return t => 1 - Math.abs(Math.pow(t - 1, power));

        },

        InOut: power => {

            power = Math.round(power || 1);

            return t => (t < 0.5)
                ? Math.pow(t * 2, power) / 2
                : (1 - Math.abs(Math.pow((t * 2 - 1) - 1, power))) / 2 + 0.5;

        },
    },

    Sine: {
        In: () => t => 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2),

        Out: () => t => Math.sin(Math.PI / 2 * t),

        InOut: () => t => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2,
    },

    Back: {
        Out: s => {

            s = s || 1.70158;

            return t => { return (t -= 1) * t * ((s + 1) * t + s) + 1; };

        },

        In: s => {

            s = s || 1.70158;

            return t => { return t * t * ((s + 1) * t - s); };

        }
    }
};

class Tween extends Animation {

    constructor(options) {

        super(false);

        this.duration = options.duration || 500;
        this.easing = options.easing || (t => t);
        this.onUpdate = options.onUpdate || (() => { });
        this.onComplete = options.onComplete || (() => { });

        this.delay = options.delay || false;
        this.yoyo = options.yoyo ? false : null;

        this.progress = 0;
        this.value = 0;
        this.delta = 0;

        this.getFromTo(options);

        if (this.delay) setTimeout(() => super.start(), this.delay);
        else super.start();

        this.onUpdate(this);

    }

    update(delta) {

        const old = this.value * 1;
        const direction = (this.yoyo === true) ? - 1 : 1;

        this.progress += (delta / this.duration) * direction;

        this.value = this.easing(this.progress);
        this.delta = this.value - old;

        if (this.values !== null) this.updateFromTo();

        if (this.yoyo !== null) this.updateYoyo();
        else if (this.progress <= 1) this.onUpdate(this);
        else {

            this.progress = 1;
            this.value = 1;
            this.onUpdate(this);
            this.onComplete(this);
            super.stop();

        }

    }

    updateYoyo() {

        if (this.progress > 1 || this.progress < 0) {

            this.value = this.progress = (this.progress > 1) ? 1 : 0;
            this.yoyo = !this.yoyo;

        }

        this.onUpdate(this);

    }

    updateFromTo() {

        this.values.forEach(key => {

            this.target[key] = this.from[key] + (this.to[key] - this.from[key]) * this.value;

        });

    }

    getFromTo(options) {

        if (!options.target || !options.to) {

            this.values = null;
            return;

        }

        this.target = options.target || null;
        this.from = options.from || {};
        this.to = options.to || null;
        this.values = [];

        if (Object.keys(this.from).length < 1)
            Object.keys(this.to).forEach(key => { this.from[key] = this.target[key]; });

        Object.keys(this.to).forEach(key => { this.values.push(key); });

    }

}


window.addEventListener('touchmove', () => { });
document.addEventListener('touchmove', event => { event.preventDefault(); }, { passive: false });

class Draggable {

    constructor(element, options) {

        this.position = {
            current: new THREE.Vector2(),
            start: new THREE.Vector2(),
            delta: new THREE.Vector2(),
            old: new THREE.Vector2(),
            drag: new THREE.Vector2(),
        };

        this.options = Object.assign({
            calcDelta: false,
        }, options || {});

        this.element = element;
        this.touch = null;

        this.drag = {

            start: (event) => {

                if (event.type == 'mousedown' && event.which != 1) return;
                if (event.type == 'touchstart' && event.touches.length > 1) return;

                this.getPositionCurrent(event);

                if (this.options.calcDelta) {

                    this.position.start = this.position.current.clone();
                    this.position.delta.set(0, 0);
                    this.position.drag.set(0, 0);

                }

                this.touch = (event.type == 'touchstart');

                this.onDragStart(this.position);

                window.addEventListener((this.touch) ? 'touchmove' : 'mousemove', this.drag.move, false);
                window.addEventListener((this.touch) ? 'touchend' : 'mouseup', this.drag.end, false);

            },

            move: (event) => {

                if (this.options.calcDelta) {

                    this.position.old = this.position.current.clone();

                }

                this.getPositionCurrent(event);

                if (this.options.calcDelta) {

                    this.position.delta = this.position.current.clone().sub(this.position.old);
                    this.position.drag = this.position.current.clone().sub(this.position.start);

                }

                this.onDragMove(this.position);

            },

            end: (event) => {

                this.getPositionCurrent(event);

                this.onDragEnd(this.position);

                window.removeEventListener((this.touch) ? 'touchmove' : 'mousemove', this.drag.move, false);
                window.removeEventListener((this.touch) ? 'touchend' : 'mouseup', this.drag.end, false);

            },

        };

        this.onDragStart = () => { };
        this.onDragMove = () => { };
        this.onDragEnd = () => { };


        return this;

    }

    enable() {

        this.element.addEventListener('touchstart', this.drag.start, false);
        this.element.addEventListener('mousedown', this.drag.start, false);

        return this;

    }


    getPositionCurrent(event) {

        const dragEvent = event.touches
            ? (event.touches[0] || event.changedTouches[0])
            : event;

        this.position.current.set(dragEvent.pageX, dragEvent.pageY);

    }

    convertPosition(position) {

        position.x = (position.x / this.element.offsetWidth) * 2 - 1;
        position.y = - ((position.y / this.element.offsetHeight) * 2 - 1);

        return position;

    }

}

const STILL = 0;
const PREPARING = 1;
const ROTATING = 2;
const ANIMATING = 3;


class Controls {

    constructor(game) {

        this.game = game;

        this.flipConfig = 0;

        this.flipEasings = [Easing.Power.Out(3), Easing.Sine.Out(), Easing.Back.Out(1.5)];
        this.flipSpeeds = [125, 200, 300];

        this.raycaster = new THREE.Raycaster();

        const helperMaterial = new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff });

        this.group = new THREE.Object3D();
        this.group.name = 'controls';
        this.game.cube.object.add(this.group);

        this.helper = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(200, 200),
            helperMaterial.clone()
        );

        this.helper.rotation.set(0, Math.PI / 4, 0);
        this.game.world.scene.add(this.helper);

        this.edges = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 1, 1),
            helperMaterial.clone(),
        );

        this.game.world.scene.add(this.edges);

        this.onSolved = () => { };
        this.onMove = () => { };

        this.momentum = [];

        this.scramble = null;
        this.state = STILL;

        this.initDraggable();

    }

    enable() {

        this.draggable.enable();

    }



    initDraggable() {

        this.draggable = new Draggable(this.game.dom.game);

        this.draggable.onDragStart = position => {

            if (this.scramble !== null) return;
            if (this.state === PREPARING || this.state === ROTATING) return;

            this.gettingDrag = this.state === ANIMATING;

            const edgeIntersect = this.getIntersect(position.current, this.edges, false);

            if (edgeIntersect !== false) {

                this.dragIntersect = this.getIntersect(position.current, this.game.cube.cubes, true);

            }

            if (edgeIntersect !== false && this.dragIntersect !== false) {

                this.dragNormal = edgeIntersect.face.normal.round();
                this.flipType = 'layer';

                this.attach(this.helper, this.edges);

                this.helper.rotation.set(0, 0, 0);
                this.helper.position.set(0, 0, 0);
                this.helper.lookAt(this.dragNormal);
                this.helper.translateZ(0.5);
                this.helper.updateMatrixWorld();

                this.detach(this.helper, this.edges);

            } else {

                this.dragNormal = new THREE.Vector3(0, 0, 1);
                this.flipType = 'cube';

                this.helper.position.set(0, 0, 0);
                this.helper.rotation.set(0, Math.PI / 4, 0);
                this.helper.updateMatrixWorld();

            }

            let planeIntersect = this.getIntersect(position.current, this.helper, false);
            if (planeIntersect === false) return;

            this.dragCurrent = this.helper.worldToLocal(planeIntersect.point);
            this.dragTotal = new THREE.Vector3();
            this.state = (this.state === STILL) ? PREPARING : this.state;

        };

        this.draggable.onDragMove = position => {

            if (this.scramble !== null) return;
            if (this.state === STILL || (this.state === ANIMATING && this.gettingDrag === false)) return;

            const planeIntersect = this.getIntersect(position.current, this.helper, false);
            if (planeIntersect === false) return;

            const point = this.helper.worldToLocal(planeIntersect.point.clone());

            this.dragDelta = point.clone().sub(this.dragCurrent).setZ(0);
            this.dragTotal.add(this.dragDelta);
            this.dragCurrent = point;
            this.addMomentumPoint(this.dragDelta);

            if (this.state === PREPARING && this.dragTotal.length() > 0.05) {

                this.dragDirection = this.getMainAxis(this.dragTotal);

                if (this.flipType === 'layer') {

                    const direction = new THREE.Vector3();
                    direction[this.dragDirection] = 1;

                    const worldDirection = this.helper.localToWorld(direction).sub(this.helper.position);
                    const objectDirection = this.edges.worldToLocal(worldDirection).round();

                    this.flipAxis = objectDirection.cross(this.dragNormal).negate();

                    this.selectLayer(this.getLayer(false));

                } else {

                    const axis = (this.dragDirection != 'x')
                        ? ((this.dragDirection == 'y' && position.current.x > this.game.world.width / 2) ? 'z' : 'x')
                        : 'y';

                    this.flipAxis = new THREE.Vector3();
                    this.flipAxis[axis] = 1 * ((axis == 'x') ? - 1 : 1);

                }

                this.flipAngle = 0;
                this.state = ROTATING;

            } else if (this.state === ROTATING) {

                const rotation = this.dragDelta[this.dragDirection];

                if (this.flipType === 'layer') {

                    this.group.rotateOnAxis(this.flipAxis, rotation);
                    this.flipAngle += rotation;

                } else {

                    this.edges.rotateOnWorldAxis(this.flipAxis, rotation);
                    this.game.cube.object.rotation.copy(this.edges.rotation);
                    this.flipAngle += rotation;

                }

            }

        };

        this.draggable.onDragEnd = position => {

            if (this.scramble !== null) return;
            if (this.state !== ROTATING) {

                this.gettingDrag = false;
                this.state = STILL;
                return;

            }

            this.state = ANIMATING;

            const momentum = this.getMomentum()[this.dragDirection];
            const flip = (Math.abs(momentum) > 0.05 && Math.abs(this.flipAngle) < Math.PI / 2);

            const angle = flip
                ? this.roundAngle(this.flipAngle + Math.sign(this.flipAngle) * (Math.PI / 4))
                : this.roundAngle(this.flipAngle);

            const delta = angle - this.flipAngle;

            if (this.flipType === 'layer') {

                this.rotateLayer(delta, false, layer => {


                    this.state = this.gettingDrag ? PREPARING : STILL;
                    this.gettingDrag = false;

                    this.checkIsSolved();

                });

            } else {

                this.rotateCube(delta, () => {

                    this.state = this.gettingDrag ? PREPARING : STILL;
                    this.gettingDrag = false;

                });

            }

        };

    }

    rotateLayer(rotation, scramble, callback) {

        const config = scramble ? 0 : this.flipConfig;

        const easing = this.flipEasings[config];
        const duration = this.flipSpeeds[config];
        const bounce = (config == 2) ? this.bounceCube() : (() => { });

        this.rotationTween = new Tween({
            easing: easing,
            duration: duration,
            onUpdate: tween => {

                let deltaAngle = tween.delta * rotation;
                this.group.rotateOnAxis(this.flipAxis, deltaAngle);
                bounce(tween.value, deltaAngle, rotation);

            },
            onComplete: () => {

                if (!scramble) this.onMove();

                const layer = this.flipLayer.slice(0);

                this.game.cube.object.rotation.setFromVector3(this.snapRotation(this.game.cube.object.rotation.toVector3()));
                this.group.rotation.setFromVector3(this.snapRotation(this.group.rotation.toVector3()));
                this.deselectLayer(this.flipLayer);

                callback(layer);

            },
        });

    }

    bounceCube() {

        let fixDelta = true;

        return (progress, delta, rotation) => {

            if (progress >= 1) {

                if (fixDelta) {

                    delta = (progress - 1) * rotation;
                    fixDelta = false;

                }

                this.game.cube.object.rotateOnAxis(this.flipAxis, delta);

            }

        }

    }

    rotateCube(rotation, callback) {

        const config = this.flipConfig;
        const easing = [Easing.Power.Out(4), Easing.Sine.Out(), Easing.Back.Out(2)][config];
        const duration = [100, 150, 350][config];

        this.rotationTween = new Tween({
            easing: easing,
            duration: duration,
            onUpdate: tween => {

                this.edges.rotateOnWorldAxis(this.flipAxis, tween.delta * rotation);
                this.game.cube.object.rotation.copy(this.edges.rotation);

            },
            onComplete: () => {

                this.edges.rotation.setFromVector3(this.snapRotation(this.edges.rotation.toVector3()));
                this.game.cube.object.rotation.copy(this.edges.rotation);
                callback();

            },
        });

    }

    selectLayer(layer) {

        this.group.rotation.set(0, 0, 0);
        this.movePieces(layer, this.game.cube.object, this.group);
        this.flipLayer = layer;
        
    }

    deselectLayer(layer) {

        this.movePieces(layer, this.group, this.game.cube.object);
        this.flipLayer = null;

    }

    movePieces(layer, from, to) {

        from.updateMatrixWorld();
        to.updateMatrixWorld();

        layer.forEach(index => {

            const piece = this.game.cube.pieces[index];

            piece.applyMatrix(from.matrixWorld);
            from.remove(piece);
            piece.applyMatrix(new THREE.Matrix4().getInverse(to.matrixWorld));
            to.add(piece);

        });

    }

    getLayer(position) {

        const scalar = { 2: 6, 3: 3, 4: 4, 5: 3 }[this.game.cube.size];
        const layer = [];

        let axis;

        if (position === false) {

            const piece = this.dragIntersect.object.parent;

            axis = this.getMainAxis(this.flipAxis);
            position = piece.position.clone().multiplyScalar(scalar).round();

        } else {

            axis = this.getMainAxis(position);

        }

        this.game.cube.pieces.forEach(piece => {

            const piecePosition = piece.position.clone().multiplyScalar(scalar).round();

            if (piecePosition[axis] == position[axis]) layer.push(piece.name);

        });

        return layer;

    }

    scrambleCube() {
            if (this.scramble == null) {

                this.scramble = this.game.scrambler;
                this.scramble.callback = (typeof callback !== 'function') ? () => { } : callback;
                
            }

            const converted = this.scramble.converted;
            const move = converted[0];  
            const layer = this.getLayer(move.position);

            this.flipAxis = new THREE.Vector3();
            this.flipAxis[move.axis] = 1;

            this.selectLayer(layer);
            this.rotateLayer(move.angle, true, () => {

                converted.shift();

                if (converted.length > 0) {
                    this.scrambleCube();
                } 
                else {
                    this.scramble = null;
                }

            });
    }

    getIntersect(position, object, multiple) {

        this.raycaster.setFromCamera(
            this.draggable.convertPosition(position.clone()),
            this.game.world.camera
        );

        const intersect = (multiple)
            ? this.raycaster.intersectObjects(object)
            : this.raycaster.intersectObject(object);

        return (intersect.length > 0) ? intersect[0] : false;

    }

    getMainAxis(vector) {

        return Object.keys(vector).reduce(
            (a, b) => Math.abs(vector[a]) > Math.abs(vector[b]) ? a : b
        );

    }

    detach(child, parent) {

        child.applyMatrix(parent.matrixWorld);
        parent.remove(child);
        this.game.world.scene.add(child);

    }

    attach(child, parent) {

        child.applyMatrix(new THREE.Matrix4().getInverse(parent.matrixWorld));
        this.game.world.scene.remove(child);
        parent.add(child);

    }

    addMomentumPoint(delta) {

        const time = Date.now();

        this.momentum = this.momentum.filter(moment => time - moment.time < 500);

        if (delta !== false) this.momentum.push({ delta, time });

    }

    getMomentum() {

        const points = this.momentum.length;
        const momentum = new THREE.Vector2();

        this.addMomentumPoint(false);

        this.momentum.forEach((point, index) => {

            momentum.add(point.delta.multiplyScalar(index / points));

        });

        return momentum;

    }

    roundAngle(angle) {

        const round = Math.PI / 2;
        return Math.sign(angle) * Math.round(Math.abs(angle) / round) * round;

    }

    snapRotation(angle) {

        return angle.set(
            this.roundAngle(angle.x),
            this.roundAngle(angle.y),
            this.roundAngle(angle.z)
        );

    }

    checkIsSolved() {

        const start = performance.now();

        let solved = true;
        const sides = { 'x-': [], 'x+': [], 'y-': [], 'y+': [], 'z-': [], 'z+': [] };

        this.game.cube.edges.forEach(edge => {

            const position = edge.parent
                .localToWorld(edge.position.clone())
                .sub(this.game.cube.object.position);

            const mainAxis = this.getMainAxis(position);
            const mainSign = position.multiplyScalar(2).round()[mainAxis] < 1 ? '-' : '+';

            sides[mainAxis + mainSign].push(edge.name);

        });

        Object.keys(sides).forEach(side => {

            if (!sides[side].every(value => value === sides[side][0])) solved = false;

        });

        if (solved) this.onSolved();

    }

}

class Scrambler {

    constructor(game) {
        this.game = game;
        this.dificulty = 0;
        this.scrambleLength = {
            2: [7, 9, 11],
            3: [20, 25, 30],
            4: [30, 40, 50],
            5: [40, 60, 80],
        };
        this.moves = [];
        this.conveted = [];
        this.pring = '';
    }

    scramble() {
        let count = 0;
        this.moves =  [];

        if (this.moves.length < 1) {

            const scrambleLength = this.scrambleLength[this.game.cube.size][this.dificulty];

            const faces = this.game.cube.size < 4 ? 'UDLRFB' : 'UuDdLlRrFfBb';
            const modifiers = ["", "'", "2"];
            const total =  scrambleLength ;

            while (count < total) {

                const move =
                    faces[Math.floor(Math.random() * faces.length)] +
                    modifiers[Math.floor(Math.random() * 3)];

                if (count > 0 && move.charAt(0) == this.moves[count - 1].charAt(0)) continue;
                if (count > 1 && move.charAt(0) == this.moves[count - 2].charAt(0)) continue;

                this.moves.push(move);
                count++;
            }
        }

        this.callback = () => { };
        this.convert();
        this.print = this.moves.join(' ');
        return this;

    }

    convert(moves) {
        this.converted = [];
        this.moves.forEach(move => {
            const convertedMove = this.convertMove(move);
            const modifier = move.charAt(1);
            this.converted.push(convertedMove);
            if (modifier == "2") this.converted.push(convertedMove);
        });

    }

    convertMove(move) {
        const face = move.charAt(0);
        const modifier = move.charAt(1);
        const axis = { D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[face.toUpperCase()];
        let row = { D: -1, U: 1, L: -1, R: 1, F: 1, B: -1 }[face.toUpperCase()];
        if (this.game.cube.size > 3 && face !== face.toLowerCase()) row = row * 2;
        const position = new THREE.Vector3();
        position[{ D: 'y', U: 'y', L: 'x', R: 'x', F: 'z', B: 'z' }[face.toUpperCase()]] = row;
        const angle = (Math.PI / 2) * - row * ((modifier == "'") ? - 1 : 1);
        return { position, axis, angle, name: move };

    }

}

class Timer extends Animation {

    constructor(game) {
        super(false);
        this.game = game;
        this.reset();

    }

    start() {
        this.startTime =  Date.now();
        this.deltaTime = 0;
        this.converted = '0 :00';
        gsap.to(".performance__screen",{
            scaleX: 0,
            scaleY:1.25,
            duration: 0.5,
        });
        super.start();
    }

    reset() {
        super.stop();
        this.startTime = Date.now();
        this.deltaTime = 0;
        this.converted = '0 :00';
        this.update();
    }
    
    stop() {
        this.currentTime = Date.now();
        this.deltaTime = this.currentTime - this.startTime;
        this.convert();
        super.stop();
        //Finished
        const performanceText = document.querySelector("performance__screen");
        gsap.to(".performance__screen",{
            scaleX: 1,
            scaleY:1,
            duration: 0.5,
        });
        //Add ding sound
        //Performance screen popup(Best time, personal record etc.)
        //Add confetti effect???
        this.converted = "SOLVED";
        this.setText();
    }

    update() {
        const old = this.converted;
        this.currentTime = Date.now();
        this.deltaTime = this.currentTime - this.startTime;
        this.convert();

        if (this.converted != old) {
            localStorage.setItem('theCube_time', this.deltaTime);
            this.setText();
        }

    }

    convert() {
        const seconds = parseInt((this.deltaTime / 1000) % 60);
        const minutes = parseInt((this.deltaTime / (1000 * 60)));
        this.converted = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }

    setText() {
        this.game.dom.texts.timer.innerHTML = this.converted;
    }

}

class Preferences {

    constructor(game) {
        this.game = game;
    }
    
    init() {
        this.ranges = {

            size: new Range('size', {
                value: this.game.cube.size,
                range: [2, 5],
                step: 1,
                onUpdate: value => {

                    this.game.cube.size = value;

                    this.game.preferences.ranges.scramble.list.forEach((item, i) => {

                        item.innerHTML = this.game.scrambler.scrambleLength[this.game.cube.size][i];

                    });

                },
                onComplete: () => this.game.storage.savePreferences(),
            }),

            flip: new Range('flip', {
                value: this.game.controls.flipConfig,
                range: [0, 2],
                step: 1,
                onUpdate: value => {

                    this.game.controls.flipConfig = value;

                },
                onComplete: () => this.game.storage.savePreferences(),
            }),

            scramble: new Range('scramble', {
                value: this.game.scrambler.dificulty,
                range: [0, 2],
                step: 1,
                onUpdate: value => {

                    this.game.scrambler.dificulty = value;

                },
                onComplete: () => this.game.storage.savePreferences()
            }),

            fov: new Range('fov', {
                value: this.game.world.fov,
                range: [2, 45],
                onUpdate: value => {

                    this.game.world.fov = value;
                    this.game.world.resize();

                },
                onComplete: () => this.game.storage.savePreferences()
            })
        };
    }

}

class Storage {

    constructor(game) {

        this.game = game;
    }

    init() {
        this.defaultPreference();
        this.loadPreferences();
    }

    loadPreferences() {

        try {

            const preferences = JSON.parse(localStorage.getItem('theCube_preferences'));

            if (!preferences) throw new Error();

            this.game.cube.size = parseInt(preferences.cubeSize);
            this.game.controls.flipConfig = parseInt(preferences.flipConfig);
            this.game.scrambler.dificulty = parseInt(preferences.dificulty);

            this.game.world.fov = parseFloat(preferences.fov);
            this.game.world.resize();

            this.game.themes.colors = preferences.colors;

            return true;

        } catch (e) {

            this.game.cube.size = 3;
            this.game.controls.flipConfig = 0;
            this.game.scrambler.dificulty = 1;

            this.game.world.fov = 10;
            this.game.world.resize();

            this.savePreferences();

            return false;

        }

    }

    defaultPreference() {
        this.game.cube.size = 2;
        this.game.controls.flipConfig = 1;
        this.game.scrambler.dificulty;
        this.game.world.fov;
        this.game.themes.colors;
        this.savePreferences();
    }

    savePreferences() {
        const preferences = {
            cubeSize: this.game.cube.size,
            flipConfig: this.game.controls.flipConfig,
            dificulty: this.game.scrambler.dificulty,
            fov: this.game.world.fov,
            colors: this.game.themes.colors,
        };
        localStorage.setItem('theCube_preferences', JSON.stringify(preferences));
    }

}

class Themes {

    constructor(game) {
        this.game = game;
        this.defaults = {
            U: 0xffffff,
            D: 0xffd500,
            F: 0xc41e3a,
            R: 0x0051ba,
            B: 0xff5800,
            L: 0x009e60,
            P: 0x08101a,
            G: 0x8abdff,
        };
        this.colors = JSON.parse(JSON.stringify(this.defaults));
    }

    getColors() {
        return this.colors;

    }
}

class Game {
    constructor() {
        this.dom = {
            game: document.querySelector('.game'),
            texts: {
                timer: document.querySelector('.text--timer')
            },
            buttons: {
                scrambleButton: document.querySelector('#scrambleButton'),
                resetButton: document.querySelector('#resetButton')
            }
        };

        this.world = new World(this);
        this.cube = new Cube(this);
        this.controls = new Controls(this);
        this.timer = new Timer(this);
        this.scrambler = new Scrambler(this);
        this.themes = new Themes(this);
        this.storage = new Storage(this);
        this.storage.init()
        this.initGame();
        this.initButtons();
        this.initVisual();
    }

    

    initGame() {
        this.cube.init();
        this.controls.enable();
        this.controls.onMove = () => this.startTimer();
        this.controls.onSolved = () => this.complete();
    }

    initVisual(){
        setTimeout(() => {
            gsap.to(".blockinglogo",{
                scaleY:0,
                scaleX:2,
                duration:0.2
            })
        }, 1000);
        
        setTimeout(()=>{
            gsap.to(".blockinglogo",{
                left:"200%",
                duration: 0,
            })
            gsap.to(".performance__screen",{
                scaleX: 0,
                scaleY:1.25,
                duration: 0,
            });
            gsap.to(".blockingscreen",{
                right:"100%",
                duration: 0.5,
                ease: "power2.out"

            });
            gsap.to(".blockingscreen2",{    
                left:"100%",
                duration: 0.5,
                ease: "power2.out"

            });  
            
        },1500)
           
    }

    initButtons() {
        this.dom.buttons.scrambleButton.addEventListener('click', () => this.scrambleAndStart());
        this.dom.buttons.resetButton.addEventListener('click', () => this.resetGame());
    }

    scrambleAndStart() {
        if(this.controls.scramble == null){
            this.timer.reset();
            this.scrambler.scramble();
            this.controls.scrambleCube();
            this.newGame = true;
        }
    }

    startTimer() {
        if (this.newGame) {
            this.timer.start();
            this.newGame = false;
        }
    }

    complete() {
        this.timer.stop();
    }

    resetGame() {
        if(this.controls.scramble == null){
            this.cube.init();
            this.timer.reset();
            this.newGame = true;
        }
    }
}

window.game = new Game();