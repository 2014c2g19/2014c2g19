/* Author: André Roberge
   License: MIT  */

/*jshint browser:true, devel:true, indent:4, white:false, plusplus:false */

if (!Array.prototype.remove){
    // Array remove - By John Resig (MIT Licensed) from http://ejohn.org/blog/javascript-array-remove/
    Array.prototype.remove = function(from, to) {
        "use strict";
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
}

/*
    Original script title: "Object.identical.js"; version 1.12
    Copyright (c) 2011, Chris O'Brien, prettycode.org
    http://github.com/prettycode/Object.identical.js
*/

Object.identical = function (a, b, sortArrays) {

    function sort(object) {
        if (sortArrays === true && Array.isArray(object)) {
            return object.sort();
        }
        else if (typeof object !== "object" || object === null) {
            return object;
        }

        return Object.keys(object).sort().map(function(key) {
            return {
                key: key,
                value: sort(object[key])
            };
        });
    }

    return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
};

// adapted from http://javascript.crockford.com/remedial.html
String.prototype.supplant = function (o) {
    return this.replace(
        /\{([^{}]*)\}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};


var RUR = RUR || {};

RUR.Error = function (message) {
    this.name = RUR.translation.ReeborgError;
    this.message = message;
};

RUR.List = function(){
    this.container = [];
    this.length = function(){
        return this.container.length;
    };
    this.add_item = function(data) {
        this.container.push(data);
        if (this.length() >= RUR.world.max_steps) {
            throw new RUR.Error(RUR.translation["Too many steps:"].supplant({max_steps: RUR.world.max_steps}));
        }
    };
    this.shift = function() {
        return this.container.shift();
    };
};
/* Author: André Roberge
   License: MIT
 */

/*jshint browser:true, devel:true, indent:4, white:false, plusplus:false */

var RUR = RUR || {};

RUR.Robot = function(x, y, orientation, tokens) {
    "use strict";
    this.x = x || 1;
    this.y = y || 1;
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.tokens = tokens || 0;
    this._is_leaky = true;
    // the following can only be found in the world
    this.triangles = 0;
    this.squares = 0;
    this.star = 0;

    if (orientation === undefined){
        this.orientation = RUR.world.EAST;
    } else {
        switch (orientation.toLowerCase()){
        case "e":
        case RUR.translation.east:
            this.orientation = RUR.world.EAST;
            break;
        case "n":
        case RUR.translation.north:
            this.orientation = RUR.world.NORTH;
            break;
        case "w":
        case RUR.translation.west:
            this.orientation = RUR.world.WEST;
            break;
        case "s":
        case RUR.translation.south:
            this.orientation = RUR.world.SOUTH;
            break;
        default:
            throw new RUR.Error(RUR.translation["Unknown orientation for robot."]);
        }
    }
    this.prev_orientation = this.orientation;
};

RUR.Robot.prototype.turn_left = function(no_frame){
    "use strict";
    this.prev_orientation = this.orientation;
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.orientation += 1;
    this.orientation %= 4;
    if (no_frame !== undefined) return;
    RUR.world.add_frame();
};

RUR.Robot.prototype.__turn_right = function(no_frame){
    // private method for now ...
    "use strict";
    this.prev_orientation = this.orientation;
    this.prev_x = this.x;
    this.prev_y = this.y;
    this.orientation += 3;
    this.orientation %= 4;
    if (no_frame !== undefined) return;
    RUR.world.add_frame();
};

RUR.Robot.prototype.is_leaky = function (leak) {
    this._is_leaky = leak;
};

RUR.Robot.prototype.move = function(){
    "use strict";
    this.prev_orientation = this.orientation;
    RUR.world.move_robot(this);
    RUR.world.add_frame();
};

RUR.Robot.prototype.front_is_clear = function() {
    return RUR.world.front_is_clear(this);
};

RUR.Robot.prototype.right_is_clear = function() {
    return RUR.world.right_is_clear(this);
};

RUR.Robot.prototype.build_wall = function () {
    RUR.world.build_wall(this);
    RUR.world.add_frame();
};

RUR.Robot.prototype.is_facing_north = function () {
    return this.orientation === RUR.world.NORTH;
};

RUR.Robot.prototype.done = function() {
    throw new RUR.Error(RUR.translation["Done!"]);
};

RUR.Robot.prototype.put_token = function () {
    RUR.world.robot_put_token(this);
    RUR.world.add_frame();
};

RUR.Robot.prototype.take_token = function () {
    RUR.world.robot_take_token(this);
    RUR.world.add_frame();
};

RUR.Robot.prototype.has_token = function () {
    return this.tokens > 0 || typeof this.tokens === "string";
};

RUR.Robot.prototype.at_goal = function () {
    var goal = RUR.world.goal;
    if (goal !== undefined){
        if (goal.position !== undefined) {
            return (this.x === goal.position.x && this.y === goal.position.y);
        }
        throw new RUR.Error(RUR.translation["There is no position as a goal in this world!"]);
    }
    throw new RUR.Error(RUR.translation["There is no goal in this world!"]);
};

RUR.Robot.prototype.at_goal_orientation = function () {
    var goal = RUR.world.goal;
    if (goal !== undefined){
        if (goal.orientation !== undefined) {
            return (this.orientation === goal.orientation);
        }
        throw new RUR.Error(RUR.translation["There is no orientation as a goal in this world!"]);
    }
    throw new RUR.Error(RUR.translation["There is no goal in this world!"]);
};


RUR.Robot.prototype.put = function (shape) {
    RUR.world.robot_put(this, shape);
    RUR.world.add_frame();
};

RUR.Robot.prototype.take = function (shape) {
    RUR.world.robot_take(this, shape);
    RUR.world.add_frame();
};

RUR.Robot.prototype.token_here = function () {
    return RUR.world.get_tokens(this.x, this.y);
};

RUR.Robot.prototype.shape_here = function () {
    return RUR.world.find_shape(this.x, this.y);
};
/* Author: André Roberge
   License: MIT
 */

/*jshint browser:true, -W069:false, devel:true, indent:4, white:false, plusplus:false */
/*globals $, editor, library, translate_python, JSHINT, CodeMirror */

var RUR = RUR || {};
var DEBUG = {};
DEBUG.ON = false;

RUR.World = function () {
    "use strict";
    this.EAST = 0;
    this.NORTH = 1;
    this.WEST = 2;
    this.SOUTH = 3;
    this.max_steps = 1000;
    this.frames = undefined;
    this.prev_frame = undefined;
    this.walls = undefined;
    this.robots = undefined;
    this.tokens = undefined;
    this.imported_world = undefined;
    this.json_world_string = undefined;
    this.robot_world_active = undefined;

    this.think = function (delay) {
        if (delay >= 0  && delay <= 10000){
            this.add_frame("delay", delay);
        }
        else {
            throw new RUR.Error(RUR.translation["Reeborg's thinking time needs to be specified in milliseconds, between 0 and 10000; this was: "].supplant({delay: delay}));
        }
    };

    this.pause = function(ms) {
        this.frames.add_item({pause: true, pause_time:ms});
    };

    this.export_ = function (){
        var json_object;
        json_object = {"robots": this.robots, "walls": this.walls, "tokens": this.tokens,
                        "shapes": this.shapes};
        return JSON.stringify(json_object, null, '   ');
    };

    this.import_ = function (json_string){
        if (json_string === undefined){
            return {};
        }
        this.json_world_string = json_string;
        return JSON.parse(json_string) || {};
    };

    this.parse_world = function() {
        var i, orientation;
        this.imported_world = this.import_(this.json_world_string);
        this.robots = [];
        this.walls = this.imported_world.walls || {};
        this.tokens = this.imported_world.tokens || {};
        this.shapes = this.imported_world.shapes || {};
        this.goal = this.imported_world.goal;
        this.blank_canvas = this.imported_world.blank;
        if (this.imported_world.robots !== undefined) {
            for (i = 0; i < this.imported_world.robots.length; i++){
                switch(this.imported_world.robots[i].orientation){
                case 0:
                    orientation = "e";
                    break;
                case 1:
                    orientation = "n";
                    break;
                case 2:
                    orientation = "w";
                    break;
                case 3:
                    orientation = "s";
                    break;
                }
                this.robots.push(new RUR.Robot(this.imported_world.robots[i].x,
                                 this.imported_world.robots[i].y,
                                 orientation, this.imported_world.robots[i].tokens));
            }
        }
    };

    this.reset = function (){
        this.parse_world();
        this.frames = new RUR.List();
    };
    this.reset();

    this.add_robot = function (robot) {
        this.robots.push(robot);
        this.add_frame();
    };

    this.remove_robot = function () {
        this.robots.remove(0);
        this.add_frame();
    };

    this.set_tokens = function (x, y, nb_tokens){
        if (nb_tokens > 0) {
            this.tokens[x + "," + y] = nb_tokens;
        } else {
            delete this.tokens[x + "," + y];
        }
    };

    this.get_tokens = function (x, y) {
        return this.tokens[x + "," + y] || 0;
    };

    this.robot_take_token  = function (robot) {
        var token = this.get_tokens(robot.x, robot.y);
        if (token === 0){
            throw new RUR.Error(RUR.translation["No token found here!"]);
        } else {
            if (typeof robot.tokens === typeof 42){
                robot.tokens += 1;
            }
            this.set_tokens(robot.x, robot.y, token-1);
        }
    };

    this.robot_put_token = function (robot) {
        var token;
        if (robot.tokens === 0){
            throw new RUR.Error(RUR.translation["I don't have any token to put down!"]);
        }
        token = this.get_tokens(robot.x, robot.y);
        this.set_tokens(robot.x, robot.y, token+1);
        if (typeof robot.tokens === typeof 42){
            robot.tokens -= 1;
        }
    };

    this.set_shape = function (x, y, shape){
        if (shape !== null) {
            this.shapes[x + "," + y] = RUR.translation[shape];
        } else {
            delete this.shapes[x + "," + y];
        }
    };

    this.find_shape = function (x, y) {
        return RUR.translation[this.shapes[x + "," + y]] || 0;
    };

    this.robot_take  = function (robot, shape) {
        var s;
        if (RUR.translation["token"] === shape || shape === undefined){
            this.robot_take_token(robot);
            return;
        }
        else if ([RUR.translation["triangle"], RUR.translation["square"], RUR.translation["star"]].indexOf(shape) === -1){
            throw new RUR.Error(RUR.translation["Unknown shape"].supplant({shape: shape}));
        }
        s = this.find_shape(robot.x, robot.y);
        if (s === 0 || s !== shape) {
            throw new RUR.Error(RUR.translation["No shape found here"].supplant({shape: shape}));
        } else {
            robot[shape] += 1;
            this.set_shape(robot.x, robot.y, null);
        }
    };

    this.robot_put = function (robot, shape) {
        if (RUR.translation["token"] === shape || shape === undefined){
            this.robot_put_token(robot);
            return;
        }
        else if ([RUR.translation["triangle"], RUR.translation["square"], RUR.translation["star"]].indexOf(shape) === -1){
            throw new RUR.Error(RUR.translation["Unknown shape"].supplant({shape: shape}));
        }
        if (robot[shape] === 0){
            throw new RUR.Error(RUR.translation["I don't have any shape to put down!"].supplant({shape:shape}));
        } else if (this.find_shape(robot.x, robot.y) !== 0) {
            throw new RUR.Error(RUR.translation["There is already something here."]);
        }
        this.set_shape(robot.x, robot.y, shape);
        robot[shape] -= 1;
    };

    this.is_wall_at = function (coords, orientation) {
        if (this.walls[coords] !== undefined){
            if (this.walls[coords].indexOf(orientation) !== -1) {
                return true;
            }
        }
        return false;
    };

    this.front_is_clear = function(robot){
        var coords;
        switch (robot.orientation){
        case this.EAST:
            coords = robot.x + "," + robot.y;
            if (this.is_wall_at(coords, "east")) {
                return false;
            }
            break;
        case this.NORTH:
            coords = robot.x + "," + robot.y;
            if (this.is_wall_at(coords, "north")) {
                return false;
            }
            break;
        case this.WEST:
            if (robot.x===1){
                return false;
            } else {
                coords = (robot.x-1) + "," + robot.y; // do math first before building strings
                if (this.is_wall_at(coords, "east")) {
                    return false;
                }
            }
            break;
        case this.SOUTH:
            if (robot.y===1){
                return false;
            } else {
                coords = robot.x + "," + (robot.y-1);  // do math first before building strings
                if (this.is_wall_at(coords, "north")) {
                    return false;
                }
            }
            break;
        default:
            throw new RUR.Error("Should not happen: unhandled case in RUR.World.front_is_clear().");
        }
        return true;
    };

    this.right_is_clear = function(robot){
        var result;
        robot.__turn_right(true);
        result = this.front_is_clear(robot);
        robot.turn_left(true);
        return result;
    };

    this.build_wall = function(robot){
        var coords, orientation, x, y;
        switch (robot.orientation){
        case this.EAST:
            coords = robot.x + "," + robot.y;
            if (this.is_wall_at(coords, "east")) {
                throw new RUR.Error(RUR.translation["There is already a wall here!"]);
            }
            orientation = "east";
            x = robot.x;
            y = robot.y;
            break;
        case this.NORTH:
            coords = robot.x + "," + robot.y;
            if (this.is_wall_at(coords, "north")) {
                throw new RUR.Error(RUR.translation["There is already a wall here!"]);
            }
            orientation = "north";
            x = robot.x;
            y = robot.y;
            break;
        case this.WEST:
            if (robot.x===1){
                throw new RUR.Error(RUR.translation["There is already a wall here!"]);
            } else {
                coords = robot.x-1 + "," + robot.y;
                if (this.is_wall_at(coords, "east")) {
                    throw new RUR.Error(RUR.translation["There is already a wall here!"]);
                }
            }
            orientation = "east";
            x = robot.x-1;
            y = robot.y;
            break;
        case this.SOUTH:
            if (robot.y===1){
                throw new RUR.Error(RUR.translation["There is already a wall here!"]);
            } else {
                coords = robot.x + "," + robot.y-1;
                if (this.is_wall_at(coords, "north")) {
                    throw new RUR.Error(RUR.translation["There is already a wall here!"]);
                }
            }
            orientation = "north";
            x = robot.x;
            y = robot.y-1;
            break;
        default:
            throw new RUR.Error("Should not happen: unhandled case in RUR.World.build_wall().");
        }
        RUR.world.toggle_wall(x, y, orientation);
    };

    this.move_robot = function(robot){
        if (!this.front_is_clear(robot)) {
            throw new RUR.Error(RUR.translation["Ouch! I hit a wall!"]);
        }
        if ((robot.y === RUR.visible_world.rows && robot.orientation === this.NORTH) ||
            (robot.x === RUR.visible_world.cols && robot.orientation === this.EAST)) {
            throw new RUR.Error(RUR.translation["I am afraid of the void!"]);
        }
        robot.prev_x = robot.x;
        robot.prev_y = robot.y;
        switch (robot.orientation){
        case this.EAST:
            robot.x += 1;
            break;
        case this.NORTH:
            robot.y += 1;
            break;
        case this.WEST:
            robot.x -= 1;
            break;
        case this.SOUTH:
            robot.y -= 1;
            break;
        default:
            throw new Error("Should not happen: unhandled case in RUR.World.move_robot().");
        }
    };


    this.add_frame = function (first, second, third) {
        var i, j, k, robot, robots = [], walls, tokens, shapes;
        for (i = 0; i < this.robots.length; i++){
            robot = {};
            robot.x = this.robots[i].x;
            robot.y = this.robots[i].y;
            robot.prev_x = this.robots[i].prev_x;
            robot.prev_y = this.robots[i].prev_y;
            robot.orientation = this.robots[i].orientation;
            robot.prev_orientation = this.robots[i].prev_orientation;
            robot._is_leaky = this.robots[i]._is_leaky;
            robot.tokens = this.robots[i].tokens;
            robots.push(robot);
        }
        tokens = {};
        k = Object.keys(this.tokens);
        for (i=0; i < k.length; i++){
            tokens[k[i]] = this.tokens[k[i]];
        }
        walls = {};
        k = Object.keys(this.walls);
        for (i=0; i < k.length; i++){
            walls[k[i]] = [];
            for(j = 0; j < this.walls[k[i]].length; j++){
                walls[k[i]].push(this.walls[k[i]][j]);
            }
        }
        shapes = {};
        k = Object.keys(this.shapes);
        for (i=0; i < k.length; i++){
            shapes[k[i]] = this.shapes[k[i]];
        }
        if (first === undefined) {
            this.frames.add_item({"robots": robots, "walls": walls, "tokens": tokens, "shapes": shapes});
        } else if (first === "output") {
            this.frames.add_item({"robots": robots, "walls": walls, "tokens": tokens, "shapes": shapes, output: {element:second, message:third}});
        } else if (first === "delay") {
            this.frames.add_item({"robots": robots, "walls": walls, "tokens": tokens, "shapes": shapes, delay: Math.round(second)}); 
        } else if (first === "error") {
            this.frames.add_item({"robots": robots, "walls": walls, "tokens": tokens, "shapes": shapes, error: second});
        }
    };

    this.toggle_wall = function (x, y, orientation){
        var index, coords;
        coords = x + "," + y;
        if (this.walls[coords] === undefined){
            this.walls[coords] = [orientation];
        } else {
            index = this.walls[coords].indexOf(orientation);
            if (index === -1) {
                this.walls[coords].push(orientation);
            } else {
                this.walls[coords].remove(index);
                if (this.walls[coords].length === 0){
                    delete this.walls[coords];
                }
            }
        }
    };
};

RUR.world = new RUR.World();

RUR.visible_world = {
    init: function () {
        "use strict";
        var that = this;
        this.background_canvas = document.getElementById("background_canvas");
        this.background_ctx = this.background_canvas.getContext("2d");
        this.background_ctx.font = "bold 12px sans-serif";
        this.height = this.background_canvas.height;
        this.width = this.background_canvas.width;
        this.wall_ctx = document.getElementById("wall_canvas").getContext("2d");
        this.trace_ctx = document.getElementById("trace_canvas").getContext("2d");
        this.set_trace_style();
        this.robot_ctx = document.getElementById("robot_canvas").getContext("2d");
        this.rows = Math.floor(this.height / this.wall_length) - 1;
        this.cols = Math.floor(this.width / this.wall_length) - 2;
        this.delay = 300;   // milliseconds
        this.robot_e_img = new Image();
        this.robot_e_img.src = 'src/images/robot_e.png';
        // the following ensures that we won't attempt drawing until the default image is available
        this.robot_e_img.onload = function () {
            that.reset();
        };
        this.robot_top_e_img = new Image();
        this.robot_top_e_img.src = 'src/images/top_e.png';
        this.robot_n_img = new Image();
        this.robot_n_img.src = 'src/images/robot_n.png';
        this.robot_top_n_img = new Image();
        this.robot_top_n_img.src = 'src/images/top_n.png';
        this.robot_w_img = new Image();
        this.robot_w_img.src = 'src/images/robot_w.png';
        this.robot_top_w_img = new Image();
        this.robot_top_w_img.src = 'src/images/top_w.png';
        this.robot_s_img = new Image();
        this.robot_s_img.src = 'src/images/robot_s.png';
        this.robot_top_s_img = new Image();
        this.robot_top_s_img.src = 'src/images/top_s.png';
        this.running = false;
        if (localStorage.getItem("top_view") === "true") {
            this.top_view = true;
        } else {
            this.top_view = false;
        }
    },
    wall_length: 40,
    wall_thickness: 5,
    robot_y_offset : 8,
    robot_x_offset : 10,
    wall_color: "brown",
    shadow_wall_color: "#f0f0f0",
    ctx: null,
    draw : function (frame) {
        "use strict";
        this.draw_foreground_walls(frame.walls);
        if (frame.tokens !== undefined){
            this.draw_tokens(frame.tokens);
        }
        if (frame.shapes !== undefined){
            this.draw_shapes(frame.shapes);
        }
        this.draw_trace();
        if (frame.robots !== undefined) {
            this.draw_robots(frame.robots);
        }
    },
    set_trace_style : function (choice){
        "use strict";
        if (choice === "thick") {
            this.trace_offset = [[25, 25], [25, 25], [25, 25], [25, 25]];
            this.trace_color = "seagreen";
            this.trace_thickness = 4;
        } else {
            this.trace_offset = [[30, 30], [30, 20], [20, 20], [20, 30]];
            this.trace_color = "seagreen";
            this.trace_thickness = 1;
        }
    },
    draw_coordinates: function(){
        "use strict";
        if (RUR.world.blank_canvas) return;
        var x, y;
        var ctx = this.background_ctx;
        ctx.fillStyle = 'black';
        y = this.height-this.wall_length/2;
        for(x=1; x <= this.cols; x++){
            ctx.fillText(x, (x+0.5)*this.wall_length, y);
        }
        x = this.wall_length/2;
        for(y=1; y <= this.rows; y++){
            ctx.fillText(y, x, this.height - (y+0.3)*this.wall_length);
        }
        // axis labels
        ctx.fillStyle = this.wall_color;
        ctx.fillText("x", this.width/2, this.height - 10);
        ctx.fillText("y", 5, this.height/2 );
    },
    draw_background_walls : function () {
        "use strict";
        var i, j;
        var ctx = this.background_ctx;
        this.ctx = ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        if (RUR.world.blank_canvas) return;
        ctx.fillStyle = this.shadow_wall_color;
        for (i = 1; i <= this.cols; i++) {
            for (j = 1; j <= this.rows; j++) {
                this.draw_north_wall(i, j);
                this.draw_east_wall(i, j);
            }
        }
    },
    draw_goal : function () {
        "use strict";
        if (RUR.world.goal === undefined) return;
        var goal = RUR.world.goal;
        if (goal.position !== undefined) {
            this.draw_coloured_tile(goal.position.x, goal.position.y, goal.orientation);
        }
        if (goal.shapes !== undefined){
            this.draw_shapes(goal.shapes, true);
        }
        if (goal.tokens !== undefined) {
            this.draw_tokens(goal.tokens, true);
        }
        if (goal.walls !== undefined){
            this.draw_foreground_walls(goal.walls, goal);
            var key, i, j;
            var ctx = this.background_ctx;
            this.ctx = ctx;
            // todo : make more efficient by 1. splitting into two functions so as not
            // to redraw permanent walls and 2. do not loop over all possible combinations
            // but identify which walls need to be drawn the same way we do for tokens.
            for (i = 0; i <= this.cols; i++) {
                for (j = 0; j <= this.rows; j++) {
                    key = i + "," + j;
                    if ( key in goal.walls ) {
                        if ( goal.walls[key].indexOf("north") !== -1) {
                            this.draw_north_wall(i, j, true);
                        }
                        if (goal.walls[key].indexOf("east") !== -1) {
                            this.draw_east_wall(i, j, true);
                        }
                    }
                }
            }
        }
    },
    draw_coloured_tile : function (i, j, orientation) {
        var size = this.wall_thickness, ctx = this.background_ctx;
        ctx.fillStyle = "#99ffcc";
        ctx.fillRect(i*this.wall_length + size, this.height - (j+1)*this.wall_length + size,
                          this.wall_length - size, this.wall_length - size);
        if (orientation === undefined) return;

        ctx.fillStyle = "black";
        switch(orientation){
        case 0:
            ctx.fillRect((i+1)*this.wall_length - size, this.height - (j+0.5)*this.wall_length,
                          size, size);
            break;
        case 1:
            ctx.fillRect((i+0.5)*this.wall_length, this.height - (j+1)*this.wall_length + size,
                          size, size);
            break;
        case 2:
            ctx.fillRect((i)*this.wall_length + size, this.height - (j+0.5)*this.wall_length,
                          size, size);
            break;
        case 3:
            ctx.fillRect((i+0.5)*this.wall_length , this.height - (j)*this.wall_length - size,
                          size, size);
            break;
        }
    },
    draw_foreground_walls : function (walls) {
        "use strict";
        var key, i, j;
        var ctx = this.wall_ctx;
        this.ctx = ctx;
        ctx.clearRect(0, 0, RUR.visible_world.width, RUR.visible_world.height);
        if (RUR.world.blank_canvas) return;
        ctx.fillStyle = this.wall_color;
        // todo : make more efficient by 1. splitting into two functions so as not
        // to redraw permanent walls and 2. do not loop over all possible combinations
        // but identify which walls need to be drawn the same way we do for tokens.
        for (i = 0; i <= this.cols; i++) {
            for (j = 0; j <= this.rows; j++) {
                if (i === 0 && j !== 0) {
                    this.draw_east_wall(i, j);
                } else if (i !== 0 && j === 0) {
                    this.draw_north_wall(i, j);
                } else if (i === 0 && j === 0) {
                    continue;
                } else {
                    key = i + "," + j;
                    if ( key in walls ) {
                        if ( walls[key].indexOf("north") !== -1) {
                            this.draw_north_wall(i, j);
                        }
                        if (walls[key].indexOf("east") !== -1) {
                            this.draw_east_wall(i, j);
                        }
                    }
                }
            }
        }
    },
    draw_north_wall : function(i, j, goal) {
        "use strict";
        if (goal){
            this.ctx.strokeStyle = "black";
            this.ctx.beginPath();
            this.ctx.rect(i*this.wall_length, this.height - (j+1)*this.wall_length,
                          this.wall_length + this.wall_thickness, this.wall_thickness);
            this.ctx.stroke();
            return;
        }
        this.ctx.fillRect(i*this.wall_length, this.height - (j+1)*this.wall_length,
                          this.wall_length + this.wall_thickness, this.wall_thickness);
    },
    draw_east_wall : function(i, j, goal) {
        "use strict";
        if (goal){
            this.ctx.strokeStyle = "black";
            this.ctx.beginPath();
            this.ctx.rect((i+1)*this.wall_length, this.height - (j+1)*this.wall_length,
                          this.wall_thickness, this.wall_length + this.wall_thickness);
            this.ctx.stroke();
            return;
        }
        this.ctx.fillRect((i+1)*this.wall_length, this.height - (j+1)*this.wall_length,
                          this.wall_thickness, this.wall_length + this.wall_thickness);
    },
    draw_tokens : function(tokens, goal) {
        "use strict";
        var i, j, k, t, toks;
        toks = Object.keys(tokens);
        for (t=0; t < toks.length; t++){
            k = toks[t].split(",");
            i = parseInt(k[0], 10);
            j = parseInt(k[1], 10);
            this.draw_token(i, j, tokens[toks[t]], goal);
        }
    },
    draw_token : function (i, j, num, goal) {
        "use strict";
        var size = 12, scale = this.wall_length, Y = this.height;
        var ctx;
        if (goal) {
            ctx = this.background_ctx;
        } else {
            ctx = this.wall_ctx;
        }
        ctx.beginPath();
        ctx.arc((i+0.6)*scale, Y - (j+0.4)*scale, size, 0 , 2 * Math.PI, false);
        if (goal) {
            ctx.strokeStyle = "#666";
            ctx.fillStyle = "black";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillText(num, (i+0.2)*scale, Y - (j)*scale);
        } else {
            ctx.fillStyle = "gold";
            ctx.strokeStyle = "black";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.fillStyle = "black";
            ctx.fillText(num, (i+0.5)*scale, Y - (j+0.3)*scale);
        }
    },
    draw_shapes : function(shapes, goal) {
        "use strict";
        var i, j, k, t, sh;
        sh = Object.keys(shapes);
        for (t=0; t < sh.length; t++){
            k = sh[t].split(",");
            i = parseInt(k[0], 10);
            j = parseInt(k[1], 10);
            this.draw_shape(i, j, shapes[sh[t]], goal);
        }
    },
    draw_shape : function (i, j, shape, goal) {
        "use strict";
        var ctx, size = 12, scale = this.wall_length, Y = this.height;
        if(goal !== undefined){
            ctx = this.background_ctx;
            ctx.lineWidth = 3;
        } else {
            ctx = this.wall_ctx;
        }
        ctx.strokeStyle = "black";
        if (shape === "square") {
            ctx.fillStyle = "blue";
            if(goal !== undefined){
                ctx.beginPath();
                ctx.rect((i+0.6)*scale - size, Y - (j+0.4)*scale - size, 2*size, 2*size);
                ctx.stroke();
            } else {
                ctx.fillRect((i+0.6)*scale - size, Y - (j+0.4)*scale - size, 2*size, 2*size);
            }
        } else if (shape === "triangle") { // triangle
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.moveTo((i+0.6)*scale - size, Y - (j+0.4)*scale + size);
            ctx.lineTo((i+0.6)*scale, Y - (j+0.4)*scale - size);
            ctx.lineTo((i+0.6)*scale + size, Y - (j+0.4)*scale + size);
            ctx.lineTo((i+0.6)*scale - size, Y - (j+0.4)*scale + size);
            if(goal !== undefined) {
                ctx.closePath();
                ctx.stroke();
            } else {
                ctx.fill();
            }
        } else {
            ctx.fillStyle = "red";
            this.draw_star(ctx, (i+0.6)*scale, Y-(j+0.4)*scale, 1.5*size, goal);
        }
    },
    draw_star : function (ctx, x, y, r, goal){
        // adapted from https://developer.mozilla.org/en-US/docs/HTML/Canvas/Tutorial/Compositing
        ctx.save();
        ctx.translate(x, y);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r,0);
        for (var i=0; i<9; i++){
            ctx.rotate(Math.PI/5);
            if(i%2 === 0) {
                ctx.lineTo((r/0.525731)*0.200811, 0);
            } else {
                ctx.lineTo(r, 0);
            }
        }
        ctx.closePath();
        if (goal !== undefined){
            ctx.lineWidth = 3;
            ctx.stroke();
        } else {
            ctx.fill();
        }
        ctx.restore();
        ctx.restore();
    },
    draw_robot : function (robot) {
        "use strict";
        var x, y, img, ctx;
        ctx = this.robot_ctx;
        x = robot.x * this.wall_length + this.robot_x_offset;
        y = this.height - (robot.y +1) * this.wall_length + this.robot_y_offset;
        switch(robot.orientation){
        case RUR.world.EAST:
            if (RUR.visible_world.top_view) {
                img = this.robot_top_e_img;
            } else {
                img = this.robot_e_img;
            }
            break;
        case RUR.world.NORTH:
            if (RUR.visible_world.top_view) {
                img = this.robot_top_n_img;
            } else {
                img = this.robot_n_img;
            }
            break;
        case RUR.world.WEST:
            if (RUR.visible_world.top_view) {
                img = this.robot_top_w_img;
            } else {
                img = this.robot_w_img;
            }
            break;
        case RUR.world.SOUTH:
            if (RUR.visible_world.top_view) {
                img = this.robot_top_s_img;
            } else {
                img = this.robot_s_img;
            }
            break;
        default:
            img = this.robot_e_img;
        }
        ctx.drawImage(img, x, y);
        this.draw_trace(robot);
    },
    draw_trace : function (robot) {
        "use strict";
        if (robot === undefined || robot._is_leaky === false) {
            return;
        }
        var ctx = this.trace_ctx;
        ctx.strokeStyle = this.trace_color;
        ctx.lineWidth = this.trace_thickness;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(robot.prev_x* this.wall_length + this.trace_offset[robot.prev_orientation][0],
                        this.height - (robot.prev_y +1) * this.wall_length + this.trace_offset[robot.prev_orientation][1]);
        ctx.lineTo(robot.x* this.wall_length + this.trace_offset[robot.orientation][0],
                        this.height - (robot.y +1) * this.wall_length + this.trace_offset[robot.orientation][1]);
        ctx.stroke();
    },
    play_frames : function () {
        "use strict";
        if (RUR.visible_world.running){
            RUR.visible_world.running = false;
            return;
        }
        RUR.visible_world.running = true;
        RUR.visible_world.update();
    },
    update : function () {
        "use strict";
        var frame_info;
        if (!RUR.visible_world.running){
            return;
        }
        frame_info = RUR.visible_world.play_single_frame();

        if (frame_info === "immediate") {
            clearTimeout(RUR.timer);
            RUR.visible_world.update();
            return;
        } else if (frame_info === "pause" || frame_info === "stopped") {
            return;
        }

        RUR.timer = setTimeout(RUR.visible_world.update, RUR.visible_world.delay);
    },
    check_goal : function (frame) {
        var g, goal_status = {}, result;
        g = RUR.world.goal;
        goal_status.message = "<ul>";
        goal_status.success = true;
        if (g.position !== undefined){
            goal_status.position = {};
            if (g.position.x === frame.robots[0].x){
                goal_status.message += RUR.translation["<li class='success'>Reeborg is at the correct x position.</li>"];
            } else {
                goal_status.message += RUR.translation["<li class='failure'>Reeborg is at the wrong x position.</li>"];
                goal_status.success = false;
            }
            if (g.position.y === frame.robots[0].y){
                goal_status.message += RUR.translation["<li class='success'>Reeborg is at the correct y position.</li>"];
            } else {
                goal_status.message += RUR.translation["<li class='failure'>Reeborg is at the wrong y position.</li>"];
                goal_status.success = false;
            }
        }
        if (g.orientation !== undefined){
            if (g.orientation === frame.robots[0].orientation){
                goal_status.message += RUR.translation["<li class='success'>Reeborg has the correct orientation.</li>"];
            } else {
                goal_status.message += RUR.translation["<li class='failure'>Reeborg has the wrong orientation.</li>"];
                goal_status.success = false;
            }
        }
        if (g.shapes !== undefined) {
            result = Object.identical(g.shapes, frame.shapes, true);
            if (result){
                goal_status.message += RUR.translation["<li class='success'>All shapes are at the correct location.</li>"];
            } else {
                goal_status.message += RUR.translation["<li class='failure'>One or more shapes are not at the correct location.</li>"];
                goal_status.success = false;
            }
        }
        if (g.tokens !== undefined) {
            result = Object.identical(g.tokens, frame.tokens, true);
            if (result){
                goal_status.message += RUR.translation["<li class='success'>All tokens are at the correct location.</li>"];
            } else {
                goal_status.message += RUR.translation["<li class='failure'>One or more tokens are not at the correct location.</li>"];
                goal_status.success = false;
            }
        }
        if (g.walls !== undefined) {
            result = true;
            loop:
            for(var w in g.walls){
                for(var i=0; i < g.walls[w].length; i++){
                    if ( !(frame.walls !== undefined &&
                           frame.walls[w] !== undefined &&
                           frame.walls[w].indexOf(g.walls[w][i]) !== -1)){
                        result = false;
                        break loop;
                    }
                }
            }
            if (result){
                goal_status.message += RUR.translation["<li class='success'>All walls have been built correctly.</li>"];
            } else {
                goal_status.message += RUR.translation["<li class='failure'>One or more walls missing or built at wrong location.</li>"];
                goal_status.success = false;
            }
        }
        goal_status.message += "</u>";
        return goal_status;
    },
    play_single_frame : function () {
        "use strict";
        var frame, goal_status;
        if (RUR.world.frames.length() !== 0) {
            frame = RUR.world.frames.shift();
            if (frame.error === undefined){
                RUR.world.prev_frame = frame;
            }
        } else {
            if (RUR.world.goal !== undefined){
                if (RUR.world.prev_frame !== undefined){
                    goal_status = RUR.visible_world.check_goal(RUR.world.prev_frame);
                } else{
                    RUR.world.add_frame();
                    frame = RUR.world.frames.shift();
                    goal_status = RUR.visible_world.check_goal(frame);
                }
                if (goal_status.success) {
                    $("#Reeborg-says").html(goal_status.message).dialog("open");
                } else {
                    $("#Reeborg-shouts").html(goal_status.message).dialog("open");
                }
                RUR.controls.stop();
                return "stopped";
            } else {
                if (RUR.controls.end_flag) {
                    $("#Reeborg-says").html("<p class='center'>" + RUR.translation["Last instruction completed!"] + "</p>").dialog("open");
                } else {
                    RUR.controls.end_flag = true;
                }
                RUR.controls.stop();
                return "stopped";
            }
        }
        if (frame.delay !== undefined) {
            RUR.visible_world.delay = frame.delay;
            return "immediate";
        }
        if (frame.pause) {
            RUR.controls.pause(frame.pause_time);
            return "pause";
        }
        if (frame.error !== undefined) {
            RUR.controls.stop();
            if (frame.error.message === RUR.translation["Done!"]){
                if (RUR.world.goal !== undefined){
                    goal_status = RUR.visible_world.check_goal(RUR.world.prev_frame);
                    if (goal_status.success) {
                        $("#Reeborg-says").html(goal_status.message).dialog("open");
                    } else {
                        $("#Reeborg-shouts").html(goal_status.message).dialog("open");
                    }
                    RUR.controls.stop();
                    return "stopped";
                } else {
                    $("#Reeborg-says").html(RUR.translation["<p class='center'>Instruction <code>done()</code> executed.</p>"]).dialog("open");
                    RUR.controls.stop();
                    return "stopped";
                }
            } else {
                $("#Reeborg-shouts").html(frame.error.message).dialog("open");
            }
            return "stopped";
        }
        if (frame.output !== undefined) {
            $(frame.output.element).append(frame.output.message + "\n");
            return;
        }
        RUR.visible_world.draw(frame);
    },
    draw_robots : function(robots) {
        var robot, info = '';
        this.robot_ctx.clearRect(0, 0, this.width, this.height);
        if (RUR.world.blank_canvas) return;
        for (robot=0; robot < robots.length; robot++){
            this.draw_robot(robots[robot]); // draws trace automatically
            if (DEBUG.ON) {
                info += RUR.translation.robot + robot + ": x=" + robots[robot].x +
                        ", y=" + robots[robot].y + RUR.translation[", tokens="] + robots[robot].tokens + ".  ";
            }
        }
        if (DEBUG.ON) {
            this.robot_ctx.font = "bold 12px sans-serif";
            this.robot_ctx.fillStyle = "blue";
            this.robot_ctx.fillText(info, 5, 15);
        }
    },
    reset : function () {
        "use strict";
        RUR.world.reset();
        DEBUG.ON = false;
        this.delay = 300;
        this.compiled = false;
        this.running = false;
        this.draw_all();
    },
    draw_all : function () {
        this.draw_background_walls();
        this.draw_goal();
        this.draw_coordinates();
        this.trace_ctx.clearRect(0, 0, this.width, this.height);
        this.draw(RUR.world);
    }
};

/* Author: André Roberge
   License: MIT
 */

/*jshint browser:true, devel:true, indent:4, white:false, plusplus:false */
/*globals $, editor, library, editorUpdateHints, libraryUpdateHints, translate_python */


var RUR = RUR || {};

RUR.compile_javascript = function (src) {
    // Note: by having "use strict;" here, it has the interesting effect of requiring user
    // programs to conform to "strict" usage, meaning that all variables have to be declared,
    // etc.
    "use strict";  // will propagate to user's code, enforcing good programming habits.
    // lint, then eval
    editorUpdateHints();
    if(editor.widgets.length === 0) {
        libraryUpdateHints();
        if(library.widgets.length !== 0) {
            $('#library-problem').show().fadeOut(4000);
        }
    }
    RUR.reset_definitions();
    eval(src); // jshint ignore:line
};

RUR.compile_no_strict_js = function (src) {
    // bypass linting and does not "use strict"
    // Usually requires "no strict"; as first statement in editor
    RUR.reset_definitions();
    eval(src); // jshint ignore:line
};

RUR.compile_python = function (src) {
    // do not  "use strict" as we do not control the output produced by Brython
    // translate_python needs to be included in the html page in a Python script
    RUR.reset_definitions();
    translate_python(src); // jshint ignore:line
};
/* Author: André Roberge
   License: MIT
 */

/*jshint browser:true, devel:true, indent:4, white:false, plusplus:false */
/*globals $, editor, library, RUR, JSHINT, globals_ */

function editorUpdateHints() {
    updateHints(editor);
}

function libraryUpdateHints() {
    updateHints(library);
}
var jshint_options = {
    eqeqeq: true,
    boss: true,
    undef: true,
    curly: true,
    nonew: true,
    browser: true,
    devel: true,
    white: false,
    plusplus: false,
    jquery: true
};


function updateHints(obj) {
    if (RUR.programming_language != "javascript") {
        return;
    }
    var values, nb_lines;
    var import_lib_regex = /^\s*import_lib\s*\(\s*\);/m;
    obj.operation(function () {
        for(var i = 0; i < obj.widgets.length; ++i){
            obj.removeLineWidget(obj.widgets[i]);
        }
        obj.widgets.length = 0;

        if (obj === editor) {
            values = globals_ + editor.getValue().replace(import_lib_regex, library.getValue());
            nb_lines = library.lineCount() + 1;
            JSHINT(values, jshint_options);
        } else {
            JSHINT(globals_ + obj.getValue(), jshint_options);
            nb_lines = 2;
        }
        for(i = 0; i < JSHINT.errors.length; ++i) {
            var err = JSHINT.errors[i];
            if(!err) continue;
            var msg = document.createElement("div");
            var icon = msg.appendChild(document.createElement("span"));
            icon.innerHTML = "!?!";
            icon.className = "lint-error-icon";
            msg.appendChild(document.createTextNode(err.reason));
            msg.className = "lint-error";
            obj.widgets.push(obj.addLineWidget(err.line - nb_lines, msg, {
                coverGutter: false,
                noHScroll: true
            }));
        }
    });

    var info = obj.getScrollInfo();
    var after = obj.charCoords({line: obj.getCursor().line + 1, ch: 0}, "local").top;
    if(info.top + info.clientHeight < after) {
        obj.scrollTo(null, after - info.clientHeight + 3);
    }
}
/* Author: André Roberge
   License: MIT
 */

/*jshint browser:true, devel:true, indent:4, white:false, plusplus:false */
/*globals $, editor, library, editorUpdateHints, libraryUpdateHints, JSHINT, think, _import_library */


var RUR = RUR || {};

RUR.Controls = function (programming_language) {
    "use strict";
    RUR.programming_language = programming_language;
    var src;
    this.end_flag = true;
    this.compile_and_run = function (func) {
        var lib_src, src, fatal_error_found = false;
        if (!RUR.visible_world.compiled) {
            src = _import_library();
        }
        if (!RUR.visible_world.compiled) {
            try {
                if (RUR.programming_language === "javascript") {
                    if (src.slice(1, 10) === "no strict") {
                        RUR.compile_no_strict_js(src);
                    } else {
                        RUR.compile_javascript(src);
                    }
                    RUR.visible_world.compiled = true;
                } else if (RUR.programming_language === "python") {
                    RUR.compile_python(src);
                    RUR.visible_world.compiled = true;
                } else {
                    alert("Unrecognized programming language.");
                    fatal_error_found = true;
                }
            } catch (e) {
                if (e.name === RUR.translation.ReeborgError){
                    RUR.world.add_frame("error", e);
                } else {
                    $("#Reeborg-shouts").html("<h3>" + e.name + "</h3><h4>" + e.message + "</h4>").dialog("open");
                    fatal_error_found = true;
                    this.stop();
                }
            }
        }
        if (!fatal_error_found) {
            try {
                localStorage.setItem(RUR.settings.editor, editor.getValue());
                localStorage.setItem(RUR.settings.library, library.getValue());
            } catch (e) {}
            func();
        }
    };

    this.set_ready_to_run = function () {
        $("#stop").attr("disabled", "true");
        $("#pause").attr("disabled", "true");
        $("#run").removeAttr("disabled");
        $("#step").removeAttr("disabled");
        $("#reload").attr("disabled", "true");
  
        $("#stop2").attr("disabled", "true");
        $("#pause2").attr("disabled", "true");
        $("#run2").removeAttr("disabled");
        $("#step2").removeAttr("disabled");
        $("#reload2").attr("disabled", "true");
    };

    this.run = function () {
        $("#stop").removeAttr("disabled");
        $("#pause").removeAttr("disabled");
        $("#run").attr("disabled", "true");
        $("#step").attr("disabled", "true");
        $("#reload").attr("disabled", "true");
      
        $("#stop2").removeAttr("disabled");
        $("#pause2").removeAttr("disabled");
        $("#run2").attr("disabled", "true");
        $("#step").attr("disabled", "true");
        $("#reload2").attr("disabled", "true");
        clearTimeout(RUR.timer);
        if (RUR.world.robot_world_active) {
            RUR.controls.compile_and_run(RUR.visible_world.play_frames);
        } else {
            RUR.controls.end_flag = false;
            RUR.controls.compile_and_run(function () {});
            RUR.controls.stop();
        }
    };

    this.pause = function (ms) {
        RUR.visible_world.running = false;
        clearTimeout(RUR.timer);
        $("#pause").attr("disabled", "true");
        $("#pause2").attr("disabled", "true");
        if (ms !== undefined){
            RUR.timer = setTimeout(RUR.controls.run, ms);
        } else {
            $("#run").removeAttr("disabled");
            $("#step").removeAttr("disabled");
            $("#run2").removeAttr("disabled");
            $("#step2").removeAttr("disabled");
        }
    };

    this.step = function () {
        RUR.controls.compile_and_run(RUR.visible_world.play_single_frame);
    };

    this.stop = function () {
        clearTimeout(RUR.timer);
        $("#stop").attr("disabled", "true");
        $("#pause").attr("disabled", "true");
        $("#run").attr("disabled", "true");
        $("#step").attr("disabled", "true");
        $("#reload").removeAttr("disabled");
      
        $("#stop2").attr("disabled", "true");
        $("#pause2").attr("disabled", "true");
        $("#run2").attr("disabled", "true");
        $("#step2").attr("disabled", "true");
        $("#reload2").removeAttr("disabled");
    };

    this.reload = function() {
        RUR.visible_world.reset();
        if (RUR.editing_world){
            return;
        }
        this.set_ready_to_run();
        $("#output-pre").html("");
        $("#output-panel pre").remove(".jscode");
        RUR.world.reset();
        clearTimeout(RUR.timer);
        RUR.visible_world.compiled = false;
        RUR.visible_world.running = false;
        editorUpdateHints();
        libraryUpdateHints();
    };
};


function update_controls() {
    if ($("#world-panel").hasClass("active")){
        RUR.world.robot_world_active = true;
        $("#run2").css("visibility", "hidden");
        $("#reload2").css("visibility", "hidden");
    } else {
        $("#run2").css("visibility", "visible");
        $("#reload2").css("visibility", "visible");
        RUR.world.robot_world_active = false;
        RUR.world.reset();
    }
}

RUR.ajax_requests = {};

RUR.select_world = function (s, silent) {
    var elt = document.getElementById("select_world");

    for (var i=0; i < elt.options.length; i++){
        if (elt.options[i].text === s) {
            if (elt.options[i].selected) {
                return;
            }
            /* A new world can be selected via a user program using the
              select_world() function. When this is done, and if the
              world is changed by this selection, an alert is first
              shown and the program is otherwise not run. Executing the
              program a second time will work as the correct world will
              be displayed.
            */
            elt.value = elt.options[i].value;
            $("#select_world").change();
            if (silent) {
                return;
            }
            alert(RUR.translation["World selected"].supplant({world: s}));
            return;
        }
    }
    if (silent) {
        return;
    }
    alert(RUR.translation["Could not find world"].supplant({world: s}));
};

RUR.load_user_worlds = function () {
    var key, name, i, user_world_present;
    for (i = localStorage.length - 1; i >= 0; i--) {
        key = localStorage.key(i);
        if (key.slice(0, 11) === "user_world:") {
            name = key.slice(11);
            $('#select_world').append( $('<option style="background-color:#ff9"></option>'
                              ).val("user_world:" + name).html(name));
            user_world_present = true;
        }
    }
    if (user_world_present){
        $('#delete-world').show();
    }
};


RUR.Controls.buttons = {execute_button: '<img src="src/images/play.png" class="blue-gradient" alt="run"/>',
    reload_button: '<img src="src/images/reload.png" class="blue-gradient" alt="reload"/>',
    step_button: '<img src="src/images/step.png" class="blue-gradient" alt="step"/>',
    pause_button: '<img src="src/images/pause.png" class="blue-gradient" alt="pause"/>',
    stop_button: '<img src="src/images/stop.png" class="blue-gradient" alt="stop"/>'};

function toggle_contents_button () {
    if ($("#contents-button").hasClass("reverse-blue-gradient")) {
        RUR.tutorial_window = window.open("index_en.html", '_blank', 'location=no,height=600,width=800,scrollbars=yes,status=yes');
    } else {
        try {
            RUR.tutorial_window.close();
        }
        catch (e) {}
    }
    return false;
}

function toggle_contents_button_from_child () {
    // called when child window is closed by user
    $("#contents-button").toggleClass("blue-gradient");
    $("#contents-button").toggleClass("reverse-blue-gradient");
}

/* Author: André Roberge
   License: MIT
 */

/*jshint -W002, browser:true, devel:true, indent:4, white:false, plusplus:false */
/*globals $, RUR, editor, library, toggle_contents_button, update_controls, saveAs, toggle_editing_mode,
          save_world, delete_world*/

$(document).ready(function() {
    try {
        RUR.select_world(localStorage.getItem(RUR.settings.world), true);
    } catch (e) {
        RUR.select_world("Alone");
    }
    // init
    var child, button_closed = false;

    $("#header-child button").on("click", function(){
        var index, label, children;
        $(this).toggleClass("active");
        $(this).toggleClass("blue-gradient");
        $(this).toggleClass("reverse-blue-gradient");
        label = $(this).attr("label");

        children = $("#panels").children();
        for (index = 0; index < children.length; index++){
            child = $(children[index]);
            if (child.attr("id") === label) {
                child.toggleClass("active");
            }
        }

        if (label === "world-panel"){
            $("#world-panel").toggleClass("active");
        }  else if (label === "output-panel"){
            $("#output-panel").toggleClass("active");
        }  else if (label === "editor-panel"){
            $("#editor-panel").toggleClass("active");
        }
        
        update_controls();

    });

    $(function() {
        $("#tabs").tabs({heightStyle: "auto"});
    });

    $("#editor-link").on("click", function(){
        $("#save-library").hide();
        $("#load-library").hide();
        $("#save-editor").show();
        $("#load-editor").show();
    });
    $("#library-link").on("click", function(){
        $("#save-editor").hide();
        $("#load-editor").hide();
        $("#save-library").show();
        $("#load-library").show();
    });

    var load_file = function(obj) {
        $("#fileInput").click();
        var fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                obj.setValue(reader.result);
                fileInput.value = "";
            };
            reader.readAsText(file);	
        }); 
    };

    $("#load-editor").on("click", function(evt) {
        load_file(editor);
    });
  
    $("#load-library").on("click", function(evt) {
        load_file(library);
    });
  
    var _all_files = "";
    if (RUR.programming_language == "javascript"){
        _all_files = "*.js";
    } else if (RUR.programming_language == "python") {
        _all_files = "*.py";
    }
  
  
    $("#save-editor").on("click", function(evt) {
        var blob = new Blob([editor.getValue()], {type: "text/javascript;charset=utf-8"});
        saveAs(blob, _all_files);
    });

    $("#save-library").on("click", function(evt) {
        var blob = new Blob([library.getValue()], {type: "text/javascript;charset=utf-8"});
        saveAs(blob, _all_files);
    });
  
  
    $("#edit-world").on("click", function(evt) {
        toggle_editing_mode();
        $(this).toggleClass("blue-gradient");
        $(this).toggleClass("reverse-blue-gradient");
    });
  
    $("#save-world").on("click", function(evt) {
        var blob = new Blob([RUR.world.json_world_string], {type: "text/javascript;charset=utf-8"});
        saveAs(blob, "*.json");
    });

  
    $("#load-world").on("click", function(evt) {
        $("#worldfileInput").show();
        var fileInput = document.getElementById('worldfileInput');
        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    $("#worldfileInput").hide();
                } catch (e) {
                    alert(RUR.translation["Invalid world file."]);
                }
                fileInput.value = "";
            };
            reader.readAsText(file);	
        }); 
    });
    
    $("#memorize-world").on("click", function(evt) {
        var response = prompt("Enter world name to save");
        if (response !== null) {
            RUR.edit_world.save_world(response.trim());
            $('#delete-world').show(); 
        }
    });
    
    $("#delete-world").on("click", function(evt) {
        var response = prompt("Enter world name to delete");
        if (response !== null) {
            RUR.edit_world.delete_world(response.trim());
            $('#delete-world').show(); 
        }
    });
  
    $("#robot_canvas").on("click", function (evt) {
        if (!RUR.editing_world) {
            return;
        }
        RUR.edit_world.edit_world();
    });
    
    try {  
        var library_comment = '', library_content, editor_content;
        if (RUR.programming_language == "javascript") {
            library_comment = RUR.translation["/* Your special code goes here */\n\n"];
        } else if (RUR.programming_language == "python") {
            library_comment = RUR.translation["# Your special code goes here \n\n"];
        }
        library_content = localStorage.getItem(RUR.settings.library) || library_comment;
        library.setValue(library_content);
      
        editor_content = localStorage.getItem(RUR.settings.editor) || editor.getValue();
        editor.setValue(editor_content);
      
    } catch (e){ alert("Your browser does not support localStorage; you will not be able to save your functions in the library or your notes.");
                }

    $("#contents-button").on("click", toggle_contents_button);

    $("#help").dialog({autoOpen:false, width:800,  height:600, maximize: false, position:"top",
        beforeClose: function( event, ui ) {$("#help-button").addClass("blue-gradient").removeClass("reverse-blue-gradient");}});
  
    $("#help-button").on("click", function() {
        if ($("#help-button").hasClass("reverse-blue-gradient")) {
            $("#help").dialog("open");
        } else {
            $("#help").dialog("close");
        }
        return;
    });

    $("#Reeborg-says").dialog({minimize: false, maximize: false, autoOpen:false, width:500, position:{my: "center", at: "center", of: $("#robot_canvas")}});
    $("#Reeborg-shouts").dialog({minimize: false, maximize: false, autoOpen:false, width:500, dialogClass: "alert", position:{my: "center", at: "center", of: $("#robot_canvas")}});

    editor.widgets = [];
    library.widgets = [];

    RUR.__load_world = function(data){
        RUR.world.import_(data);
        RUR.world.reset();
        RUR.controls.reload();
    };

    // Set listener ...  (continuing below)
    $("#select_world").change(function() {
        var data, val = $(this).val();
        try {
            localStorage.setItem(RUR.settings.world, $(this).find(':selected').text());
        } catch (e) {}
          
        RUR.world.robot_world_active = true;
        if (val.substring(0,11) === "user_world:"){
            data = localStorage.getItem(val);
            RUR.__load_world(data);
        } else {
            $.get(val, function(data) {
                RUR.__load_world(data);
                // jquery is sometimes too intelligent; it can guess
                // if the imported object is a string ... or a json object
                // I need a string here;  so make sure to prevent it from identifying.
            }, "text");
        }
    });
    // ... and trigger it to load the initial world.
    $("#select_world").change();
    
    RUR.controls.set_ready_to_run();
    
    $("#robot_canvas").click(function(event) {
        RUR.mouse_x = event.clientX;
        RUR.mouse_y = event.clientY;
        console.log(RUR.mouse_x);
    })    
    
});
/*jshint  -W002,browser:true, devel:true, indent:4, white:false, plusplus:false */
/*globals $, RUR */

RUR.edit_world = {};

$("#cmd-input").keyup(function (e) {
    if (e.keyCode == 13) {
        try {
            eval($("#cmd-input").val()); // jshint ignore:line
            $("#cmd-input").val("");
        } catch (e) {
            $("#cmd-result").html(e.message);
        }
    }
});

RUR.edit_world.save_world = function (name){
    "use strict";
    if (localStorage.getItem("user_world:" + name) !== null){
        $("#Reeborg-shouts").html("Name already exist; will not save.").dialog("open");
        return;
    }
    localStorage.setItem("user_world:"+ name, RUR.world.json_world_string);
    $('#select_world').append( $('<option style="background-color:#ff9" selected="true"></option>'
                              ).val("user_world:" + name).html(name));
    $('#select_world').val("user_world:" + name);  // reload as updating select choices blanks the world.
    $("#select_world").change();
};

RUR.edit_world.delete_world = function (name){
    "use strict";
    var i, key;
    if (localStorage.getItem("user_world:" + name) === null){
        $("#Reeborg-shouts").html("No such world!").dialog("open");
        return;
    }
    localStorage.removeItem("user_world:" + name);
    $("select option[value='" + "user_world:" + name +"']").remove();
    try {
        RUR.select_world(localStorage.getItem(RUR.settings.world), true);
    } catch (e) {
        RUR.select_world("Alone");
    }
    $("#select_world").change();
    
    for (i = localStorage.length - 1; i >= 0; i--) {
        key = localStorage.key(i);
        if (key.slice(0, 11) === "user_world:") {
            return;
        }
    }
    $('#delete-world').hide();
};

RUR.edit_world.update = function (message) {
    "use strict";
    RUR.world.import_(JSON.stringify(RUR.user_world));
    RUR.world.reset();
    RUR.visible_world.reset();
    $("#cmd-result").html(message);
};


RUR.edit_world.locate_robot = function () {
    var ctx, x, y, robot={};
    x = RUR.mouse_x - $("#robot_canvas").offset().left;
    y = RUR.mouse_y - $("#robot_canvas").offset().top;

    x /= RUR.visible_world.wall_length;
    x = Math.floor(x);
    y /= RUR.visible_world.wall_length;
    y = RUR.visible_world.rows - Math.floor(y) + 1;
    if (x < 1 ) {
        x = 1;
    } else if (x > RUR.visible_world.cols) {
        x = RUR.visible_world.cols;
    }
    if (y < 1 ) {
        y = 1;
    } else if (y > RUR.visible_world.rows) {
        y = RUR.visible_world.rows;
    }
    RUR.edit_world.add_robot(x, y);
};



function remove_robot() {
    "use strict";
    delete RUR.user_world.robots;
    RUR.edit_world.update("removed robot");
}

RUR.edit_world.add_robot = function (x, y, orientation, tokens){
    "use strict";
    var robot = {};
    robot.x = x || 1;
    robot.y = y || 1;
    robot.orientation = orientation || 0;
    robot.tokens = tokens || 0;
    RUR.user_world.robots = [robot];
    RUR.edit_world.update("added or changed robot");
};

function _ensure_key_exist(obj, key){
    "use strict";
    if (obj[key] === undefined){
        obj[key] = {};
    }
}

function toggle_wall(x, y, orientation){
    "use strict";
    var index, coords;
    if (!(orientation ==="east" || orientation === "north")){
        $("#cmd-result").html("invalid orientation:" + orientation);
        return;
    }
    coords = x + "," + y;
    _ensure_key_exist(RUR.user_world, "walls");
    if (RUR.user_world.walls[coords] === undefined){
        RUR.user_world.walls[coords] = [orientation];
        RUR.edit_world.update("wall added");
    } else {
        index = RUR.user_world.walls[coords].indexOf(orientation);
        if (index === -1) {
            RUR.user_world.walls[coords].push(orientation);
            RUR.edit_world.update("wall added");
        } else {
            RUR.user_world.walls[coords].remove(index);
            if (RUR.user_world.walls[coords].length === 0){
                delete RUR.user_world.walls[coords];
                if (Object.keys(RUR.user_world.walls).length === 0){
                    delete RUR.user_world.walls;
                }
            }
            RUR.edit_world.update("wall removed");
        }
    }
}

function set_tokens(x, y, nb_tokens) {
    "use strict";
    if (RUR.user_world.shapes !== undefined && RUR.user_world.shapes[x + "," + y] !== undefined){
        $("#cmd-result").html("shape here; can't put tokens");
        return;
    }
    _ensure_key_exist(RUR.user_world, "tokens");
    if (nb_tokens > 0) {
        RUR.user_world.tokens[x + "," + y] = nb_tokens;
    } else {
        delete RUR.user_world.tokens[x + "," + y];
        if (Object.keys(RUR.user_world.tokens).length === 0){
            delete RUR.user_world.tokens;
        }
    }
    RUR.edit_world.update("updated tokens");
}

function toggle_shape(x, y, shape){
    "use strict";
    if (!(shape === "star" || shape === "square" || shape === "triangle")){
        $("#cmd-result").html("unknown shape: " + shape);
        return;
    }
    if (RUR.user_world.tokens !== undefined && RUR.user_world.tokens[x + "," + y] !== undefined){
        $("#cmd-result").html("tokens here; can't put a shape");
        return;
    }
    _ensure_key_exist(RUR.user_world, "shapes");
    if (RUR.user_world.shapes[x + "," + y] === shape) {
        delete RUR.user_world.shapes[x + "," + y];
        if (Object.keys(RUR.user_world.shapes).length === 0){
            delete RUR.user_world.shapes;
        }
    } else {
        RUR.user_world.shapes[x + "," + y] = shape;
    }
    RUR.edit_world.update("updated shapes");
}

function set_goal_position(x, y){
    "use strict";
    _ensure_key_exist(RUR.user_world, "goal");
    if (x >0  && y >0){
        RUR.user_world.goal.position = {"x": x, "y": y};
        RUR.edit_world.update("updated position goal");
    } else {
        if (RUR.user_world.goal.position !== undefined){
            delete RUR.user_world.goal.position;
            if (Object.keys(RUR.user_world.goal).length === 0){
                delete RUR.user_world.goal;
            }
        }
        RUR.edit_world.update("No position goal");
    }
}

function set_goal_orientation(orientation){
    "use strict";
    _ensure_key_exist(RUR.user_world, "goal");
    if ([0, 1, 2, 3].indexOf(orientation) !== -1){
        RUR.user_world.goal.orientation = orientation;
        RUR.edit_world.update("updated orientation goal");
    } else {
        if (RUR.user_world.goal.orientation !== undefined){
            delete RUR.user_world.goal.orientation;
            if (Object.keys(RUR.user_world.goal).length === 0){
                delete RUR.user_world.goal;
            }
        }
        RUR.edit_world.update("No orientation goal");
    }
}

function set_goal_tokens(x, y, nb_tokens){
    "use strict";
    _ensure_key_exist(RUR.user_world, "goal");
    if (RUR.user_world.goal.shapes !== undefined && RUR.user_world.goal.shapes[x + "," + y] !== undefined){
        $("#cmd-result").html("shape goal here; can't set token goal");
        return;
    }
    _ensure_key_exist(RUR.user_world.goal, "tokens");
    if (nb_tokens > 0) {
        RUR.user_world.goal.tokens[x + "," + y] = nb_tokens;
    } else {
        delete RUR.user_world.goal.tokens[x + "," + y];
        if (Object.keys(RUR.user_world.goal.tokens).length === 0){
            delete RUR.user_world.goal.tokens;
            if (Object.keys(RUR.user_world.goal).length === 0){
                delete RUR.user_world.goal;
            }
        }
    }
    RUR.edit_world.update("updated tokens goal");
}

function set_goal_no_tokens(){
    "use strict";
    _ensure_key_exist(RUR.user_world, "goal");
    RUR.user_world.goal.tokens = {};
}

function set_goal_no_shapes(){
    "use strict";
    _ensure_key_exist(RUR.user_world, "goal");
    RUR.user_world.goal.shapes = {};
}

function set_goal_wall(x, y, orientation){
    "use strict";
    var index, coords;
    if (!(orientation ==="east" || orientation === "north")){
        $("#cmd-result").html("invalid orientation:" + orientation);
        return;
    }
    coords = x + "," + y;

    if (RUR.user_world.walls !== undefined){  // there are walls...
        if (RUR.user_world.walls[coords] !== undefined) {  // at that location
            if (RUR.user_world.walls[coords].indexOf(orientation) !== -1){ // and orientation
                $("#cmd-result").html("already a wall here; pointless goal ignored");
                return;
            }
        }
    }
    _ensure_key_exist(RUR.user_world, "goal");
    _ensure_key_exist(RUR.user_world.goal, "walls");
    if (RUR.user_world.goal.walls[coords] === undefined){
        RUR.user_world.goal.walls[coords] = [orientation];
        RUR.edit_world.update("Goal wall added");
        return;
    }

    index = RUR.user_world.goal.walls[coords].indexOf(orientation);
    if (index === -1) {
        RUR.user_world.goal.walls[coords].push(orientation);
        RUR.edit_world.update("Goal wall added");
        return;
    } else {
        RUR.user_world.goal.walls[coords].remove(index);
        if (RUR.user_world.goal.walls[coords].length === 0){
            delete RUR.user_world.goal.walls[coords];
            if (Object.keys(RUR.user_world.goal.walls).length === 0){
                delete RUR.user_world.goal.walls;
                if (Object.keys(RUR.user_world.goal).length === 0){
                    delete RUR.user_world.goal;
                }
            }
        }
        RUR.edit_world.update("Goal wall removed");
    }
}

function set_goal_shape(x, y, shape){
    "use strict";
    if (!(shape === "star" || shape === "square" || shape === "triangle")){
        $("#cmd-result").html("unknown shape: " + shape);
        return;
    }
    _ensure_key_exist(RUR.user_world, "goal");
    if (RUR.user_world.goal.tokens !== undefined &&
        RUR.user_world.goal.tokens[x + "," + y] !== undefined){
        $("#cmd-result").html("tokens as a goal here; can't set a shape goal");
        return;
    }
    _ensure_key_exist(RUR.user_world.goal, "shapes");
    if (RUR.user_world.goal.shapes[x + "," + y] === shape) {
        delete RUR.user_world.goal.shapes[x + "," + y];
        if (Object.keys(RUR.user_world.goal.shapes).length === 0){
            delete RUR.user_world.goal.shapes;
            if (Object.keys(RUR.user_world.goal).length === 0){
                delete RUR.user_world.goal;
            }
        }
    } else {
        RUR.user_world.goal.shapes[x + "," + y] = shape;
    }
    RUR.edit_world.update("updated shapes");
}
/* Author: André Roberge
   License: MIT
 */

/*jshint  -W002,browser:true, devel:true, indent:4, white:false, plusplus:false */
/*globals $, RUR, add_robot */

RUR.edit_world.edit_world = function  () {
    RUR.edit_world.locate_robot();
};



function toggle_editing_mode () {
    $("#edit-world-panel").toggleClass("active");
    if (RUR.editing_world) {
        window.clearInterval(RUR._interval_id);
        RUR.editing_world = false;
        editing_world_show_others();
        RUR.visible_world.wall_color = "brown";
        RUR.visible_world.shadow_wall_color = "#f0f0f0";
        RUR.visible_world.draw_all();
    } else {
        RUR.user_world = RUR.world;
        RUR.editing_world = true;
        RUR.visible_world.wall_color = "black";
        RUR.visible_world.shadow_wall_color = "#ccd";
        RUR._interval_id = window.setInterval(refresh_world_edited, 30);
        editing_world_hide_others();
    }
}

function refresh_world_edited () {
    RUR.visible_world.draw_all();
}

function editing_world_show_others(){
    $("#contents-button").removeAttr("disabled");
    $("#help-button").removeAttr("disabled");
    $("#world-panel-button").removeAttr("disabled");
    $("#output-panel-button").removeAttr("disabled");
    $("#editor-panel-button").removeAttr("disabled");
    $("#editor-panel-button").click();
    $("#run").removeAttr("disabled");
    $("#step").removeAttr("disabled");
    $("#run2").removeAttr("disabled");
    $("#step2").removeAttr("disabled");
}

function editing_world_hide_others() {
    if ($("#editor-panel-button").hasClass("active")) {
        $("#editor-panel-button").click();
    }
    $("#editor-panel-button").attr("disabled", "true");
    if ($("#output-panel-button").hasClass("active")) {
        $("#output-panel-button").click();
    }
    $("#output-panel-button").attr("disabled", "true");
    $("#world-panel-button").attr("disabled", "true");
    $("#contents-button").attr("disabled", "true");
    $("#help-button").attr("disabled", "true");

    $("#stop").attr("disabled", "true");
    $("#pause").attr("disabled", "true");
    $("#run").attr("disabled", "true");
    $("#step").attr("disabled", "true");
    $("#reload").attr("disabled", "true");
    $("#stop2").attr("disabled", "true");
    $("#pause2").attr("disabled", "true");
    $("#run2").attr("disabled", "true");
    $("#step2").attr("disabled", "true");
    $("#reload2").attr("disabled", "true"); 
}