import {Component , createElement} from './framework.js';
import {Carousel} from './carousel';
import {Timeline} from './animation';

let d = [
    "./img/1.jpg",
    "./img/2.jpg",
    "./img/3.jpg",
]

let a = <Carousel src={d}/>

a.mountTo(document.body);

let t1 = new Timeline();

window.t1 = t1;

window.animation = new Animation({ set a(v){ console.log(v)}}, "a", 0, 100, 1000, null);
